"use client";

import { useState, useEffect, useRef } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Play, ChevronDown, Terminal, Loader2 } from "lucide-react";

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

// Configure Monaco Editor loader
if (typeof window !== 'undefined') {
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
    },
    'vs/nls': {
      availableLanguages: { '*': 'en' }
    }
  });
}

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
    if (language === "python" && !pyodide) {
      const loadPyodideScript = () => {
        setOutput(prev => [...prev, "⏳ Loading Python runtime..."]);
        
        // Create a script element for Pyodide
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.crossOrigin = 'anonymous';
        
        script.onload = async () => {
          try {
            // Initialize Pyodide
            const loadPyodide = (window as any).loadPyodide;
            const pyodideInstance = await loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
            });
            
            // Test the Pyodide instance
            await pyodideInstance.runPythonAsync('print("Pyodide loaded successfully!")');
            
            setPyodide(pyodideInstance);
            setOutput(prev => [...prev, "✅ Python runtime is ready!"]);
          } catch (err) {
            console.error('Pyodide loading error:', err);
            setOutput(prev => [...prev, `❌ Error loading Python: ${err instanceof Error ? err.message : String(err)}`]);
          }
        };
        
        script.onerror = () => {
          setOutput(prev => [...prev, "❌ Failed to load Python runtime. Please check your internet connection and try again."]);
        };
        
        // Add the script to the document
        document.head.appendChild(script);
      };

      // Load Pyodide
      loadPyodideScript();
    }
  }, [language, pyodide]);

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
            if (!pyodide) {
              setOutput(prev => [...prev, "⚠️ Python runtime is not ready. Please wait for it to load..."]);
              return;
            }
            try {
              // Capture Python's stdout
              pyodide.runPython(`
                import sys
                from io import StringIO
                sys.stdout = StringIO()
              `);
              
              // Run the user's code
              const result = await pyodide.runPythonAsync(code);
              
              // Get captured output
              const stdout = pyodide.runPython("sys.stdout.getvalue()");
              if (stdout) {
                setOutput(prev => [...prev, stdout]);
              }
              
              // If there's a return value, show it
              if (result !== undefined && result !== null) {
                setOutput(prev => [...prev, `=> ${result}`]);
              }
              
              // Reset stdout
              pyodide.runPython("sys.stdout = sys.__stdout__");
            } catch (error) {
              setOutput(prev => [...prev, `❌ Python Error: ${error instanceof Error ? error.message : String(error)}`]);
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
    <Card className="w-full overflow-hidden border rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b bg-card gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearOutput}
            disabled={output.length === 0}
            className="flex-1 sm:flex-none"
          >
            Clear Output
          </Button>
          <Button 
            onClick={handleRun} 
            disabled={isRunning || (language === "python" && !pyodide)}
            className="gap-2 flex-1 sm:flex-none"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Editor
          height="60vh"
          language={language}
          theme={theme}
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
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
            wordWrap: "on",
            wrappingStrategy: "advanced",
          }}
          beforeMount={(monaco) => {
            monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
            monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
          }}
          loading={
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading editor...
              </div>
            </div>
          }
        />
      </div>
      
      {/* HTML Preview (only shown for HTML) */}
      {language === "html" && (
        <div className="border-t">
          <div className="flex items-center justify-between p-2 text-sm font-medium bg-gray-100 dark:bg-gray-800">
            <div className="flex items-center">
              <Terminal className="w-4 h-4 mr-2" />
              <span>HTML Preview</span>
            </div>
          </div>
          <iframe 
            ref={iframeRef}
            className="w-full h-64 border-0 bg-white dark:bg-gray-900"
            sandbox="allow-scripts allow-same-origin"
            title="HTML Preview"
          />
        </div>
      )}
      
      {/* Output Console */}
      <div className="border-t">
        <button 
          className="flex items-center justify-between w-full p-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setShowOutput(!showOutput)}
        >
          <div className="flex items-center">
            <Terminal className="w-4 h-4 mr-2" />
            <span>Console Output</span>
            {output.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                {output.length}
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showOutput ? 'rotate-180' : ''}`} />
        </button>
        {showOutput && (
          <div className="h-[120px] overflow-auto p-2 bg-background font-mono text-sm whitespace-pre-wrap">
            {output.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Output will appear here...
              </div>
            ) : (
              <div className="space-y-1">
                {output.map((line, index) => (
                  <div key={index} className={`py-0.5 ${
                    line.startsWith('[error]') || line.includes('❌') ? 'text-red-500' : 
                    line.startsWith('[warn]') ? 'text-yellow-500' : 
                    line.includes('✅') ? 'text-green-500' :
                    line.includes('⏳') ? 'text-blue-500' :
                    'text-foreground'
                  }`}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}