import { useState } from "react";
import { MessageCircle, X, Phone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectSettings } from "@/lib/projectConfig";

interface SupportButtonProps {
  projectId?: string;
}

const SupportButton = ({ projectId }: SupportButtonProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: settings } = useProjectSettings(projectId);
  const phone = settings?.supportPhone || '+46 10 123 4567';
  const displayPhone = phone.replace(/[^0-9]/g, '').startsWith('46') 
    ? '0' + phone.replace(/[^0-9]/g, '').slice(2).replace(/(\d{3})(\d{2})(\d{2})/, '$1-$2 $3')
    : phone;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(phone.replace(/[^0-9]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hej! Jag behöver hjälp med Digital Arbetstavla.`;
  const smsLink = `sms:+${phone.replace(/[^0-9]/g, '')}?body=Hej! Jag behöver hjälp med Digital Arbetstavla.`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="mb-2 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 bg-card rounded-xl shadow-xl border p-4 min-w-[220px]">
          <p className="text-xs text-muted-foreground font-medium mb-1">Kontakta support</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-base font-semibold tracking-wide text-foreground hover:bg-accent transition-colors cursor-pointer"
            title="Kopiera nummer"
          >
            <Phone className="h-4 w-4 text-primary shrink-0" />
            <span>{displayPhone}</span>
            {copied ? (
              <Check className="h-4 w-4 text-green-600 ml-auto shrink-0" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
            )}
          </button>
          <div className="flex gap-2 mt-1">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full gap-2 justify-center">
                <MessageCircle className="h-4 w-4 text-green-600" />
                WhatsApp
              </Button>
            </a>
            <a href={smsLink} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-2 justify-center">
                <Phone className="h-4 w-4 text-primary" />
                SMS
              </Button>
            </a>
          </div>
        </div>
      )}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setOpen(!open)}
        aria-label="Support"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default SupportButton;
