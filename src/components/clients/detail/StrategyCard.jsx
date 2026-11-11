import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { strategyBullets } from "@/lib/clients";
import AiUnavailable from "@/components/ai/AiUnavailable";
import SectionCard from "./SectionCard";

export default function StrategyCard({ client, aiUnavailable }) {
  const [openIndex, setOpenIndex] = useState(null);
  const bullets = strategyBullets(client.strategyItems, client.contentStrategy);

  return (
    <SectionCard title="Strategy" delay={100}>
      {bullets.length === 0 ? (
        aiUnavailable ? (
          <AiUnavailable />
        ) : (
          <p className="text-[15px] text-muted-foreground">
            No strategy yet. Run Refresh analysis to generate the changes to make.
          </p>
        )
      ) : (
        <ul className="space-y-1">
          {bullets.map((bullet, index) => {
            const open = openIndex === index;
            return (
              <li key={`${bullet.action}-${index}`}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-2.5 rounded-[10px] px-2 py-2.5 text-left transition-colors hover:bg-[color:var(--nav-hover)]"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#64D2FF" }} />
                  <span className="min-w-0 flex-1 text-[15px] leading-relaxed">
                    {bullet.action}
                    {bullet.target && <span style={{ color: "#0A84FF" }}> → {bullet.target}</span>}
                  </span>
                  <ChevronDown
                    className="mt-1 h-4 w-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.9}
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}
                  />
                </button>
                {open && (
                  <p className="mb-2 ml-7 mr-2 whitespace-pre-line rounded-[10px] px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground" style={{ background: "var(--nav-hover)" }}>
                    {bullet.reasoning || "No further detail for this change yet."}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}