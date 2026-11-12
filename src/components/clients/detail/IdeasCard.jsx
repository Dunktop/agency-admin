import { formatDate } from "@/lib/clients";
import ClientAITrainer from "./ClientAITrainer";
import GenerateButton from "./GenerateButton";
import SectionCard from "./SectionCard";

const IDEA_FIELDS = [
  { key: "hook", label: "Hook" },
  { key: "angle", label: "Format" },
  { key: "payoff", label: "Payoff" },
];

export default function IdeasCard({ result, loading, busy, error, onGenerate, knowledge, onTrain, training }) {
  const ideas = result?.content?.ideas || [];

  return (
    <SectionCard
      title="Suggested Ideas"
      delay={200}
      action={<GenerateButton hasResult={ideas.length > 0} busy={busy} onClick={onGenerate} />}
    >
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-16 animate-pulse rounded-[10px]" style={{ background: "var(--nav-hover)" }} />
          ))}
        </div>
      ) : (
        <>
          {error && <p className="mb-3 text-[13px] leading-relaxed text-destructive">{error}</p>}

          {ideas.length === 0 ? (
            !error && (
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Fresh long-form ideas built only from this client's recent long-form videos. They stay until you regenerate.
              </p>
            )
          ) : (
            <div className="space-y-2">
              {ideas.map((idea, index) => (
                <article
                  key={`${idea.title}-${index}`}
                  className="rounded-[10px] px-3 py-2.5"
                  style={{ background: "var(--nav-hover)" }}
                >
                  <p className="text-[14.5px] font-medium leading-snug">{idea.title}</p>
                  <dl className="mt-1.5 space-y-1">
                    {IDEA_FIELDS.filter((field) => idea[field.key]).map((field) => (
                      <div key={field.key} className="flex gap-2 text-[12.5px] leading-relaxed">
                        <dt className="w-[52px] shrink-0 text-muted-foreground">{field.label}</dt>
                        <dd className="min-w-0 flex-1">{idea[field.key]}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
              {result?.generatedAt && (
                <p className="pt-1 text-[11.5px] text-muted-foreground">Generated {formatDate(result.generatedAt)}</p>
              )}
            </div>
          )}

          <ClientAITrainer
            label="Train ideas for this client"
            hint="Critique these ideas or paste angles you want more of. They're saved to this client only."
            placeholder="More teardown formats, less motivational. I want ideas tied to my course…"
            entries={knowledge}
            onTrain={onTrain}
            sending={training}
          />
        </>
      )}
    </SectionCard>
  );
}