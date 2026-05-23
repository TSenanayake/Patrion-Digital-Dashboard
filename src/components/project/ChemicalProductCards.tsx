import React, { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChemicalProduct {
  id: string;
  product_name: string;
  manufacturer?: string | null;
  hazard_code?: string | null;
  has_safety_datasheet: boolean;
  safety_datasheet_url?: string | null;
  storage_location?: string | null;
  first_delivery_date?: string | null;
  built_in_date?: string | null;
  finished_date?: string | null;
  environmental_class?: string | null;
}

const hazardIcons: Record<string, { emoji: string; label: string }> = {
  GHS01: { emoji: "💥", label: "Explosivt" },
  GHS02: { emoji: "🔥", label: "Brandfarligt" },
  GHS03: { emoji: "🔥", label: "Oxiderande" },
  GHS04: { emoji: "🫧", label: "Gas under tryck" },
  GHS05: { emoji: "⚗️", label: "Frätande" },
  GHS06: { emoji: "☠️", label: "Giftigt" },
  GHS07: { emoji: "⚠️", label: "Skadligt" },
  GHS08: { emoji: "🫁", label: "Hälsofarligt" },
  GHS09: { emoji: "🌿", label: "Miljöfarligt" },
};

const envClassColors: Record<string, string> = {
  BASTA: "bg-green-100 text-green-800 border-green-300",
  "BVB accepterad": "bg-blue-100 text-blue-800 border-blue-300",
  REACH: "bg-amber-100 text-amber-800 border-amber-300",
  "Ej klassad": "bg-muted text-muted-foreground border-border",
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "–";
  return new Date(dateStr).toLocaleDateString("sv-SE");
}

export default function ChemicalProductCards({ products }: { products: ChemicalProduct[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Inga kemiska produkter registrerade i projektet.
        </p>
      </div>
    );
  }

  // Sort: products with hazard code first
  const sorted = [...products].sort((a, b) => {
    const aHas = a.hazard_code ? 0 : 1;
    const bHas = b.hazard_code ? 0 : 1;
    return aHas - bHas;
  });

  return (
    <div className="space-y-2">
      {sorted.map((product) => {
        const isExpanded = expandedId === product.id;
        const hazard = product.hazard_code ? hazardIcons[product.hazard_code] : null;
        const envClass = product.environmental_class;
        const envColor = envClass ? envClassColors[envClass] || envClassColors["Ej klassad"] : null;

        return (
          <div
            key={product.id}
            className="rounded-lg border bg-card overflow-hidden"
          >
            {/* Collapsed row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : product.id)}
              className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="text-lg">🧪</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{product.product_name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {hazard && (
                    <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
                      <span>{hazard.emoji}</span> {product.hazard_code}
                    </span>
                  )}
                  {envClass && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${envColor}`}>
                      <Leaf className="h-2.5 w-2.5 mr-0.5" />
                      {envClass}
                    </Badge>
                  )}
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t px-4 py-3 space-y-2.5 bg-muted/20">
                <DetailRow label="Tillverkare" value={product.manufacturer} />
                <DetailRow
                  label="Säkerhetsdatablad"
                  value={product.has_safety_datasheet ? "✔ Finns" : "✘ Saknas"}
                />
                <DetailRow label="Förvaringsplats" value={product.storage_location} />
                <DetailRow label="Farokod" value={product.hazard_code} />
                <DetailRow label="Första leverans" value={formatDate(product.first_delivery_date)} />
                <DetailRow label="Byggs in" value={formatDate(product.built_in_date)} />
                <DetailRow label="Färdiganvänd" value={formatDate(product.finished_date)} />
                <DetailRow
                  label="Miljöklassning"
                  value={envClass ? `✔ ${envClass}` : "–"}
                />

                {product.has_safety_datasheet && product.safety_datasheet_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-2"
                    onClick={() => window.open(product.safety_datasheet_url!, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Öppna säkerhetsdatablad
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value || "–"}</span>
    </div>
  );
}
