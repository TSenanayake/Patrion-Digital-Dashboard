import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentSectionEditor from "@/components/admin/DocumentSectionEditor";
import SafetyOrgContactEditor from "@/components/admin/SafetyOrgContactEditor";
import EmergencyContactEditor from "@/components/admin/EmergencyContactEditor";
import ContactListEditor from "@/components/admin/ContactListEditor";
import EmergencyChecklistEditor from "@/components/admin/EmergencyChecklistEditor";
import type { ExtendedDocument } from "./types";

interface DocumentEditDialogProps {
  editDocId: string | null;
  allDocs: ExtendedDocument[];
  onClose: () => void;
  onSaved: () => void;
}

export function DocumentEditDialog({ editDocId, allDocs, onClose, onSaved }: DocumentEditDialogProps) {
  if (!editDocId) return null;

  const editDoc = allDocs.find((d) => d.id === editDocId);
  const svData = editDoc?.smart_view_data;
  const isSafetyOrg = svData?.category === "skyddsorganisation";
  const isEmergency = svData?.category === "nodsituation";
  const isContactList = svData?.category === "kontaktlista";
  const isChecklistaNodlage = svData?.category === "checklista_nodlage";

  return (
    <Dialog open={!!editDocId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isSafetyOrg
              ? "Redigera skyddsorganisation"
              : isEmergency
              ? "Redigera nödsituation"
              : isContactList
              ? "Redigera kontaktlista"
              : isChecklistaNodlage
              ? "Redigera checklista nödläge"
              : "Redigera sektioner"}{" "}
            – {editDoc?.title}
          </DialogTitle>
        </DialogHeader>
        {svData ? (
          isSafetyOrg ? (
            <SafetyOrgContactEditor
              documentId={editDocId}
              smartViewData={svData}
              onSaved={onSaved}
            />
          ) : isEmergency ? (
            <EmergencyContactEditor
              documentId={editDocId}
              smartViewData={svData}
              onSaved={onSaved}
            />
          ) : isContactList ? (
            <ContactListEditor
              documentId={editDocId}
              smartViewData={svData}
              onSaved={onSaved}
            />
          ) : isChecklistaNodlage ? (
            <EmergencyChecklistEditor
              documentId={editDocId}
              smartViewData={svData}
              onSaved={onSaved}
            />
          ) : (
            <DocumentSectionEditor
              documentId={editDocId}
              smartViewData={svData}
              onSaved={onSaved}
            />
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
