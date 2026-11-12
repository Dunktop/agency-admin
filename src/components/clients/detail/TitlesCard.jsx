import { formatDate } from "@/lib/clients";
import ClientAITrainer from "./ClientAITrainer";
import GenerateButton from "./GenerateButton";
import SectionCard from "./SectionCard";

export default function TitlesCard({ result, loading, busy, error, onGenerate, knowledge, onTrain, training }) {
  const groups = result?.content?.groups || [];

  return (
    <SectionCard
      title="Suggested Titles"
      delay={150}
      action={<GenerateButton hasResult={groups.length > 0} busy={busy} onClick={onGenerate} />}
    >
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-12 animate-pulse rounded-[10px]" style={{ background: "var(--nav-hover)" }} />
          ))}
        </div>
      ) : (
        <>
          {error && <p className="mb-3 text-[13px] leading-relaxed text-destructive">{error}</p>}

          {groups.length === 0 ? (
            !error && (
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Three alternative titles for each of the last five long-form videos. Generate once and they stay until you
                regenerate.
              </p>
            )
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.video}>
                  <p className="text-[12.5px] font-medium leading-relaxed text-muted-foreground">{group.video}</p>
                  <ul className="mt-1.5 space-y-1">
                    {group.options.map((option, index) => (
                      <li
                        key={`${option}-${index}`}
                        className="rounded-[10px] px-3 py-2.5 text-[14.5px] leading-relaxed"
                        style={{ background: "var(--nav-hover)" }}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {result?.generatedAt && (
                <p className="text-[11.5px] text-muted-foreground">Generated {formatDate(result.generatedAt)}</p>
              )}
            </div>
          )}

          <ClientAITrainer
            label="Train titles for this client"
            hint="Critique these titles or paste examples you prefer. They're saved to this client only."
            placeholder="Too clickbait — keep it factual. I like titles with a number in them…"
            entries={knowledge}
            onTrain={onTrain}
            sending={training}
          />
        </>
      )}
    </SectionCard>
  );
}