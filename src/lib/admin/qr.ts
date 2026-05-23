export function downloadQrCode(projectId: string, projectName: string): void {
  const qrUrl = `${window.location.origin}/project/${projectId}`;
  const svg = document.getElementById("qr-code-hidden") || document.getElementById("qr-code");
  if (!svg) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    canvas.width = 512;
    canvas.height = 512;
    ctx!.fillStyle = "white";
    ctx!.fillRect(0, 0, 512, 512);
    ctx!.drawImage(img, 0, 0, 512, 512);
    const a = document.createElement("a");
    a.download = `qr-${projectName || "project"}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}

export function getQrUrl(projectId: string): string {
  return `${window.location.origin}/project/${projectId}`;
}
