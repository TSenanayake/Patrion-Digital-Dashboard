import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

interface DocumentImage {
  id: string;
  image_url: string;
  image_index: number;
  image_type: string;
}

interface DocumentImageGalleryProps {
  documentId: string;
}

const DocumentImageGallery = ({ documentId }: DocumentImageGalleryProps) => {
  const [images, setImages] = useState<DocumentImage[]>([]);
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from("document_images")
        .select("*")
        .eq("document_id", documentId)
        .order("image_index");
      setImages((data as DocumentImage[]) || []);
    };
    fetchImages();
  }, [documentId]);

  if (images.length === 0) return null;

  const prev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={() => { setCurrentIndex(0); setOpen(true); }}
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Tillhörande ritningar och bilder ({images.length})
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative flex flex-col items-center justify-center min-h-[60vh]">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 rounded-full bg-background/20 p-2 text-white hover:bg-background/40"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-3 left-3 z-10 text-sm text-white/70">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/20 p-2 text-white hover:bg-background/40"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/20 p-2 text-white hover:bg-background/40"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image with pinch-zoom via CSS */}
            <div className="flex items-center justify-center w-full h-full p-4 overflow-auto">
              <img
                src={images[currentIndex]?.image_url}
                alt={`Bild ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain touch-pinch-zoom"
                style={{ touchAction: "pinch-zoom" }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentImageGallery;
