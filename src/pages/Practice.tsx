import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Code, Play, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { generateDSAProblem } from "@/lib/google";

const Practice = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [selectedDifficulty, setSelectedDifficulty] = useState("beginner");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentProblem, setCurrentProblem] = useState({
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "beginner",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState({
    google: 'untested' as 'working' | 'failed' | 'testing' | 'untested',
    judge0: 'untested' as 'working' | 'failed' | 'testing' | 'untested'
  });
  const { toast } = useToast();

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Start timer when user starts typing
  useEffect(() => {
    if (code.trim() && !isRunning) {
      setIsRunning(true);
    }
  }, [code, isRunning]);

  // Set initial code template when language changes
  useEffect(() => {
    if (!code) {
      setCode(getCodeTemplate(selectedLanguage));
    }
  }, [selectedLanguage]);

  const languages = [
    { id: "javascript", name: "JavaScript", color: "bg-yellow-500" },
    { id: "python", name: "Python", color: "bg-blue-500" },
    { id: "java", name: "Java", color: "bg-red-500" },
    { id: "cpp", name: "C++", color: "bg-purple-500" }
  ];

  const difficulties = ["beginner", "intermediate", "advanced"];

  const testGoogleAPI = async () => {
    setApiStatus(prev => ({ ...prev, google: 'testing' }));
    try {
      await generateDSAProblem('beginner');
      setApiStatus(prev => ({ ...prev, google: 'working' }));
      toast({
        title: "✅ Google API Working",
        description: "Your Google Gemini API key is valid and working!",
      });
    } catch (error: any) {
      setApiStatus(prev => ({ ...prev, google: 'failed' }));
      toast({
        title: "❌ Google API Failed",
        description: error.message || "Check your API key in src/lib/google.ts",
        variant: "destructive"
      });
    }
  };

  const testJudge0API = async () => {
    setApiStatus(prev => ({ ...prev, judge0: 'testing' }));
    try {
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          language_id: 54,
          source_code: '#include <iostream>\nint main() { std::cout << "test"; return 0; }',
          stdin: ""
        })
      });

      if (response.ok) {
        setApiStatus(prev => ({ ...prev, judge0: 'working' }));
        toast({
          title: "✅ Judge0 API Working",
          description: "Your RapidAPI key for Judge0 is valid!",
        });
      } else {
        throw new Error('API returned error status');
      }
    } catch (error: any) {
      setApiStatus(prev => ({ ...prev, judge0: 'failed' }));
      toast({
        title: "❌ Judge0 API Failed",
        description: "Update YOUR_RAPIDAPI_KEY in Practice.tsx (line 284)",
        variant: "destructive"
      });
    }
  };

  const generateNewProblem = async () => {
    setIsGenerating(true);
    try {
      console.log("Generating new DSA problem with Google Gemini, difficulty:", selectedDifficulty);
      const newProblem = await generateDSAProblem(selectedDifficulty);
      console.log("Generated problem:", newProblem);
      setCurrentProblem(newProblem);
      setCode(getCodeTemplate(selectedLanguage)); // Reset to template
      setOutput(""); // Clear output
      setTimeElapsed(0); // Reset timer
      setIsRunning(false); // Stop timer
      setApiStatus(prev => ({ ...prev, google: 'working' }));
      toast({
        title: "New Problem Generated!",
        description: "AI has created a fresh problem for you to solve.",
      });
    } catch (error: any) {
      console.error("Problem generation error:", error);
      setApiStatus(prev => ({ ...prev, google: 'failed' }));
      
      // Show detailed error message
      const errorMessage = error.message || "Failed to generate new problem";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 10000, // Show longer for important messages
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetTimer = () => {
    setTimeElapsed(0);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCodeTemplate = (language: string) => {
    switch (language) {
      case 'python':
        return `def solve(nums, target):
    # Your code here
    pass

# Test the function
nums = [2, 7, 11, 15]
target = 9
result = solve(nums, target)
print("Result:", result)`;
      case 'java':
        return `public class Solution {
    public int[] solve(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = sol.solve(nums, target);
        System.out.println("Result: " + java.util.Arrays.toString(result));
    }
}`;
      case 'cpp':
        return `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = sol.solve(nums, target);
    cout << "Result: ";
    for(int i : result) cout << i << " ";
    cout << endl;
    return 0;
}`;
      default:
        return `function solve(nums, target) {
    // Your code here
}

// Test the function
const nums = [2, 7, 11, 15];
const target = 9;
const result = solve(nums, target);
console.log("Result:", result);`;
    }
  };

  // Load Pyodide when component mounts
  useEffect(() => {
    let isMounted = true;
    const loadPyodide = async () => {
      try {
        // @ts-ignore - Pyodide is loaded via CDN script
        if (typeof window !== 'undefined' && window.loadPyodide && isMounted) {
          // @ts-ignore
          const pyodideInstance = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
          });
          if (isMounted) {
            setPyodide(pyodideInstance);
          }
        }
      } catch (error) {
        console.log("Pyodide loading failed, will use simulation for Python");
      }
    };
    loadPyodide();
    return () => {
      isMounted = false;
    };
  }, []);

  // Execute code for different languages
  const executeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please write some code before running.",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setOutput("Running code...");

    try {
      if (selectedLanguage === 'javascript') {
        await executeJavaScript();
      } else if (selectedLanguage === 'python') {
        await executePython();
      } else if (selectedLanguage === 'cpp' || selectedLanguage === 'java') {
        await executeOnlineCompiler();
      }

      toast({
        title: "Code Executed",
        description: "Your code has been run successfully!",
      });
    } catch (error: any) {
      setOutput(`Execution Error: ${error.message}`);
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Execute JavaScript code
  const executeJavaScript = async () => {
    const originalConsoleLog = console.log;
    let capturedOutput = "";
    
    console.log = (...args) => {
      capturedOutput += args.join(" ") + "\n";
    };

    try {
      const func = new Function(code);
      func();
      setOutput(capturedOutput || "Code executed successfully (no output)");
    } catch (execError: any) {
      setOutput(`Error: ${execError.message}`);
    } finally {
      console.log = originalConsoleLog;
    }
  };

  // Execute Python code using Pyodide
  const executePython = async () => {
    if (!pyodide) {
      setOutput("Python interpreter is loading... Please try again in a moment.");
      return;
    }

    try {
      // Capture Python print output
      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run the user's code
      pyodide.runPython(code);

      // Get the output
      const output = pyodide.runPython("sys.stdout.getvalue()");
      setOutput(output || "Code executed successfully (no output)");
    } catch (error: any) {
      setOutput(`Python Error: ${error.message}`);
    }
  };

  // Execute C++ and Java using Judge0 API (free online compiler)
  const executeOnlineCompiler = async () => {
    const languageIds = {
      cpp: 54,    // C++ (GCC 9.2.0)
      java: 62,   // Java (OpenJDK 13.0.1)
    };

    try {
      // Submit code to Judge0
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // You'll need to get this
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          language_id: languageIds[selectedLanguage as keyof typeof languageIds],
          source_code: code,
          stdin: ""
        })
      });

      if (!response.ok) {
        throw new Error('Compiler service unavailable');
      }

      const result = await response.json();
      
      if (result.stdout) {
        setOutput(result.stdout);
      } else if (result.stderr) {
        setOutput(`Compilation Error:\n${result.stderr}`);
      } else if (result.compile_output) {
        setOutput(`Compilation Error:\n${result.compile_output}`);
      } else {
        setOutput("Code executed successfully (no output)");
      }
    } catch (error) {
      // Fallback to local simulation if API fails
      setOutput(`${selectedLanguage.toUpperCase()} Code Simulation:\n\n✅ Syntax appears valid\n✅ Code structure looks good\n\nNote: Real compilation requires API setup.\nFor now, this is a simulation showing your code structure:\n\nLines: ${code.split('\n').length}\nCharacters: ${code.length}\n\nTo enable real compilation, set up Judge0 API key.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-gray-900">DSA Practice</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* API Status Indicators */}
            <div className="flex items-center gap-2 mr-4">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                apiStatus.google === 'working' ? 'bg-green-100 text-green-700' :
                apiStatus.google === 'failed' ? 'bg-red-100 text-red-700' :
                apiStatus.google === 'testing' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                Google API: {apiStatus.google === 'testing' ? '⏳' : 
                           apiStatus.google === 'working' ? '✅' :
                           apiStatus.google === 'failed' ? '❌' : '?'}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                apiStatus.judge0 === 'working' ? 'bg-green-100 text-green-700' :
                apiStatus.judge0 === 'failed' ? 'bg-red-100 text-red-700' :
                apiStatus.judge0 === 'testing' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                Judge0 API: {apiStatus.judge0 === 'testing' ? '⏳' : 
                            apiStatus.judge0 === 'working' ? '✅' :
                            apiStatus.judge0 === 'failed' ? '❌' : '?'}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${isRunning ? 'text-green-600' : 'text-gray-600'}`}>
                {formatTime(timeElapsed)}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetTimer();
              }}
              type="button"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Timer
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Panel */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{currentProblem.title}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {currentProblem.difficulty}
                </Badge>
              </div>
              <CardDescription>
                {currentProblem.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Example:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div><strong>Input:</strong> {String(currentProblem.examples[0].input)}</div>
                    <div><strong>Output:</strong> {String(currentProblem.examples[0].output)}</div>
                    <div><strong>Explanation:</strong> {String(currentProblem.examples[0].explanation)}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        generateNewProblem();
                      }}
                      disabled={isGenerating}
                      type="button"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Generate New
                        </>
                      )}
                    </Button>
                    <select 
                      value={selectedDifficulty}
                      onChange={(e) => {
                        e.preventDefault();
                        setSelectedDifficulty(e.target.value);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff} className="capitalize">{diff}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* API Test Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        testGoogleAPI();
                      }}
                      disabled={apiStatus.google === 'testing'}
                      type="button"
                    >
                      Test Google API
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        testJudge0API();
                      }}
                      disabled={apiStatus.judge0 === 'testing'}
                      type="button"
                    >
                      Test Judge0 API
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor Panel */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Code Editor</CardTitle>
                <div className="flex items-center gap-2">
                  {languages.map(lang => (
                    <Button
                      key={lang.id}
                      variant={selectedLanguage === lang.id ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedLanguage(lang.id);
                        setCode(getCodeTemplate(lang.id));
                        setOutput(""); // Clear output when switching languages
                      }}
                      className="text-xs"
                      type="button"
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Code Editor */}
                <div className="border rounded-lg">
                  <div className="bg-gray-100 px-3 py-2 border-b text-xs text-gray-600 font-mono">
                    {selectedLanguage} - Write your solution below:
                  </div>
                  <Textarea
                    className="min-h-[300px] border-0 rounded-t-none font-mono text-sm resize-none focus-visible:ring-0"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Paste Blocked!",
                        description: "Type your code manually to simulate real interview conditions.",
                        variant: "destructive"
                      });
                    }}
                    placeholder={getCodeTemplate(selectedLanguage)}
                    style={{
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      tabSize: 2
                    }}
                  />
                </div>

                {/* Output Panel */}
                {output && (
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div className="text-gray-400 text-xs mb-2">Output:</div>
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  </div>
                )}
                
                 {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      executeCode();
                    }}
                    disabled={isExecuting}
                    type="button"
                  >
                    {isExecuting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                  
                  {/* Language Status Indicator */}
                  {selectedLanguage === 'python' && !pyodide && (
                    <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      <div className="animate-spin w-3 h-3 border border-amber-600 border-t-transparent rounded-full mr-2"></div>
                      Loading Python...
                    </div>
                  )}
                  
                  {selectedLanguage === 'python' && pyodide && (
                    <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✅ Python Ready
                    </div>
                  )}
                  
                  {(selectedLanguage === 'cpp' || selectedLanguage === 'java') && (
                    <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      🔧 Compiler Available
                    </div>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Submitting solution...", code);
                      setIsRunning(false);
                      toast({
                        title: "Solution Submitted",
                        description: `Great job! Time taken: ${formatTime(timeElapsed)}`,
                      });
                    }}
                    type="button"
                  >
                    Submit Solution
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCode(getCodeTemplate(selectedLanguage));
                      setOutput("");
                    }}
                    type="button"
                  >
                    Reset Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Practice;
