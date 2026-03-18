"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AiSuggestionsPanel } from "./ai-suggestions-panel";

interface ScheduleAssistantProps {
  date?: string;
}

export function ScheduleAssistant({ date }: ScheduleAssistantProps) {
  const resolvedDate = date ?? format(new Date(), "yyyy-MM-dd");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <motion.div
                className="fixed bottom-6 right-6 z-40"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.5, damping: 15 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(147, 51, 234, 0.4)",
                      "0 0 0 12px rgba(147, 51, 234, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: 1,
                    repeatDelay: 1,
                  }}
                  className="rounded-full"
                >
                  <Button
                    size="lg"
                    onClick={() => setIsPanelOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
                  >
                    <Sparkles className="h-6 w-6 text-white" />
                    <span className="sr-only">AI Schedule Assistant</span>
                  </Button>
                </motion.div>
              </motion.div>
            }
          />
          <TooltipContent side="left">AI Schedule Assistant</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AiSuggestionsPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        date={resolvedDate}
      />
    </>
  );
}
