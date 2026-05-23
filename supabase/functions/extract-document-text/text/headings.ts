export function headingScore(line: string, hasFollowingContent: boolean, isStandaloneOrFirst: boolean): number {
  const trimmed = line.trim();
  if (trimmed.length === 0) return 0;
  if (/^[\d\s.,\-:;()/\\]+$/.test(trimmed)) return 0;
  if (/^\d+\s+\S.*\d+\(\d+\)$/.test(trimmed)) return 0;

  if (trimmed.endsWith("!") || trimmed.endsWith("?")) return 0;

  const knownNonHeadings = [
    /utbildningen\s+är\s+obligatorisk/i,
    /^\d{1,2}[.:]\d{2}\s*[–\-]\s*\d{1,2}[.:]\d{2}$/,
  ];
  for (const pat of knownNonHeadings) {
    if (pat.test(trimmed)) return 0;
  }

  const words = trimmed.split(/\s+/);

  if (trimmed.endsWith(".") && words.length > 4) return 0;

  const sentenceVerbs = /\b(är|ska|skall|sker|kräver|medför|innebär|tillhandahålls|finns|gäller|görs|får|kan|bör|måste)\b/i;
  if (words.length > 4 && sentenceVerbs.test(trimmed)) return 0;

  let score = 0;
  if (trimmed.length < 80) score++;
  if (words.length < 6) score++;
  if (!trimmed.endsWith(".") || /^\d+(\.\d+)*\.\s*$/.test(trimmed) || /^\d+\.\s+\S/.test(trimmed)) score++;

  const isNumbered = /^\d+(\.\d+)*\.?\s+\S/.test(trimmed) && trimmed.length <= 60;
  const isAllCaps = trimmed === trimmed.toUpperCase() && trimmed.length >= 3 && /[A-ZÅÄÖ]{2,}/.test(trimmed);
  const isTitleCase = words.length >= 2 && words.length <= 10 &&
    words.filter(w => w.length > 0 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase()).length === words.length;
  const endsWithColon = trimmed.endsWith(":") && trimmed.length <= 60;
  if (isNumbered || isAllCaps || isTitleCase || endsWithColon) score++;

  if (hasFollowingContent) score++;
  if (isStandaloneOrFirst) score++;

  return score;
}

export function isHeading(line: string, hasFollowingContent = true, isStandaloneOrFirst = true): boolean {
  return headingScore(line, hasFollowingContent, isStandaloneOrFirst) >= 3;
}
