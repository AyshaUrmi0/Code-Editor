import { CodeEditor } from "@/components/code-editor";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Code Editor</h1>
          <p className="text-muted-foreground">
            A beautiful code editor powered by Monaco Editor
          </p>
        </div>
        <CodeEditor />
      </div>
    </main>
  );
}