import { CodeEditor } from "../components/code-editor";
import { Navbar } from "../components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Code Editor</h1>
            <p className="text-muted-foreground">
              Next Level Code Editor for your daily coding needs.
            </p>
          </div>
          <CodeEditor />
        </div>
      </main>
    </>
  );
}
