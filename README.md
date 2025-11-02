# 🚀 Code Speak Prep Pro

This project primarily uses the **Google API key** for all main functionalities such as AI-based responses, speech processing, and other integrations.  
The **OpenAI API key** is included only as a backup option but is currently **not in use** or may not work properly in this version.

All API keys are stored directly inside the project for simplicity.  
If you want to change or update them, open the following files:

- `src/lib/google.ts` → contains the **Google API key** *(main key used in the project)*  
- `src/lib/openai.ts` → contains the **OpenAI API key** *(backup key, not currently active)*


Replace the existing keys with your own inside these files, for example:

```ts
// src/lib/google.ts
export const GOOGLE_API_KEY = "your-google-api-key-here";

// src/lib/openai.ts
export const OPENAI_API_KEY = "your-openai-api-key-here";
**Code Speak Prep Pro** is a full-stack web application that helps users prepare for technical interviews using **AI-powered HR interview practice** and **Data Structures & Algorithms (DSA)** challenges.  
It is built using **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **shadcn-ui** for a clean, modern, and fast development experience.

---

## 🧠 About the Project

This project allows users to:
- Practice HR interviews using AI-based voice interactions
- Solve DSA questions and coding problems in a structured interface
- Experience a real-time preview and instant feedback system
- Learn with a clean and responsive UI design

It integrates **Google** and **OpenAI APIs** for generative AI, speech, and natural language functionalities.

---

## ⚙️ Installation & Setup Guide

Before running the project, make sure **Node.js** and **npm** are installed on your system.  
If not, install them using [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm#installing-and-updating).

Follow these steps to set up and run the project locally:

```bash
# Step 1: Clone this repository using your Git URL
git clone <YOUR_GIT_URL>

# Step 2: Navigate into the project folder
cd <YOUR_PROJECT_NAME>

# Step 3: Install all dependencies
npm i

# Step 4: Start the development server
npm run dev
