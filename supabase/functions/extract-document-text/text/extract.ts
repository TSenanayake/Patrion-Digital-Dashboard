export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const { default: JSZip } = await import("npm:jszip@3.10.1");
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file("word/document.xml")?.async("string");
  if (!docXml) throw new Error("Could not find document.xml in DOCX");

  return docXml
    .replace(/<w:p[^>]*\/>/g, "\n")
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<w:tab[^>]*\/?>/g, "\t")
    .replace(/<w:br[^>]*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractDocxImages(buffer: ArrayBuffer, documentId: string, supabase: any): Promise<void> {
  try {
    const { default: JSZip } = await import("npm:jszip@3.10.1");
    const zip = await JSZip.loadAsync(buffer);
    const mediaFolder = zip.folder("word/media");
    if (!mediaFolder) return;

    let imageIndex = 0;
    const imageFiles: { name: string; file: any }[] = [];
    mediaFolder.forEach((relativePath, file) => {
      if (!file.dir && /\.(png|jpg|jpeg|gif|bmp|tiff)$/i.test(relativePath)) {
        imageFiles.push({ name: relativePath, file });
      }
    });

    for (const { name, file } of imageFiles) {
      try {
        const imageData = await file.async("uint8array");
        if (imageData.length < 5000) continue;

        const ext = name.split(".").pop()?.toLowerCase() || "png";
        const mimeMap: Record<string, string> = {
          png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
          gif: "image/gif", bmp: "image/bmp", tiff: "image/tiff",
        };
        const contentType = mimeMap[ext] || "image/png";
        const storagePath = `document-images/${documentId}/${imageIndex}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("documents").upload(storagePath, imageData, { contentType, upsert: true });
        if (uploadError) {
          console.error(JSON.stringify({
            level: "error",
            function: "extract-document-text",
            operation: "image-upload",
            document_id: documentId,
            storage_path: storagePath,
            error: uploadError.message || String(uploadError),
            timestamp: new Date().toISOString(),
          }));
          continue;
        }

        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(storagePath);
        await supabase.from("document_images").insert({
          document_id: documentId, image_index: imageIndex,
          image_url: urlData.publicUrl, image_type: "unknown",
        });
        imageIndex++;
      } catch (imgErr) {
        console.error(JSON.stringify({
          level: "error",
          function: "extract-document-text",
          operation: "image-processing",
          document_id: documentId,
          image_name: name,
          error: imgErr instanceof Error ? imgErr.message : String(imgErr),
          stack: imgErr instanceof Error ? imgErr.stack : undefined,
          timestamp: new Date().toISOString(),
        }));
      }
    }
  } catch (e) {
    console.error(JSON.stringify({
      level: "error",
      function: "extract-document-text",
      operation: "image-extraction",
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
  }
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    const { default: pdfParse } = await import("npm:pdf-parse@1.1.1");
    const uint8 = new Uint8Array(buffer);
    const result = await pdfParse(uint8);
    return result.text || "";
  } catch (e) {
    console.error(JSON.stringify({
      level: "error",
      function: "extract-document-text",
      operation: "pdf-parse",
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    throw new Error("Kunde inte extrahera text från PDF.");
  }
}
