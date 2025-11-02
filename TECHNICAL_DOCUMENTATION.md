# Technical Documentation - Interview & DSA Practice Platform

## 📋 Project Overview

This is a full-stack web application that provides AI-powered interview practice and Data Structures & Algorithms (DSA) coding challenges. The platform helps users prepare for technical interviews through voice-based HR interview practice and multi-language coding exercises.

---

## 🛠 Technology Stack

### Frontend Framework
- **React 18.3.1** - UI library with TypeScript
- **Vite** - Build tool and development server
- **React Router DOM 6.26.2** - Client-side routing

### Styling & UI Components
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Pre-built, customizable React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### State Management & Forms
- **React Hooks** - useState, useEffect for state management
- **React Hook Form 7.53.0** - Form validation
- **Zod 3.23.8** - Schema validation

### AI & APIs
- **Google Gemini AI** (gemini-2.5-flash & gemini-2.0-flash-exp) - For:
  - Audio transcription
  - Interview feedback generation
  - DSA problem generation
- **Web Speech API** - Browser-based voice recording
- **Pyodide 0.28.2** - In-browser Python execution
- **Judge0 API** - Online code compilation for C++/Java

### Utilities
- **TanStack Query 5.56.2** - Data fetching and caching
- **Sonner** - Toast notifications
- **date-fns** - Date formatting

---

## 📁 File Structure & Responsibilities

### Core Application Files

```
src/
├── main.tsx                    # Application entry point, renders App into DOM
├── App.tsx                     # Main app component with routing setup
├── App.css                     # Global application styles
└── index.css                   # Tailwind base styles + design tokens
```

### Page Components (Routes)

```
src/pages/
├── Index.tsx                   # Home page with features showcase
├── HRInterview.tsx             # HR interview practice with voice recording
├── Practice.tsx                # DSA coding practice interface
└── NotFound.tsx                # 404 error page
```

### Reusable Components

```
src/components/
├── ErrorBoundary.tsx           # Catches and displays React errors
├── Hero.tsx                    # Landing page hero section
├── Features.tsx                # Feature cards display
├── LearningOutcomes.tsx        # Educational benefits section
└── Footer.tsx                  # Site footer with links
```

### UI Components (shadcn/ui)

```
src/components/ui/
├── button.tsx                  # Customizable button variants
├── card.tsx                    # Card containers
├── badge.tsx                   # Status badges
├── textarea.tsx                # Multi-line text input
├── toast.tsx & toaster.tsx     # Notification system
├── use-toast.ts                # Toast hook for notifications
└── [50+ other UI components]   # Dialogs, dropdowns, forms, etc.
```

### Library & Utilities

```
src/lib/
├── google.ts                   # Google Gemini AI integration
│   ├── transcribeAudio()       # Converts speech to text
│   ├── generateInterviewFeedback()  # AI feedback for answers
│   └── generateDSAProblem()    # Creates unique DSA problems
├── openai.ts                   # (Legacy/unused OpenAI integration)
└── utils.ts                    # Utility functions (cn for classNames)
```

### Hooks

```
src/hooks/
├── use-toast.ts                # Toast notification management
└── use-mobile.tsx              # Responsive breakpoint detection
```

### Configuration Files

```
Root/
├── tailwind.config.ts          # Tailwind CSS configuration
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript compiler settings
└── index.html                  # HTML entry point
```

---

## 🔄 Data Flow & Architecture

### 1. HR Interview Practice Flow (`HRInterview.tsx`)

```
User clicks "Start Recording"
        ↓
MediaRecorder API captures audio
        ↓
Audio saved as Blob (WebM/WAV format)
        ↓
Sent to google.ts → transcribeAudio()
        ↓
Google Gemini API (gemini-2.5-flash) converts audio to text
        ↓
Transcription displayed on screen
        ↓
User clicks "Get Feedback"
        ↓
Sent to google.ts → generateInterviewFeedback()
        ↓
Google Gemini API (gemini-2.0-flash-exp) analyzes answer
        ↓
AI feedback displayed to user
```

