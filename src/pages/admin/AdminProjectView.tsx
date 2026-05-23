import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { QuestionDialog } from "@/components/admin/tabs/QuestionDialog";
import { DocumentEditDialog } from "@/components/admin/tabs/DocumentEditDialog";
import { ProjectStats } from "@/components/admin/tabs/ProjectStats";
import { useProject } from "@/hooks/queries/useProject";
import { useSlots } from "@/hooks/queries/useSlots";
import { useInfoBlocks, useCreateInfoBlock, useUpdateInfoBlock, useDeleteInfoBlock } from "@/hooks/queries/useInfoBlocks";
import { useSignatures } from "@/hooks/queries/useSignatures";
import { useQueryClient } from "@tanstack/react-query";
import { uploadDocument, retryExtraction, deleteDocument } from "@/lib/admin/upload";
import { getQrUrl } from "@/lib/admin/qr";
import { AdminProjectHeader } from "@/components/admin/AdminProjectHeader";
import { AdminProjectTabs } from "@/components/admin/AdminProjectTabs";
import { useQuestionForm } from "@/hooks/useQuestionForm";
import type { Tables } from "@/integrations/supabase/types";
import type { ExtendedDocument, DocumentSlot } from "@/components/admin/tabs/types";

type Question = Tables<"questions">;

interface SignatureWithUser extends Tables<"signatures"> {
  project_users: { name: string; company: string | null; phone?: string | null } | null;
  signature_image_url?: string | null;
  device_info?: string | null;
}

const AdminProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project } = useProject(projectId);
  const { data: slotsData } = useSlots(projectId);
  const slots = slotsData?.slots || [];
  const slotDocuments = slotsData?.documents || {};
  const questions = slotsData?.questions || [];
  const { data: infoBlocks = [] } = useInfoBlocks(projectId);
  const { data: signatures = [] } = useSignatures(projectId);

  const createInfoBlock = useCreateInfoBlock();
  const updateInfoBlock = useUpdateInfoBlock();
  const deleteInfoBlock = useDeleteInfoBlock();

  const [activeTab, setActiveTab] = useState<'documents' | 'questions' | 'chemicals' | 'info' | 'qr' | 'users'>('documents');
  const [uploadingSlotId, setUploadingSlotId] = useState<string | null>(null);
  const [editDocId, setEditDocId] = useState<string | null>(null);

  const {
    questionDialogOpen,
    setQuestionDialogOpen,
    questionForm,
    setQuestionForm,
    selectedSlotId,
    setSelectedSlotId,
    handleQuestionSubmit,
    handleDeleteQuestion,
  } = useQuestionForm();

  const allDocs = Object.values(slotDocuments).flat() as ExtendedDocument[];
  const totalDocs = allDocs.filter(d => d.is_latest).length;
  const qrUrl = getQrUrl(projectId || "");

  if (!project) return <div className="flex items-center justify-center min-h-screen"><p>Laddar...</p></div>;

  const handleSlotUpload = async (slotId: string, slotType: string, file: File) => {
    setUploadingSlotId(slotId);
    try {
      const result = await uploadDocument(supabase, projectId!, slotId, slotType, file, slotDocuments);
      if (!result.success) {
        toast.error(`Fel vid uppladdning: ${result.error}`);
        return;
      }
      toast.success("Dokument uppladdat! Smart vy genereras...");
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Uppladdning misslyckades");
    } finally {
      setUploadingSlotId(null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    const result = await deleteDocument(supabase, docId, queryClient);
    if (!result.success) {
      toast.error(result.error || "Fel vid borttagning");
      return;
    }
    toast.success("Dokument borttaget!");
  };

  const handleRetryExtraction = async (docId: string) => {
    await retryExtraction(supabase, docId, queryClient);
    toast.info("Smart vy genereras...");
  };

  const handleCreateInfoBlock = async (content: string) => {
    try {
      await createInfoBlock.mutateAsync({ projectId: projectId!, content, sortOrder: infoBlocks.length });
      toast.success("Informationsblock skapat!");
    } catch (err: any) {
      toast.error(err.message || "Fel vid skapande");
    }
  };

  const handleUpdateInfoBlock = async (id: string, content: string) => {
    try {
      await updateInfoBlock.mutateAsync({ id, content });
      toast.success("Informationsblock uppdaterat!");
    } catch (err: any) {
      toast.error(err.message || "Fel vid uppdatering");
    }
  };

  const handleDeleteInfoBlock = async (blockId: string) => {
    try {
      await deleteInfoBlock.mutateAsync(blockId);
      toast.success("Informationsblock borttaget!");
    } catch (err: any) {
      toast.error(err.message || "Fel vid borttagning");
    }
  };

  const previewUrl = `${window.location.origin}/project/${projectId}?preview=true`;

  return (
    <div className="min-h-screen bg-background">
      <AdminProjectHeader
        project={project}
        projectId={projectId!}
        qrUrl={qrUrl}
        previewUrl={previewUrl}
        onBack={() => navigate("/admin")}
      />

      <main className="container py-8">
        <ProjectStats
          totalDocs={totalDocs}
          slotsCount={slots.length}
          questionsCount={questions.length}
          signaturesCount={signatures.length}
        />

        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <QRCodeSVG id="qr-code-hidden" value={qrUrl} size={512} level="H" />
        </div>

        <AdminProjectTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          projectId={projectId!}
          projectName={project?.name || ""}
          slots={slots as DocumentSlot[]}
          slotDocuments={slotDocuments}
          uploadingSlotId={uploadingSlotId}
          questions={questions as Question[]}
          infoBlocks={infoBlocks as Tables<"info_blocks">[]}
          signatures={signatures as SignatureWithUser[]}
          onUpload={handleSlotUpload}
          onDeleteDocument={handleDeleteDocument}
          onRetryExtraction={handleRetryExtraction}
          onEditDoc={setEditDocId}
          onCreateInfoBlock={handleCreateInfoBlock}
          onUpdateInfoBlock={handleUpdateInfoBlock}
          onDeleteInfoBlock={handleDeleteInfoBlock}
          selectedSlotId={selectedSlotId}
          onAddQuestion={() => { setSelectedSlotId(null); setQuestionDialogOpen(true); }}
          onDeleteQuestion={handleDeleteQuestion}
          onSlotSelect={(slotId) => { setSelectedSlotId(slotId); setQuestionDialogOpen(true); }}
        />
      </main>

      <QuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        slots={slots as DocumentSlot[]}
        selectedSlotId={selectedSlotId}
        selectedDocId={null}
        questionForm={questionForm}
        setQuestionForm={setQuestionForm}
        onSubmit={handleQuestionSubmit}
      />

      <DocumentEditDialog
        editDocId={editDocId}
        allDocs={allDocs}
        onClose={() => setEditDocId(null)}
        onSaved={() => { setEditDocId(null); queryClient.invalidateQueries({ queryKey: ['slots'] }); }}
      />
    </div>
  );
};

export default AdminProjectView;
