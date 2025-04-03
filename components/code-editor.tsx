"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "sonner";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
];

const themes = [
  { value: "vs-dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export function CodeEditor() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState("typescript");
  const [theme, setTheme] = useState("vs-dark");
  const [code, setCode] = useState(`// Start coding here\n`);
  const [isRunning, setIsRunning] = useState(false);

  // Only render the editor after component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRun = async () => {
    console.log("Starting code execution...");
    console.log("Current language:", language);
    console.log("Code to execute:", code);

    setIsRunning(true);
    try {
      // For now, we'll just simulate code execution
      // In a real application, you would send this to a backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration, evaluate JavaScript code in a safe way
      if (language === "javascript" || language === "typescript") {
        try {
          console.log("Attempting to execute JavaScript/TypeScript code...");
          
          // Create a function from the code
          const wrappedCode = `
            try {
              ${code}
            } catch (e) {
              return { error: e.message };
            }
          `;
          
          console.log("Wrapped code:", wrappedCode);
          
          const result = new Function(wrappedCode)();
          console.log("Execution result:", result);

          if (result && result.error) {
            console.error("Code execution error:", result.error);
            toast.error("Error in code", {
              description: result.error
            });
          } else {
            console.log("Code executed successfully");
            toast.success("Code executed successfully!", {
              description: result !== undefined ? `Output: ${JSON.stringify(result)}` : "No output"
            });
          }
        } catch (error) {
          console.error("Error during code execution:", error);
          toast.error("Error executing code", {
            description: error instanceof Error ? error.message : "Unknown error"
          });
        }
      } else {
        console.log(`Simulating execution for ${language}`);
        toast.info("Code execution simulation", {
          description: `Language: ${language}\nCode length: ${code.length} characters`
        });
      }
    } catch (error) {
      console.error("Fatal error during execution:", error);
      toast.error("Failed to execute code", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsRunning(false);
      console.log("Code execution completed");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card className="w-full overflow-hidden border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {themes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleRun} 
          disabled={isRunning}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
      <Editor
        height="70vh"
        language={language}
        theme={theme}
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          padding: { top: 16, bottom: 16 },
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          automaticLayout: true,
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </Card>
  );
}