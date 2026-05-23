export function detectAndRemoveNoise(text: string): { cleaned: string; removedCount: number } {
  const lines = text.split("\n");
  let removedCount = 0;

  const chunkSize = 40;
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize));
  }

  const lineFrequency = new Map<string, number>();
  const totalChunks = Math.max(chunks.length, 1);

  for (const chunk of chunks) {
    const seen = new Set<string>();
    for (const line of chunk) {
      const normalized = line.trim().replace(/\s+/g, " ");
      if (normalized.length < 2) continue;
      if (!seen.has(normalized)) {
        seen.add(normalized);
        lineFrequency.set(normalized, (lineFrequency.get(normalized) || 0) + 1);
      }
    }
  }

  const noiseLines = new Set<string>();
  for (const [line, count] of lineFrequency) {
    if (count / totalChunks > 0.35 && totalChunks >= 3) {
      noiseLines.add(line);
    }
  }

  const noisePatterns = [
    /^Sid\.?\s*\d+(\s*\(\d+\))?$/i,
    /^Sida\s+\d+\s+(av|of)\s+\d+$/i,
    /^Page\s+\d+\s+(of|\/)\s*\d+$/i,
    /^\d+\s*\/\s*\d+$/,
    /^(Version|Reviderad|Upprättad|Godkänd|Dokumentnr|Dok\.?\s*nr)/i,
    /^\d{4}-\d{2}-\d{2}\s*\/\s*[A-Z]{1,4}$/,
    /^[A-Za-z0-9+/=]{40,}$/,
    /^[0-9a-fA-F]{16,}$/,
    /^[\x00-\x1F\x7F-\xFF]{5,}/,
    /^(image|img|rId|pic|ole|emf|wmf)\d*$/i,
    /^\d{7,}$/,
    /^[A-ZÅÄÖ]+\d{2,}$/,
  ];

  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    const normalized = trimmed.replace(/\s+/g, " ");
    if (noiseLines.has(normalized)) { removedCount++; return false; }
    for (const pat of noisePatterns) {
      if (pat.test(trimmed)) { removedCount++; return false; }
    }
    const digitsOnly = trimmed.replace(/[\s.,\-()+"]/g, "");
    if (/^\d{7,}$/.test(digitsOnly)) {
      const looksLikePhone = /^[\d\s\-+()]{8,18}$/.test(trimmed) && /[\s\-+()]/.test(trimmed);
      if (!looksLikePhone) { removedCount++; return false; }
    }
    const digitContent = trimmed.replace(/[^\d]/g, "").length;
    const nonDigitContent = trimmed.replace(/\d/g, "").trim().length;
    if (digitContent > 6 && nonDigitContent < 3) { removedCount++; return false; }
    return true;
  });

  return { cleaned: filtered.join("\n"), removedCount };
}
