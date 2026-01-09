"use client";

import * as React from "react";
import { SparklesIcon, XIcon } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { type Task } from "@/app/page";

export function AnalyzeButton({ tasks }: { tasks: Task[] }) {
  const [result, setResult] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [resultContainer] = useAutoAnimate();

  const handleClick = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch response";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `Request failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data.text);
    } catch (error) {
      let errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      if (errorMessage.includes(":")) {
        errorMessage = errorMessage.split(":").slice(1).join(":").trim();
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 z-50">
      <Button
        onClick={handleClick}
        disabled={loading || tasks.length === 0}
        className="bg-[#3B4953] dark:bg-zinc-100 dark:hover:bg-white dark:text-sage hover:bg-[#3B4953]/80 cursor-pointer shadow-xl absolute right-3 bottom-3 z-1"
      >
        <SparklesIcon /> {loading ? "Analyzing..." : "Analyze My Day"}
      </Button>

      {result && (
        <div ref={resultContainer} className="absolute right-3 bottom-13 z-2">
          <div className="p-5 border rounded-md bg-sage/60 shadow-2xl min-h-30 w-70 backdrop-blur-md relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-0 right-0"
              onClick={() => setResult("")}
              aria-label="Close analysis"
            >
              <XIcon />
            </Button>
            <h3 className="text-lg font-semibold mb-2">
              Today&apos;s Priority Focus
            </h3>
            <p className="whitespace-pre-wrap text-sm">{result}</p>
          </div>
        </div>
      )}
    </div>
  );
}
