"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown, Terminal } from "lucide-react";

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
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [code, setCode] = useState(`// Start coding here\nconsole.log("Hello, world!");`);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [showOutput, setShowOutput] = useState(true);
  const [pyodide, setPyodide] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize Pyodide for Python execution
  useEffect(() => {
    if (language === "python") {
      const loadPyodide = async () => {
        setOutput(prev => [...prev, "⏳ Loading Python runtime (Pyodide)..."]);
        try {
          // @ts-ignore - Pyodide will be loaded from CDN
          const pyodide = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
          });
          setPyodide(pyodide);
          setOutput(prev => [...prev, "✅ Python runtime ready"]);
        } catch (error) {
          setOutput(prev => [...prev, `❌ Failed to load Python: ${error instanceof Error ? error.message : String(error)}`]);
        }
      };
      
      if (!pyodide) {
        loadPyodide();
      }
    }
  }, [language]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearOutput = () => {
    setOutput([]);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = "";
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(prev => [...prev, `$ Running ${language} code...`]);
    
    try {
      // Clear previous outputs
      console.clear();
      if (iframeRef.current && language === "html") {
        iframeRef.current.srcdoc = "";
      }

      // Capture console output
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
      };

      const captureConsole = (type: 'log' | 'error' | 'warn' | 'info') => {
        return (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          setOutput(prev => [...prev, `[${type}] ${message}`]);
          originalConsole[type](...args);
        };
      };

      console.log = captureConsole('log');
      console.error = captureConsole('error');
      console.warn = captureConsole('warn');
      console.info = captureConsole('info');

      try {
        switch(language) {
          case 'javascript':
          case 'typescript':
            new Function(code)();
            break;
            
          case 'python':
            if (pyodide) {
              try {
                await pyodide.loadPackagesFromImports(code);
                const result = await pyodide.runPythonAsync(code);
                if (result !== undefined) {
                  setOutput(prev => [...prev, `Python output: ${String(result)}`]);
                }
              } catch (error) {
                setOutput(prev => [...prev, `Python error: ${error instanceof Error ? error.message : String(error)}`]);
              }
            } else {
              setOutput(prev => [...prev, "Python runtime not loaded yet. Please try again."]);
            }
            break;
            
          case 'html':
            if (iframeRef.current) {
              iframeRef.current.srcdoc = code;
              setOutput(prev => [...prev, "HTML rendered in preview area"]);
            }
            break;
            
          case 'css':
            setOutput(prev => [...prev, "CSS would need to be applied to a DOM element"]);
            break;
            
          case 'json':
            try {
              const parsed = JSON.parse(code);
              setOutput(prev => [...prev, "Valid JSON:", JSON.stringify(parsed, null, 2)]);
            } catch (e) {
              setOutput(prev => [...prev, `JSON Error: ${e instanceof Error ? e.message : 'Invalid JSON'}`]);
            }
            break;
            
          default:
            setOutput(prev => [...prev, `No execution handler for ${language}`]);
        }
      } catch (error) {
        setOutput(prev => [...prev, `Execution Error: ${error instanceof Error ? error.message : String(error)}`]);
      }

      // Restore original console
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;

    } finally {
      setIsRunning(false);
      setOutput(prev => [...prev, `$ Execution completed`]);
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearOutput}
            disabled={output.length === 0}
          >
            Clear Output
          </Button>
          <Button 
            onClick={handleRun} 
            disabled={isRunning || (language === "python" && !pyodide)}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>
      <Editor
        height="50vh"
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
      
      {/* HTML Preview (only shown for HTML) */}
      {language === "html" && (
        <div className="border-t">
          <div className="flex items-center p-2 text-sm font-medium bg-gray-100 dark:bg-gray-800">
            <Terminal className="w-4 h-4 mr-2" />
            <span>HTML Preview</span>
          </div>
          <iframe 
            ref={iframeRef}
            className="w-full h-64 border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
            title="HTML Preview"
          />
        </div>
      )}
      
      {/* Output Console */}
      <div className="border-t">
        <button 
          className="flex items-center justify-between w-full p-2 text-sm font-medium bg-gray-100 dark:bg-gray-800"
          onClick={() => setShowOutput(!showOutput)}
        >
          <div className="flex items-center">
            <Terminal className="w-4 h-4 mr-2" />
            <span>Console Output</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showOutput ? 'rotate-180' : ''}`} />
        </button>
        {showOutput && (
          <div className="h-[120px] overflow-auto p-2 bg-background font-mono text-sm whitespace-pre-wrap">
            {output.length === 0 ? (
              <div className="text-muted-foreground">Output will appear here...</div>
            ) : (
              output.map((line, index) => (
                <div key={index} className={
                  line.startsWith('[error]') || line.includes('❌') ? 'text-red-500' : 
                  line.startsWith('[warn]') ? 'text-yellow-500' : 
                  line.includes('✅') ? 'text-green-500' :
                  line.includes('⏳') ? 'text-blue-500' :
                  'text-foreground'
                }>
                  {line}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
}