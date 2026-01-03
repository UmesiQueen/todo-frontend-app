"use client";

import * as React from "react";
import { SparklesIcon, XIcon } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

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

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setLoading(false);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              setResult((prev) => prev + parsed.text);
            } catch (e) {
              console.log(e, "Error");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
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
        <div
          ref={resultContainer}
          className="absolute right-3 bottom-13 z-2"
        >
          <div className="p-5 border rounded-md bg-sage/60 shadow-2xl min-h-30 w-70 backdrop-blur-md relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-0 right-0"
              onClick={() => setResult("")}
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