**Key Files:**
- `src/pages/HRInterview.tsx` - UI & recording logic
- `src/lib/google.ts` (lines 37-107) - Audio transcription
- `src/lib/google.ts` (lines 109-153) - Feedback generation

**State Management:**
```typescript
useState<boolean>(isRecording)        // Recording status
useState<Blob | null>(audioBlob)      // Recorded audio
useState<string>(transcription)       // Speech-to-text result
useState<string>(feedback)            // AI feedback
useRef<MediaRecorder>(mediaRecorder)  // Recording instance
```

---

### 2. DSA Practice Flow (`Practice.tsx`)

```
User selects difficulty (beginner/intermediate/advanced)
        ↓
Clicks "AI Generate New"
        ↓
Sent to google.ts → generateDSAProblem(difficulty)
        ↓
Google Gemini API (gemini-2.0-flash-exp) creates problem
        ↓
Problem displayed with:
  - Title, Description
  - Examples (input/output/explanation)
  - Constraints, Hints
        ↓
User writes code in editor (JavaScript/Python/Java/C++)
        ↓
Clicks "Run Code"
        ↓
Code execution based on language:

[JavaScript]
  → Direct execution in browser (new Function())
  → Output captured via console.log override

[Python]
  → Executed via Pyodide (in-browser Python interpreter)
  → Output captured from sys.stdout

[C++/Java]
  → Sent to Judge0 API (RapidAPI)
  → Compiled and executed on remote server
  → Results returned (stdout/stderr)
        ↓
Output displayed to user
```

**Key Files:**
- `src/pages/Practice.tsx` - Main coding interface
- `src/lib/google.ts` (lines 155-283) - Problem generation
- `src/pages/Practice.tsx` (lines 257-383) - Code execution

**Problem Generation API Call:**
```typescript
// Includes timestamp & random seed for uniqueness
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Create a UNIQUE ${difficulty} level DSA problem...
                 Problem seed: ${randomSeed} | Timestamp: ${timestamp}`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.7
      }
    })
  }
);
```

**State Management:**
```typescript
useState<string>(selectedLanguage)     // js/python/java/cpp
useState<string>(selectedDifficulty)   // beginner/intermediate/advanced
useState<Problem>(currentProblem)      // Active DSA problem
useState<string>(code)                 // User's code
useState<string>(output)               // Execution output
useState<number>(timeElapsed)          // Timer for solving
useState<any>(pyodide)                 // Python interpreter instance
```

---

## 🔐 API Keys & Configuration

### Google Gemini API
**Location:** `src/lib/google.ts` (line 2)
```typescript
const GOOGLE_API_KEY = "AIzaSyAuC6bZj7uQD67I8C_pVfcQ4eFHoDMfBmA";
```

**Models Used:**
- `gemini-2.5-flash` - Audio transcription (faster, cost-effective)
- `gemini-2.0-flash-exp` - Feedback & problem generation (experimental, more creative)

### Judge0 API (Optional)
**Location:** `src/pages/Practice.tsx` (line 99, 354)
```typescript
'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY'  // Needs user configuration
```

---

## 🎨 Design System

### Color Tokens (`src/index.css`)
All colors use HSL semantic tokens for consistent theming:
```css
--primary: [main brand color]
--secondary: [accent color]
--background: [page background]
--foreground: [text color]
--destructive: [error states]
```

### Component Variants (`src/components/ui/button.tsx`)
Buttons use class-variance-authority (CVA) for type-safe variants:
```typescript
variants: {
  variant: ["default", "destructive", "outline", "secondary", "ghost", "link"],
  size: ["default", "sm", "lg", "icon"]
}
```

---

## 🚀 Application Routing

**Router Configuration** (`src/App.tsx`):
```
/ (root)                → Index.tsx (Home page)
/hr-interview           → HRInterview.tsx (Voice practice)
/practice               → Practice.tsx (Coding challenges)
* (catch-all)           → NotFound.tsx (404 page)
```

---

## 🔧 Error Handling

### Global Error Boundary
**File:** `src/components/ErrorBoundary.tsx`

Catches React errors and displays fallback UI instead of blank screen:
```typescript
<ErrorBoundary>
  <Router>...</Router>
