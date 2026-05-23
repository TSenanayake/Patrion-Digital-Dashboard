// Retention Purge Edge Function
// Scheduled daily via pg_cron: 0 3 * * *
// Requires admin JWT for invocation

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.substring(7);
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (user.app_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: "Forbidden - admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { dry_run } = await req.json();
    const isDryRun = dry_run === true;

    const { data: projects, error: projectsError } = await supabaseAdmin
      .from("projects")
      .select("id, name, settings, end_date");

    if (projectsError) {
      console.error(JSON.stringify({
        level: "error",
        function: "retention-purge",
        operation: "fetch-projects",
        error: projectsError.message,
        timestamp: new Date().toISOString(),
      }));
      throw projectsError;
    }

    const now = new Date();
    const purgedProjects: {
      id: string;
      name: string;
      cutoffDate: string;
      retentionYears: number;
      userIdsDeleted: number;
      recordsDeleted: {
        signatures: number;
        documentReads: number;
        questionAnswers: number;
        projectUsers: number;
      };
    }[] = [];

    for (const project of projects || []) {
      const settings = project.settings || {};
      const retentionYears = settings.retention_years || 2;

      if (!project.end_date) {
        continue;
      }

      const endDate = new Date(project.end_date);
      const cutoffDate = new Date(endDate);
      cutoffDate.setFullYear(cutoffDate.getFullYear() + retentionYears);

      if (cutoffDate > now) {
        continue;
      }

      const { data: expiredSignatures } = await supabaseAdmin
        .from("signatures")
        .select("user_id")
        .eq("project_id", project.id)
        .lt("signed_at", cutoffDate.toISOString());

      const userIds = [...new Set((expiredSignatures || []).map(s => s.user_id))];

      if (userIds.length === 0) {
        continue;
      }

      const [sigCount, readCount, answerCount, userCount] = await Promise.all([
        supabaseAdmin.from("signatures").select("id", { count: "exact", head: true })
          .eq("project_id", project.id).in("user_id", userIds),
        supabaseAdmin.from("document_reads").select("id", { count: "exact", head: true })
          .in("user_id", userIds),
        supabaseAdmin.from("question_answers").select("id", { count: "exact", head: true })
          .in("user_id", userIds),
        supabaseAdmin.from("project_users").select("id", { count: "exact", head: true })
          .in("id", userIds),
      ]);

      const recordsToDelete = {
        signatures: sigCount.count || 0,
        documentReads: readCount.count || 0,
        questionAnswers: answerCount.count || 0,
        projectUsers: userCount.count || 0,
      };

      if (!isDryRun) {
        await supabaseAdmin.from("question_answers").delete().in("user_id", userIds);
        await supabaseAdmin.from("document_reads").delete().in("user_id", userIds);
        await supabaseAdmin.from("signatures").delete().eq("project_id", project.id).in("user_id", userIds);
        await supabaseAdmin.from("project_users").delete().in("id", userIds);
      }

      purgedProjects.push({
        id: project.id,
        name: project.name,
        cutoffDate: cutoffDate.toISOString(),
        retentionYears,
        userIdsDeleted: userIds.length,
        recordsDeleted: recordsToDelete,
      });

      console.log(JSON.stringify({
        level: "info",
        function: "retention-purge",
        operation: isDryRun ? "dry-run" : "purge",
        projectId: project.id,
        projectName: project.name,
        userIdsDeleted: userIds.length,
        recordsDeleted: recordsToDelete,
        timestamp: new Date().toISOString(),
      }));
    }

    const totalRecordsDeleted = purgedProjects.reduce((sum, p) =>
      sum + p.recordsDeleted.signatures + p.recordsDeleted.documentReads +
         p.recordsDeleted.questionAnswers + p.recordsDeleted.projectUsers, 0);

    return new Response(JSON.stringify({
      success: true,
      dryRun: isDryRun,
      purgedProjects,
      summary: {
        projectsPurged: purgedProjects.length,
        totalRecordsDeleted,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error(JSON.stringify({
      level: "error",
      function: "retention-purge",
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
