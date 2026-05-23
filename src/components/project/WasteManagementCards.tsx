import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recycle, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface WasteManagementCardsProps {
  content: string[];
  searchTerm?: string;
}

interface WasteFraction {
  name: string;
  info: string;
  active: boolean;
  isDangerous: boolean;
}

function parseWasteFractions(content: string[]): { fractions: WasteFraction[]; introText: string[]; outroText: string[] } {
  const fractions: WasteFraction[] = [];
  const introText: string[] = [];
  const outroText: string[] = [];
  
  // Known waste fractions to detect
  const knownFractions: { pattern: RegExp; name: string; info: string; isDangerous: boolean }[] = [
    { pattern: /^trä\b/i, name: "Trä", info: "Träspill, virke, plywood, MDF, etc.", isDangerous: false },
    { pattern: /^plast\b/i, name: "Plast", info: "Emballage, plaströr, cellplast etc.", isDangerous: false },
    { pattern: /^metall\b/i, name: "Metall", info: "Alla sorters metall och skrot", isDangerous: false },
    { pattern: /^gips\b/i, name: "Gips", info: "Ren gipsspill och rivningsgips", isDangerous: false },
    { pattern: /^glas\b/i, name: "Glas", info: "Planglas, spegelglas etc.", isDangerous: false },
    { pattern: /^mineraliska/i, name: "Mineraliska massor", info: "Betong, tegel, klinker, keramik etc.", isDangerous: false },
    { pattern: /^wellpapp/i, name: "Wellpapp", info: "Emballage av wellpapp", isDangerous: false },
    { pattern: /^brännbart/i, name: "Brännbart", info: "Kartong (ska ej innehålla rent trä)", isDangerous: false },
    { pattern: /^el.?avfall/i, name: "El-avfall", info: "Vitvaror, komponenter, ljuskällor etc.", isDangerous: true },
    { pattern: /^farligt avfall/i, name: "Farligt avfall", info: "Sprayburkar, kemikalier, oljor etc.", isDangerous: true },
    { pattern: /^mineralull/i, name: "Mineralull", info: "Isolering", isDangerous: false },
    { pattern: /^blandat avfall/i, name: "Blandat avfall för sortering", info: "", isDangerous: false },
    { pattern: /^schaktmassor/i, name: "Schaktmassor", info: "Sten, grus, sand och jord", isDangerous: false },
  ];

  let foundFractions = false;
  let pastFractions = false;

  for (const paragraph of content) {
    const lines = paragraph.split("\n").map(l => l.trim()).filter(Boolean);
    
    for (const line of lines) {
      let matched = false;
      for (const kf of knownFractions) {
        if (kf.pattern.test(line)) {
          const isActive = /ja\s*[☒✓✔☑✅]/i.test(line) || (/\bja\b/i.test(line) && !/\bnej\s*[☒✓✔☑✅]/i.test(line));
          const isInactive = /nej\s*[☒✓✔☑✅]/i.test(line);
          fractions.push({
            name: kf.name,
            info: kf.info,
            active: isInactive ? false : isActive || !isInactive,
            isDangerous: kf.isDangerous,
          });
          foundFractions = true;
          matched = true;
          break;
        }
      }
      if (!matched && foundFractions && !lines.some(l => knownFractions.some(kf => kf.pattern.test(l)))) {
        pastFractions = true;
      }
    }
    
    if (!foundFractions) {
      // Check if entire paragraph has no fractions
      const hasFraction = lines.some(l => knownFractions.some(kf => kf.pattern.test(l)));
      if (!hasFraction) {
        introText.push(paragraph);
      }
    }
  }

  // Collect outro text (text after fractions table like "Samtliga byggpallar...")
  let afterFractions = false;
  for (const paragraph of content) {
    const lines = paragraph.split("\n").map(l => l.trim()).filter(Boolean);
    const hasFraction = lines.some(l => knownFractions.some(kf => kf.pattern.test(l)));
    if (hasFraction) {
      afterFractions = true;
      continue;
    }
    if (afterFractions) {
      // Skip header-like lines (Fraktion, Information, Aktuellt?)
      const isHeader = /^(fraktion|information|aktuellt)/i.test(paragraph.trim());
      if (!isHeader) {
        outroText.push(paragraph);
      }
    }
  }

  return { fractions, introText, outroText };
}

const WasteManagementCards = ({ content, searchTerm }: WasteManagementCardsProps) => {
  const { fractions, introText, outroText } = parseWasteFractions(content);

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm?.toLowerCase()
        ? <mark key={i} className="bg-amber-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  // Sort: active first, then dangerous first
  const sorted = [...fractions].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    if (a.isDangerous !== b.isDangerous) return a.isDangerous ? -1 : 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Intro text */}
      {introText.map((text, i) => (
        <p key={`intro-${i}`} className="text-sm leading-relaxed">
          {highlightText(text)}
        </p>
      ))}

      {/* Waste fractions as cards */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Avfallsfraktioner i projektet
          </p>
          {sorted.map((fraction, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                !fraction.active
                  ? "opacity-50 bg-muted/30"
                  : fraction.isDangerous
                    ? "border-destructive/30 bg-destructive/5"
                    : "bg-card"
              }`}
            >
              <div className="shrink-0">
                {fraction.isDangerous ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <Recycle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{highlightText(fraction.name)}</p>
                {fraction.info && (
                  <p className="text-xs text-muted-foreground">{highlightText(fraction.info)}</p>
                )}
              </div>
              <div className="shrink-0">
                {fraction.active ? (
                  <Badge variant="default" className="bg-green-600 text-white text-xs gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Ja
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <XCircle className="h-3 w-3" /> Nej
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outro text */}
      {outroText.map((text, i) => (
        <p key={`outro-${i}`} className="text-sm leading-relaxed">
          {highlightText(text)}
        </p>
      ))}

      {/* Fallback if no fractions parsed */}
      {sorted.length === 0 && introText.length === 0 && (
        <div className="space-y-3">
          {content.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed">{highlightText(p)}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default WasteManagementCards;
