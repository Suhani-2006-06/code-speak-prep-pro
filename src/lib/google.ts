
// ⚠️ IMPORTANT: Replace with your own API key from https://aistudio.google.com/app/apikey
// The demo key below has rate limits and will stop working after a few requests
const GOOGLE_API_KEY = "AIzaSyAuC6bZj7uQD67I8C_pVfcQ4eFHoDMfBmA";

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry API calls with better error handling
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      // If it's a 503 error (model overloaded), wait longer
      if (error.message.includes('503') || error.message.includes('overloaded')) {
        if (attempt === maxRetries) {
          throw new Error("Google AI service is currently overloaded. Please try again in a few minutes.");
        }
        // Wait longer for 503 errors
        await delay(delayMs * attempt * 2);
      } else {
        if (attempt === maxRetries) {
          throw error;
        }
        await delay(delayMs * attempt);
      }
    }
  }
  throw new Error("Max retries exceeded");
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  console.log("Starting audio transcription with Google API...");
  console.log("Audio blob size:", audioBlob.size, "type:", audioBlob.type);
  
  const makeTranscriptionCall = async () => {
    // Convert audio blob to base64
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(audioBlob);
    });

    // Map browser audio formats to Gemini supported formats
    let mimeType = audioBlob.type;
    if (mimeType.includes('webm')) {
      mimeType = 'audio/ogg'; // Gemini supports OGG which is similar to WebM
    } else if (mimeType.includes('mpeg')) {
      mimeType = 'audio/mp3';
    } else if (!['audio/wav', 'audio/mp3', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac'].includes(mimeType)) {
      mimeType = 'audio/ogg'; // Default fallback
    }

    console.log("Using mime type:", mimeType);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Please transcribe the following audio recording. Return only the transcribed text, nothing else."
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Audio
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transcription API error:", errorText);
      throw new Error(`Transcription failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription result:", result);
    
    if (!result.candidates || !result.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("No transcription text in response");
    }
    
    return result.candidates[0].content.parts[0].text;
  };

  return retryApiCall(makeTranscriptionCall, 3, 2000);
}

export async function generateInterviewFeedback(question: string, answer: string): Promise<string> {
  console.log("Generating interview feedback with Google Gemini...");
  
  const makeFeedbackCall = async () => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an HR interviewer. Give quick, actionable feedback (2-3 sentences).

Question: "${question}"
Answer: "${answer}"

Feedback on clarity, relevance, and professionalism:`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.5,
          topP: 0.95,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Feedback generation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Feedback result:", result);
    
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("No feedback text in response");
    }
    
    return result.candidates[0].content.parts[0].text;
  };

  return retryApiCall(makeFeedbackCall, 3, 2000);
}

