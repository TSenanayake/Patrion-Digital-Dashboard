import { FileText, HelpCircle, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentsTab } from "@/components/admin/tabs/DocumentsTab";
import { QuestionsTab } from "@/components/admin/tabs/QuestionsTab";
import { InfoBlocksTab } from "@/components/admin/tabs/InfoBlocksTab";
import { QrCodeTab } from "@/components/admin/tabs/QrCodeTab";
import { SignaturesTab } from "@/components/admin/tabs/SignaturesTab";
import { ChemicalsTab } from "@/components/admin/tabs/ChemicalsTab";
import type { Tables } from "@/integrations/supabase/types";
import type { ExtendedDocument, DocumentSlot } from "@/components/admin/tabs/types";
import type { Question } from "@/pages/admin/AdminProjectView";
interface SignatureWithUser extends Tables<"signatures"> {
  project_users: { name: string; company: string | null; phone?: string | null } | null;
  signature_image_url?: string | null;
  device_info?: string | null;
}

interface AdminProjectTabsProps {
  activeTab: 'documents' | 'questions' | 'chemicals' | 'info' | 'qr' | 'users';
  onTabChange: (tab: 'documents' | 'questions' | 'chemicals' | 'info' | 'qr' | 'users') => void;
  projectId: string;
  projectName: string;
  slots: DocumentSlot[];
  slotDocuments: Record<string, ExtendedDocument[]>;
  uploadingSlotId: string | null;
  questions: Question[];
  infoBlocks: Tables<"info_blocks">[];
  signatures: SignatureWithUser[];
  onUpload: (slotId: string, slotType: string, file: File) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
  onRetryExtraction: (docId: string) => Promise<void>;
  onEditDoc: (docId: string | null) => void;
  onCreateInfoBlock: (content: string) => Promise<void>;
  onUpdateInfoBlock: (id: string, content: string) => Promise<void>;
  onDeleteInfoBlock: (blockId: string) => Promise<void>;
  selectedSlotId: string | null;
  onAddQuestion: () => void;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onSlotSelect: (slotId: string) => void;
}

export const AdminProjectTabs = ({
  activeTab,
  onTabChange,
  projectId,
  projectName,
  slots,
  slotDocuments,
  uploadingSlotId,
  questions,
  infoBlocks,
  signatures,
  onUpload,
  onDeleteDocument,
  onRetryExtraction,
  onEditDoc,
  onCreateInfoBlock,
  onUpdateInfoBlock,
  onDeleteInfoBlock,
  selectedSlotId,
  onAddQuestion,
  onDeleteQuestion,
  onSlotSelect,
}: AdminProjectTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as typeof activeTab)}>
      <TabsList className="mb-6 flex-wrap">
        <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4" /> Dokument</TabsTrigger>
        <TabsTrigger value="questions"><HelpCircle className="mr-2 h-4 w-4" /> Kontrollfrågor</TabsTrigger>
        <TabsTrigger value="chemicals">Kemiska produkter</TabsTrigger>
        <TabsTrigger value="info">Info-block</TabsTrigger>
        <TabsTrigger value="qr">QR-kod</TabsTrigger>
        <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Signeringar</TabsTrigger>
      </TabsList>

      <TabsContent value="documents">
        <DocumentsTab
          projectId={projectId}
          slots={slots}
          slotDocuments={slotDocuments}
          uploadingSlotId={uploadingSlotId}
          onUpload={onUpload}
          onDelete={onDeleteDocument}
          onRetry={onRetryExtraction}
          onEdit={onEditDoc}
        />
      </TabsContent>

      <TabsContent value="questions">
        <QuestionsTab
          slots={slots}
          questions={questions}
          selectedSlotId={selectedSlotId}
          selectedDocId={null}
          onAddQuestion={onAddQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onSlotSelect={onSlotSelect}
        />
      </TabsContent>

      <TabsContent value="chemicals">
        <ChemicalsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="info">
        <InfoBlocksTab
          projectId={projectId}
          infoBlocks={infoBlocks}
          onCreate={onCreateInfoBlock}
          onUpdate={onUpdateInfoBlock}
          onDelete={onDeleteInfoBlock}
        />
      </TabsContent>

      <TabsContent value="qr">
        <QrCodeTab projectId={projectId} projectName={projectName} />
      </TabsContent>

      <TabsContent value="users">
        <SignaturesTab
          projectId={projectId}
          projectName={projectName}
          signatures={signatures}
        />
      </TabsContent>
    </Tabs>
  );
};