</ErrorBoundary>
```

### API Error Handling
**File:** `src/lib/google.ts`

**Retry Logic** (lines 8-35):
- 3 retry attempts with exponential backoff
- Special handling for 503 errors (service overload)
- Extended delays for overloaded services

**Error Types Handled:**
- `MAX_TOKENS` - Response too long, retry with adjusted settings
- `SAFETY` - Content filtered, prompt user to rephrase
- `503` - Service overload, longer retry delay
- `JSON Parse Errors` - Fallback to default problem

---

## 📊 Performance Optimizations

### Code Execution
1. **JavaScript**: Runs in-browser (no network latency)
2. **Python**: Pyodide loads once, cached for session
3. **C++/Java**: Falls back to simulation if API fails

### Memory Management
- Pyodide cleanup on component unmount (`Practice.tsx` lines 232-254)
- MediaRecorder cleanup on unmount (`HRInterview.tsx` lines 10-21)

---

## 🧪 Testing & Debugging

### API Status Indicators
**File:** `src/pages/Practice.tsx` (lines 404-426)

Visual indicators show API health:
- ✅ Green - Working
- ❌ Red - Failed
- ⏳ Yellow - Testing
- ? Gray - Untested

### Test Functions
```typescript
testGoogleAPI()  // Validates Gemini API key
testJudge0API()  // Validates RapidAPI key
```

---

## 🔮 Future Enhancement Opportunities

1. **Backend Migration**: Move API keys to secure backend (Lovable Cloud)
2. **User Accounts**: Save progress, history, and preferences
3. **More Languages**: Add support for Go, Rust, TypeScript
4. **Problem Database**: Store custom problems
5. **Collaborative Coding**: Real-time pair programming
6. **Video Interviews**: Add webcam support for mock interviews

---

## 📝 Key Learning Points

### For New Developers

**Understanding Component Hierarchy:**
```
App.tsx (Router)
  └─ ErrorBoundary
      └─ Routes
          ├─ Index (Home)
          ├─ HRInterview (Voice Practice)
          └─ Practice (Coding)
```

**State vs Props:**
- **State** (`useState`): Data owned by component, can change
- **Props**: Data passed from parent, read-only

**API Integration Pattern:**
1. User action triggers event
2. Component calls function from `src/lib/google.ts`
3. Function makes API request
4. Response updates component state
5. UI re-renders with new data

**Styling Approach:**
- Use semantic tokens (e.g., `text-foreground` not `text-white`)
- Leverage UI component variants
- Customize `index.css` for design system changes

---

## 🆘 Common Issues & Solutions

### Issue: Blank Screen After Question Generation
**Cause:** AI returns nested objects instead of strings  
**Fix:** Sanitization in `google.ts` (lines 240-251) converts objects to JSON strings

### Issue: Python Code Not Running
**Cause:** Pyodide not loaded yet  
**Fix:** Check `pyodide` state, show loading message

### Issue: Same Question Generated Multiple Times
**Cause:** AI lacks randomness  
**Fix:** Add timestamp + random seed to prompt (lines 161-162)

### Issue: Audio Recording Fails
**Cause:** Browser permissions or unsupported format  
**Fix:** Request microphone permission, fallback to different MIME types

---

## 📞 Support & Resources

- **Documentation**: This file
- **Main Entry Point**: `src/main.tsx`
- **Routing Logic**: `src/App.tsx`
- **API Integration**: `src/lib/google.ts`
- **UI Components**: `src/components/ui/`

---

**Last Updated:** 2025-10-13  
**Version:** 1.0  
**Maintained By:** Development Team