export async function generateDSAProblem(difficulty: string): Promise<any> {
  console.log("Generating DSA problem with Google Gemini, difficulty:", difficulty);
  
  // Add timestamp and random seed for uniqueness
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(2, 15);
  
  const makeProblemCall = async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
          parts: [{
            text: `Create a UNIQUE ${difficulty} level Data Structures and Algorithms problem.

IMPORTANT: Create a completely NEW and DIFFERENT problem each time. Do not repeat previous problems.
Problem seed: ${randomSeed} | Timestamp: ${timestamp}

Focus on diverse topics like:
- Arrays, Strings, Hash Maps
- Linked Lists, Stacks, Queues
- Trees (Binary, BST, Tries)
- Graphs (DFS, BFS, Shortest Path)
- Dynamic Programming
- Greedy Algorithms
- Sorting & Searching
- Sliding Window, Two Pointers
- Heaps & Priority Queues

CRITICAL: Return ONLY valid JSON with ALL values as strings. No nested objects or arrays in example fields.

Required format:
{
  "title": "Problem Name (string)",
  "description": "Problem statement as a single string",
  "difficulty": "${difficulty}",
  "examples": [
    {
      "input": "All input data as a formatted string (e.g., 'arr = [1,2,3], target = 5')",
      "output": "Expected output as a string (e.g., '[0, 2]')",
      "explanation": "Why this output as a string"
    }
  ],
  "constraints": ["constraint 1 as string", "constraint 2 as string"],
  "hints": ["hint 1 as string", "hint 2 as string"]
}

Example of CORRECT format:
{
  "input": "n = 5, k = 2, edges = [[0,1],[1,2],[2,3],[3,4]]",
  "output": "true",
  "explanation": "The graph is connected"
}

Do NOT return nested objects like {"n": 5, "k": 2}. Convert everything to strings.`
          }]
          }],
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0.7,
            topP: 0.95,
          }
        }),
      });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      
      // Check for rate limiting
      if (response.status === 429) {
        throw new Error(`⚠️ Rate limit exceeded! The demo API key has limited requests. Get your FREE API key at: https://aistudio.google.com/app/apikey and replace it in src/lib/google.ts line 4`);
      }
      
      if (response.status === 403) {
        throw new Error(`⚠️ API key issue! Get your FREE API key at: https://aistudio.google.com/app/apikey and replace it in src/lib/google.ts line 4`);
      }
      
      throw new Error(`Problem generation failed: ${response.status} ${response.statusText}`);
    }

      const result = await response.json();
      console.log("Problem generation result:", JSON.stringify(result, null, 2));
      
      // Check if we have valid content
      if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("No text in API response. Full response:", JSON.stringify(result, null, 2));
        
        // Check for specific finish reasons
        const finishReason = result.candidates?.[0]?.finishReason;
        if (finishReason === 'MAX_TOKENS') {
          throw new Error("Response too long. Retrying with adjusted settings...");
        } else if (finishReason === 'SAFETY') {
          throw new Error("Content filtered by safety settings. Please try again.");
        }
        
        throw new Error(`API returned no content. Finish reason: ${finishReason || 'unknown'}`);
      }
      
      let jsonText = result.candidates[0].content.parts[0].text;
      console.log("Raw AI response:", jsonText);
      
      // Clean up the response - remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      
      const parsed = JSON.parse(jsonText);
      console.log("Successfully parsed problem:", parsed.title);
      
      // Helper function to deeply convert any value to string
      const deepStringify = (value: any): string => {
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          // Pretty print objects/arrays for readability
          return JSON.stringify(value, null, 2);
        }
        return String(value);
      };
      
      // Sanitize the parsed data to ensure ALL values are strings (no nested objects allowed)
      const sanitized = {
        title: deepStringify(parsed.title || 'Coding Challenge'),
        description: deepStringify(parsed.description || 'Solve this problem'),
        difficulty: deepStringify(parsed.difficulty || difficulty),
        examples: (parsed.examples || []).map((ex: any) => ({
          input: deepStringify(ex.input || ''),
          output: deepStringify(ex.output || ''),
          explanation: deepStringify(ex.explanation || '')
        })),
        constraints: (parsed.constraints || []).map((c: any) => deepStringify(c)),
        hints: (parsed.hints || []).map((h: any) => deepStringify(h))
      };
      
      console.log("Sanitized problem:", sanitized);
      return sanitized;
      
    } catch (parseError: any) {
      console.error("Error in DSA problem generation:", parseError);
      
      // If it's a JSON parse error, return a fallback
      if (parseError instanceof SyntaxError) {
        console.error("JSON parse failed. Returning fallback problem.");
        return {
          title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Coding Challenge`,
          description: "Solve this algorithmic problem using optimal time and space complexity.",
          difficulty: difficulty,
          examples: [
            {
              input: "arr = [1, 2, 3, 4, 5]",
              output: "result",
              explanation: "Process the array according to the problem requirements."
            }
          ],
          constraints: ["1 <= arr.length <= 1000", "Values are integers"],
          hints: ["Consider edge cases", "Think about time complexity"]
        };
      }
      
      // Re-throw other errors
      throw parseError;
    }
  };

  return retryApiCall(makeProblemCall, 3, 3000);
}
