import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  generateClientIdeas,
  generateClientTitles,
  getClientSuggestions,
  trainClientTool,
} from "@/lib/client-ai-fns";
import TitlesCard from "./TitlesCard";
import IdeasCard from "./IdeasCard";

const EMPTY = {
  titles: null,
  ideas: null,
  knowledge: { CLIENT_TITLES: [], CLIENT_IDEAS: [] },
};

export default function ClientAITools({ clientId }) {
  const fetchSuggestions = useServerFn(getClientSuggestions);
  const runTitles = useServerFn(generateClientTitles);
  const runIdeas = useServerFn(generateClientIdeas);
  const train = useServerFn(trainClientTool);

  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [training, setTraining] = useState("");
  const [errors, setErrors] = useState({ TITLES: "", IDEAS: "" });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchSuggestions({ data: { clientId } })
      .then((result) => {
        if (alive && result) setData(result);
      })
      .catch(() => {
        if (alive) setErrors({ TITLES: "Couldn't load the saved results.", IDEAS: "Couldn't load the saved results." });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [clientId]);

  const generate = async (tool) => {
    setBusy(tool);
    setErrors((previous) => ({ ...previous, [tool]: "" }));
    try {
      const result =
        tool === "TITLES" ? await runTitles({ data: { clientId } }) : await runIdeas({ data: { clientId } });
      setData((previous) => ({ ...previous, [tool === "TITLES" ? "titles" : "ideas"]: result }));
    } catch (requestError) {
      setErrors((previous) => ({
        ...previous,
        [tool]: requestError?.message || "That didn't work. Try again.",
      }));
    } finally {
      setBusy("");
    }
  };

  const trainTool = async (scope, content) => {
    setTraining(scope);
    try {
      const entry = await train({ data: { clientId, scope, content } });
      setData((previous) => ({
        ...previous,
        knowledge: {
          ...previous.knowledge,
          [scope]: [...(previous.knowledge[scope] || []), entry],
        },
      }));
    } finally {
      setTraining("");
    }
  };

  return (
    <>
      <TitlesCard
        result={data.titles}
        loading={loading}
        busy={busy === "TITLES"}
        error={errors.TITLES}
        onGenerate={() => generate("TITLES")}
        knowledge={data.knowledge.CLIENT_TITLES || []}
        onTrain={(content) => trainTool("CLIENT_TITLES", content)}
        training={training === "CLIENT_TITLES"}
      />
      <IdeasCard
        result={data.ideas}
        loading={loading}
        busy={busy === "IDEAS"}
        error={errors.IDEAS}
        onGenerate={() => generate("IDEAS")}
        knowledge={data.knowledge.CLIENT_IDEAS || []}
        onTrain={(content) => trainTool("CLIENT_IDEAS", content)}
        training={training === "CLIENT_IDEAS"}
      />
    </>
  );
}