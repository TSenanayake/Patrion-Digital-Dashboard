export function isTocBlock(block: string): boolean {
  const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 3) return false;
  const firstLine = lines[0].toLowerCase();
  if (/^(innehåll|innehållsförteckning|table\s+of\s+contents|contents)$/i.test(firstLine)) return true;

  let linesEndingWithNumber = 0;
  for (const line of lines) {
    const tokens = line.split(/\s+/);
    if (/^\d{1,3}$/.test(tokens[tokens.length - 1])) linesEndingWithNumber++;
  }
  if (linesEndingWithNumber / lines.length > 0.5 && lines.length >= 4) return true;

  let dottedLeaders = 0;
  for (const line of lines) {
    if (/\.{3,}\s*\d+\s*$/.test(line)) dottedLeaders++;
  }
  if (dottedLeaders >= 3) return true;
  return false;
}
