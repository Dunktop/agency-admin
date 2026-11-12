import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { AGREEMENT_SECTIONS, AGREEMENT_TITLE } from "@/lib/agreement";

const buildPdf = async () => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const bottom = doc.internal.pageSize.getHeight() - 56;
  let y = 64;

  const ensure = (needed) => {
    if (y + needed <= bottom) return;
    doc.addPage();
    y = 64;
  };
  const line = (color) => {
    doc.setDrawColor(color);
    doc.line(margin, y, margin + width, y);
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text("AGENCY ADMIN", margin, y);
  y += 24;

  doc.setFontSize(20);
  doc.setTextColor(20);
  doc.text(AGREEMENT_TITLE, margin, y);
  y += 12;
  line(190);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(110);
  doc.text(
    new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    margin,
    y
  );
  y += 22;
  doc.setTextColor(30);

  for (const section of AGREEMENT_SECTIONS) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    const heading = doc.splitTextToSize(section.title, width);
    ensure(heading.length * 14 + 8);
    doc.text(heading, margin, y);
    y += heading.length * 14 + 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const paragraph of section.body) {
      const lines = doc.splitTextToSize(paragraph, width);
      ensure(lines.length * 13 + 10);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 8;
    }
    y += 6;
  }

  ensure(110);
  y += 16;
  doc.setDrawColor(150);
  doc.line(margin, y, margin + 200, y);
  doc.line(margin + 260, y, margin + 460, y);
  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("Client signature", margin, y);
  doc.text("Agency signature", margin + 260, y);
  y += 26;
  doc.line(margin, y, margin + 200, y);
  doc.line(margin + 260, y, margin + 460, y);
  y += 14;
  doc.text("Name and date", margin, y);
  doc.text("Name and date", margin + 260, y);

  doc.save("agency-admin-client-agreement.pdf");
};

export default function AgreementCard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setBusy(true);
    setError("");
    try {
      await buildPdf();
    } catch {
      setError("The PDF couldn't be built. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass animate-rise rounded-2xl p-5" style={{ animationDelay: "80ms" }}>
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(10,132,255,0.16)", color: "#0A84FF" }}
        >
          <FileText className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{AGREEMENT_TITLE}</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            No work starts until this is signed. It covers the 30-day views guarantee, fees, content ownership and the
            30-day notice period.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={download}
              disabled={busy}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" strokeWidth={2.1} />}
              {busy ? "Preparing…" : "Download agreement"}
            </button>
            <span className="text-[12px] text-muted-foreground">PDF · print, sign, and file one copy</span>
          </div>

          {error && <p className="mt-2 text-[12.5px] text-destructive">{error}</p>}

          <details className="mt-3">
            <summary className="cursor-pointer text-[12.5px] text-muted-foreground">Read the agreement</summary>
            <div className="mt-2 max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {AGREEMENT_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="text-[12.5px] font-semibold">{section.title}</h3>
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}