import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat, FileText, FolderOpen } from "lucide-react";
import { useProject } from "@/hooks/queries";

const ProjectEntry = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const [hasSigned, setHasSigned] = useState(false);

  const { data: project, isLoading } = useProject(projectId);

  useEffect(() => {
    if (projectId) {
      const signedProjects = JSON.parse(localStorage.getItem("signed_projects") || "{}");
      setHasSigned(!!signedProjects[projectId]);
    }
  }, [projectId]);

  useEffect(() => {
    if (isPreview && projectId) {
      navigate(`/project/${projectId}/read?preview=true`, { replace: true });
    }
  }, [isPreview, projectId, navigate]);

  const handleStart = () => {
    navigate(`/project/${projectId}/read`);
  };

  const handleGoToWorkspace = () => {
    navigate(`/project/${projectId}/workspace`);
  };

  if (isLoading || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Laddar projekt...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary">
            <HardHat className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">{project.name}</CardTitle>
          {project.company && <p className="text-sm text-muted-foreground">{project.company}</p>}
          {project.address && <p className="text-xs text-muted-foreground">📍 {project.address}</p>}
        </CardHeader>
        <CardContent className="space-y-3">
          {hasSigned ? (
            <>
              <Button onClick={handleGoToWorkspace} className="w-full gap-2" size="lg">
                <FolderOpen className="h-5 w-5" /> Visa dokument
              </Button>
              <Button onClick={handleStart} variant="outline" className="w-full gap-2" size="lg">
                <FileText className="h-5 w-5" /> Ny registrering
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Du har redan registrerat dig på denna arbetsplats
              </p>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground">
                Läs igenom KMA dokument och verifiera att du läst
              </p>
              <Button onClick={handleStart} className="w-full gap-2" size="lg">
                <FileText className="h-5 w-5" /> Starta
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectEntry;
