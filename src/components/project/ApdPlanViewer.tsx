import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface ApdPlanViewerProps {
  fileUrl: string;
  title: string;
}

const ApdPlanViewer = ({ fileUrl, title }: ApdPlanViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPdf = fileUrl.toLowerCase().includes(".pdf");
  const lastTouchDistance = useRef<number | null>(null);

  const zoomIn = () => setScale((s) => Math.min(s * 1.3, 5));
  const zoomOut = () => setScale((s) => Math.max(s / 1.3, 0.5));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  }, [scale, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist / lastTouchDistance.current;
      setScale((s) => Math.min(Math.max(s * delta, 0.5), 5));
      lastTouchDistance.current = dist;
    } else if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    lastTouchDistance.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(Math.max(s * factor, 0.5), 5));
  }, []);

  // Reset on fullscreen toggle
  useEffect(() => {
    resetView();
  }, [fullscreen]);

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const renderContent = (isFullscreen: boolean) => {
    const height = isFullscreen ? "h-[90vh]" : "h-[65vh]";

    // For PDFs, we embed the PDF viewer for each page
    const pdfUrl = isPdf ? `${fileUrl}#page=${currentPage}` : fileUrl;

    return (
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 border-b rounded-t-lg">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          {!isFullscreen && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFullscreen(true)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          {isFullscreen && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFullscreen(false)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content area */}
        <div
          ref={containerRef}
          className={`relative ${height} overflow-hidden bg-muted/20 rounded-b-lg select-none`}
          style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default", touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {isPdf ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={title}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: "center center",
                pointerEvents: isDragging ? "none" : "auto",
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={fileUrl}
                alt={title}
                draggable={false}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          )}
        </div>

        {/* Page navigation for multi-page PDFs */}
        {isPdf && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 py-2 bg-muted/50 border-t">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevPage} disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium">
              Sida {currentPage} av {totalPages}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextPage} disabled={currentPage >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        {renderContent(false)}
      </div>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-2 bg-background">
          {renderContent(true)}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApdPlanViewer;
