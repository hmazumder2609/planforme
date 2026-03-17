import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, GripVertical, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">PlanForMe</span>
          </div>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered weekly planning
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
            Plan your week.
            <br />
            <span className="text-muted-foreground">Achieve your goals.</span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground">
            Drag-and-drop scheduling, smart time blocking, and AI-assisted
            prioritization. Your week, organized effortlessly.
          </p>

          <Link href="/login">
            <Button size="lg" className="text-base">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <GripVertical className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="mb-1 font-semibold">Drag & Drop</h3>
            <p className="text-sm text-muted-foreground">
              Drag tasks onto your calendar to schedule them instantly.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="mb-1 font-semibold">AI Scheduling</h3>
            <p className="text-sm text-muted-foreground">
              Let AI suggest the optimal time for each task.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="mb-1 font-semibold">Time Blocking</h3>
            <p className="text-sm text-muted-foreground">
              Visualize your day with clean, focused time blocks.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
