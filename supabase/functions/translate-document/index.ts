import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const languageNames: Record<string, string> = {
  en: "English",
  pl: "Polish",
  es: "Spanish",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { document_id, language, smart_view_data, extracted_text, questions } = await req.json();

    if (!document_id || !language) {
      return new Response(JSON.stringify({ error: "Missing document_id or language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Swedish = original, no translation needed
    if (language === "sv") {
      return new Response(JSON.stringify({ translated: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache first
    const { data: cached } = await supabase
      .from("document_translations")
      .select("translated_sections, translated_questions")
      .eq("document_id", document_id)
      .eq("language", language)
      .maybeSingle();

    // If cached and we're not sending new questions to translate, return cache
    const hasNewQuestions = questions?.length > 0;
    const cachedHasQuestions = cached?.translated_questions && (cached.translated_questions as any[]).length > 0;

    if (cached && (!hasNewQuestions || cachedHasQuestions)) {
      return new Response(JSON.stringify({
        translated: true,
        translated_sections: cached.translated_sections,
        translated_questions: cached.translated_questions,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build text to translate
    const targetLang = languageNames[language] || language;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare content for translation
    let contentToTranslate = "";

    if (smart_view_data?.sections?.length > 0) {
      const sections = smart_view_data.sections.map((s: any, i: number) => {
        const contentStr = (s.content || []).join("\n");
        return `[SECTION ${i}]\nTITLE: ${s.title}\nCONTENT:\n${contentStr}`;
      }).join("\n\n---\n\n");
      contentToTranslate = sections;
    } else if (extracted_text) {
      contentToTranslate = `[SECTION 0]\nTITLE: Document\nCONTENT:\n${extracted_text}`;
    }

    // Prepare questions
    let questionsToTranslate = "";
    if (questions?.length > 0) {
      questionsToTranslate = questions.map((q: any, i: number) => {
        let text = `[QUESTION ${i}]\nTEXT: ${q.question_text}`;
        if (q.options) {
          text += `\nOPTIONS: ${JSON.stringify(q.options)}`;
        }
        return text;
      }).join("\n\n");
    }

    const systemPrompt = `You are a professional translator specializing in construction site safety documentation. Translate the following content from Swedish to ${targetLang}.

CRITICAL RULES:
- This is safety-critical information for construction workers. Accuracy is paramount.
- Respond ONLY with valid JSON. No explanations, no markdown formatting.
- JSON structure: {"sections": [{"title": "...", "content": ["line1", "line2", ...]}], "questions": [{"index": 0, "question_text": "...", "options": [...]}]}
- Do NOT translate proper nouns, company names, phone numbers, email addresses, or codes
- Preserve technical terms that are commonly used in their original form
- Keep numbered lists and bullet points in their original structure
- Translate "Sant" to the equivalent of "True" and "Falskt" to "False" in the target language`;

    const userContent = contentToTranslate + (questionsToTranslate ? `\n\n===QUESTIONS===\n\n${questionsToTranslate}` : "");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + "\n\nIMPORTANT: Respond with valid JSON only. No markdown code blocks." },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error(JSON.stringify({
        level: "error",
        function: "translate-document",
        document_id,
        language,
        error: `AI gateway error: ${response.status}`,
        details: t.substring(0, 500),
        timestamp: new Date().toISOString(),
      }));
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const translatedText = aiResult.choices?.[0]?.message?.content || "";

    let translatedSections: any[] = [];
    let translatedQuestions: any[] = [];

    let jsonStr = translatedText;
    if (translatedText.includes("```json")) {
      jsonStr = translatedText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (translatedText.includes("```")) {
      jsonStr = translatedText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
    }

    try {
      const parsed = JSON.parse(jsonStr);

      if (parsed.sections && Array.isArray(parsed.sections)) {
        translatedSections = parsed.sections.map((s: any) => ({
          title: s.title || "Untitled",
          content: Array.isArray(s.content) ? s.content : [s.content || ""],
        }));
      }

      if (parsed.questions && Array.isArray(parsed.questions)) {
        translatedQuestions = parsed.questions.map((q: any, i: number) => ({
          index: q.index ?? i,
          question_text: q.question_text || "",
          options: q.options,
        }));
      }
    } catch (parseError) {
      console.error(JSON.stringify({
        level: "warn",
        function: "translate-document",
        operation: "json-parse-fallback",
        document_id: document_id,
        language: language,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      }));

      const sectionRegex = /\[SECTION\s*(\d+)\]\s*\n\s*TITLE:\s*(.*?)\n\s*CONTENT:\s*\n([\s\S]*?)(?=\n\s*---|\n\s*\[SECTION|\n\s*===QUESTIONS===|$)/gi;
      let match;
      while ((match = sectionRegex.exec(translatedText)) !== null) {
        const content = match[3].trim().split("\n").filter((l: string) => l.trim());
        if (match[2].trim() || content.length > 0) {
          translatedSections.push({
            title: match[2].trim(),
            content,
          });
        }
      }

      if (translatedSections.length === 0 && translatedText.trim()) {
        const questionsIdx = translatedText.indexOf("===QUESTIONS===");
        const docPart = questionsIdx > -1 ? translatedText.substring(0, questionsIdx) : translatedText;
        translatedSections.push({
          title: "Document",
          content: docPart.trim().split("\n").filter((l: string) => l.trim()),
        });
      }

      const questionsPartIdx = translatedText.indexOf("===QUESTIONS===");
      if (questionsPartIdx > -1) {
        const questionsPart = translatedText.substring(questionsPartIdx);
        const qRegex = /\[QUESTION (\d+)\]\nTEXT:\s*(.*?)(?:\nOPTIONS:\s*(.*?))?(?=\n\n\[QUESTION|\n*$)/gs;
        let qMatch;
        while ((qMatch = qRegex.exec(questionsPart)) !== null) {
          const q: any = {
            index: parseInt(qMatch[1]),
            question_text: qMatch[2].trim(),
          };
          if (qMatch[3]) {
            try {
              q.options = JSON.parse(qMatch[3].trim());
            } catch { /* keep original options */ }
          }
          translatedQuestions.push(q);
        }
      }
    }

    // Merge with existing cache if we only translated questions this time
    const finalSections = translatedSections.length > 0 ? translatedSections : (cached?.translated_sections || []);
    const finalQuestions = translatedQuestions.length > 0 ? translatedQuestions : (cached?.translated_questions || []);

    // Cache the translation
    await supabase.from("document_translations").upsert({
      document_id,
      language,
      translated_sections: finalSections,
      translated_questions: finalQuestions,
    }, { onConflict: "document_id,language" });

    return new Response(JSON.stringify({
      translated: true,
      translated_sections: finalSections,
      translated_questions: finalQuestions,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(JSON.stringify({
      level: "error",
      function: "translate-document",
      document_id,
      language,
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
