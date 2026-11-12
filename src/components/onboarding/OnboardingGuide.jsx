const STEPS = [
  {
    title: "Qualify the channel",
    body: [
      "Watch the last three long-form uploads before you pitch. You are looking for an offer that already sells, a host who can be on camera, and a reason the channel is underperforming that a team can fix.",
      "If there is no offer, no footage pipeline or no willingness to appear, the retainer has nowhere to land. Walk away early.",
    ],
  },
  {
    title: "Send the agreement, then the setup invoice",
    body: [
      "Both go out the same day as the verbal yes. Nothing is filmed, edited or staffed until the agreement is signed and the setup fee has cleared.",
    ],
  },
  {
    title: "Run the kickoff call",
    body: [
      "45 minutes, recorded. Cover the offers, the audience, the content they already like, the footage logistics and who approves videos.",
      "Take the baseline on this call: total views, subscribers and watch hours. The 30-day guarantee is measured from here, so screenshot the numbers.",
    ],
  },
  {
    title: "Hand over access",
    body: [
      "Collect channel manager access on their Google account, a shared drive for footage and deliverables, a Discord or WhatsApp thread for the account, and the brand kit.",
      "Agree the footage drop day and the approval window — 48 hours is the default.",
    ],
  },
  {
    title: "Staff the account",
    body: [
      "Open the Team tab and assign a channel manager, the editors you need and a thumbnail designer. Keep anyone at three clients or fewer so edits don't slip.",
    ],
  },
  {
    title: "Ship the first batch in ten days",
    body: [
      "Two long-form videos and three to five shorts in the first ten days. Move the production stage on the client page as each video travels through footage, edit, thumbnail, review and upload.",
    ],
  },
  {
    title: "Review day 30 against the guarantee",
    body: [
      "Compare day 1 with day 30 in Analytics. Views up means continue and plan the next month. Views flat or down means the guarantee conversation, and a full refund if they ask for it.",
    ],
  },
];

const RULES = [
  "No agreement, no setup fee, no work — in that order.",
  "Every long-form video is 4 minutes or longer unless the strategy says otherwise.",
  "Two revision rounds per video, then quote extra rounds separately.",
  "Mark payments green in the Calendar the day the money lands, not the day it was promised.",
  "Never promise a view count. Promise the process and the 30-day guarantee.",
];

export default function OnboardingGuide() {
  return (
    <div className="space-y-4">
      <section className="glass animate-rise rounded-2xl p-5" style={{ animationDelay: "140ms" }}>
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Onboarding a new client</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
          The same seven stages for every account. Skipping a stage is what turns a good client into a refund request.
        </p>

        <ol className="mt-4 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span
                className="mt-[1px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums"
                style={{ background: "var(--nav-active)", color: "#64D2FF" }}
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-[14.5px] font-medium leading-snug">{step.title}</h3>
                {step.body.map((paragraph) => (
                  <p key={paragraph} className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="glass animate-rise rounded-2xl p-5" style={{ animationDelay: "200ms" }}>
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Rules we don't break</h2>
        <ul className="mt-2 space-y-1.5">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-2 text-[13.5px] leading-relaxed text-muted-foreground">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#30D158" }} />
              {rule}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}