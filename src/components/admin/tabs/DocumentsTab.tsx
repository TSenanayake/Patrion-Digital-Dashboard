import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Download, Trash2, Pencil, RefreshCw, Loader2, FileUp } from "lucide-react";
import type { Document, DocumentSlot, ExtendedDocument } from "./types";

import { ConfidenceBadge } from "@/components/admin/ConfidenceBadge";

interface SlotCardProps {
  slot: DocumentSlot;
  latestDoc: Document | undefined;
  allDocs: Document[];
  isUploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (docId: string) => void;
  onRetry: (docId: string) => void;
  onEdit: (docId: string) => void;
}

export function SlotCard({
  slot,
  latestDoc,
  allDocs,
  isUploading,
  onUpload,
  onDelete,
  onRetry,
  onEdit,
}: SlotCardProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
  });

  const versions = allDocs.length;

  return (
    <Card className={`${latestDoc ? "border-primary/20" : "border-dashed"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold font-display truncate">{slot.title}</p>
          {latestDoc && (
            <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
              v{latestDoc.version_number}
            </Badge>
          )}
        </div>

        {latestDoc ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground truncate flex-1">{latestDoc.title}</p>
              <ConfidenceBadge doc={latestDoc as ExtendedDocument} />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {new Date(latestDoc.created_at).toLocaleDateString("sv-SE")}
              {versions > 1 && ` • ${versions} ver.`}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                </Button>
              </div>
              {latestDoc?.extraction_status === "success" && latestDoc?.smart_view_data && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => onEdit(latestDoc.id)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              {latestDoc?.extraction_status === "failed" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => onRetry(latestDoc.id)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              {latestDoc.original_file_url && (
                <Button variant="outline" size="sm" className="h-7 text-xs px-2" asChild>
                  <a href={latestDoc.original_file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 ml-auto"
                onClick={() => onDelete(latestDoc.id)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex items-center gap-2 rounded-md border border-dashed px-3 py-2.5 cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <FileUp className="h-4 w-4 text-muted-foreground" />
            )}
            <p className="text-xs text-muted-foreground">
              {isUploading ? "Laddar upp..." : "Ladda upp fil"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DocumentsTabProps {
  projectId: string;
  slots: DocumentSlot[];
  slotDocuments: Record<string, Document[]>;
  uploadingSlotId: string | null;
  onUpload: (slotId: string, slotType: string, file: File) => void;
  onDelete: (docId: string) => void;
  onRetry: (docId: string) => void;
  onEdit: (docId: string) => void;
}

export function DocumentsTab({
  slots,
  slotDocuments,
  uploadingSlotId,
  onUpload,
  onDelete,
  onRetry,
  onEdit,
}: DocumentsTabProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {slots.map((slot) => {
        const docs = slotDocuments[slot.id] || [];
        const latestDoc = docs.find((d) => d.is_latest);
        const isUploading = uploadingSlotId === slot.id;

        return (
          <SlotCard
            key={slot.id}
            slot={slot}
            latestDoc={latestDoc}
            allDocs={docs}
            isUploading={isUploading}
            onUpload={(file) => onUpload(slot.id, slot.slot_type, file)}
            onDelete={onDelete}
            onRetry={onRetry}
            onEdit={onEdit}
          />
        );
      })}
    </div>
  );
}
