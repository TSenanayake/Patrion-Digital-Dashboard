import { Block, Contact, ContactListData } from "../_shared/types.ts";
import { logError } from "../_shared/logging.ts";

const FUNCTION_NAME = "extract-document-text";

const phoneRegex = /(?:\+?\d[\d\s\-()]{6,17}\d)/;
const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

function extractTabularContacts(lines: string[]): Contact[] {
  const contacts: Contact[] = [];
  const roleKeywords = /^(bas[\s-]?[up]|platschef|projektledare|skyddsombud|arbetsledare|chef|samordnare|koordinator|projektör|handläggare|kontakt|ansvarig|ombud|entreprenör|underentreprenör|ue\b|byggherre|brandskyddsansvarig|elsäkerhetsansvarig|tillståndsansvarig)/i;

  for (const line of lines) {
    const phoneMatch = line.match(phoneRegex);
    const emailMatch = line.match(emailRegex);
    if (!phoneMatch && !emailMatch) continue;

    const phone = phoneMatch ? phoneMatch[0].trim() : undefined;
    const email = emailMatch ? emailMatch[0].trim() : undefined;

    let remaining = line;
    if (phone) remaining = remaining.replace(phone, "");
    if (email) remaining = remaining.replace(email, "");

    const parts = remaining.split(/\t|\s{2,}/).map(p => p.trim()).filter(p => p.length > 1);
    const contact: Contact = { phone, email };

    for (const part of parts) {
      if (roleKeywords.test(part) && !contact.role) {
        contact.role = part;
      } else if (!contact.name && /^[A-ZÅÄÖ][a-zåäö]+(\s+[A-ZÅÄÖ][a-zåäö]+)+$/.test(part)) {
        contact.name = part;
      } else if (!contact.company && part.length > 2) {
        if (contact.name) {
          contact.company = part;
        } else {
          const words = part.split(/\s+/);
          if (words.length >= 2 && words.length <= 4 && words.every(w => /^[A-ZÅÄÖ]/.test(w))) {
            contact.name = part;
          } else {
            contact.company = part;
          }
        }
      }
    }

    if (contact.name || contact.phone) contacts.push(contact);
  }
  return contacts;
}

function extractBlockContacts(blocks: Block[]): Contact[] {
  const contacts: Contact[] = [];
  const roleKeywords = /^(bas[\s-]?[up]|platschef|projektledare|skyddsombud|arbetsledare|chef|samordnare|koordinator|projektör|handläggare|kontakt|ansvarig|ombud|entreprenör|underentreprenör|ue\b|byggherre|brandskyddsansvarig|elsäkerhetsansvarig|tillståndsansvarig)/i;

  for (const block of blocks) {
    const lines = block.text.split("\n").map(l => l.trim()).filter(Boolean);
    const hasPhone = lines.some(l => phoneRegex.test(l));
    if (!hasPhone) continue;

    const contact: Contact = {};
    for (const line of lines) {
      const phoneMatch = line.match(phoneRegex);
      const emailMatch = line.match(emailRegex);

      if (emailMatch) {
        contact.email = emailMatch[0];
        const rest = line.replace(emailMatch[0], "").trim();
        if (rest && !contact.name) contact.name = rest;
      } else if (phoneMatch) {
        contact.phone = phoneMatch[0].trim();
        const rest = line.replace(phoneMatch[0], "").replace(/[:\-–]?\s*$/, "").replace(/^[:\-–]?\s*/, "").trim();
        if (rest && !contact.name) {
          if (roleKeywords.test(rest)) contact.role = rest;
          else contact.name = rest;
        }
      } else if (roleKeywords.test(line)) {
        contact.role = line;
      } else if (!contact.name && line.length < 50 && /^[A-ZÅÄÖ]/.test(line)) {
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 4 && words.every(w => /^[A-ZÅÄÖ]/.test(w))) {
          contact.name = line;
        } else if (!contact.company) {
          contact.company = line;
        }
      }
    }

    if (contact.name || contact.phone) contacts.push(contact);
  }
  return contacts;
}

export function extractContacts(blocks: Block[]): Contact[] {
  const allText = blocks.map(b => b.text).join("\n");
  const lines = allText.split("\n").map(l => l.trim()).filter(Boolean);

  const tabLines = lines.filter(l => l.includes("\t") || /\s{2,}/.test(l));
  if (tabLines.length >= 3) {
    const result = extractTabularContacts(lines);
    if (result.length >= 2) return result;
  }

  return extractBlockContacts(blocks);
}

export async function extractContactListWithAI(text: string): Promise<ContactListData | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return null;

  const snippet = text.substring(0, 10000);
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You extract structured contact lists from Swedish construction project documents. Return ONLY valid JSON.

RULES:
1. Detect GROUP HEADINGS: short lines (1-3 words) with no phone/email = group heading (e.g. "Entreprenör", "Kund", "Privat")
2. Each contact row with a phone or email is a contact entry
3. Extract per contact: role, company, name, mobile, email
4. Group contacts under the most recent heading
5. If no group heading found, use "Övriga" as default group
6. IGNORE company footer info, bank details, administrative metadata at bottom
7. Map the correct phone to the correct person by proximity

Return:
{
  "groups": [
    {
      "group_name": "Entreprenör",
      "contacts": [
        { "role": "Projektledare", "company": "Acme AB", "name": "John Doe", "mobile": "070-123 45 67", "email": "john@acme.se" }
      ]
    }
  ]
}

Omit empty fields. Return {"groups":[]} if nothing extractable.`
          },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-contact-list", new Error(`HTTP ${response.status}`), { status: response.status });
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "{}";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-contact-list", e);
    return null;
  }
}
