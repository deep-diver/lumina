import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Goal, ScheduledBlock, MindAnalysis, StatsReflection, EssayData, ModelSettings } from "../types";

// Default settings based on user preference (Flash for speed, Pro for complex/quality)
let currentSettings: ModelSettings = {
  basicAnalysisModel: "gemini-2.5-flash",
  appGeneratorModel: "gemini-3-pro-preview",
  storytellingModel: "gemini-3-pro-preview",
  bannerImageModel: "gemini-2.5-flash-image",
  reflectionImageModel: "gemini-3-pro-image-preview"
};

export const updateModelSettings = (settings: ModelSettings) => {
  currentSettings = settings;
};

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// --- BASIC ANALYSIS & SUGGESTIONS (Uses basicAnalysisModel) ---

export const suggestFlexibleTask = async (
  user: UserProfile,
  durationMinutes: number,
  context: string
): Promise<{ title: string; description: string }> => {
  try {
    const ai = getAIClient();
    const prompt = `
      Recommend a productive or well-being activity for a user with these details:
      Name: ${user.name}, Age: ${user.age}, Gender: ${user.gender}, Background: ${user.race}, Bio: ${user.bio}.
      
      The user has a gap of ${durationMinutes} minutes.
      Context/User Request: ${context}
      
      Suggest a specific, actionable task title and a very brief description.
    `;

    const response = await ai.models.generateContent({
      model: currentSettings.basicAnalysisModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error suggesting task:", error);
    return { title: "Read a book", description: "Spend some time reading." };
  }
};

export const suggestTaskMethods = async (
  user: UserProfile,
  taskTitle: string,
  durationMinutes: number
): Promise<{ title: string; description: string }[]> => {
  try {
    const ai = getAIClient();
    const prompt = `
      The user wants to perform the task: "${taskTitle}" for ${durationMinutes} minutes.
      User Profile: ${user.name}, ${user.age} years old, ${user.bio}.
      
      Provide 3 distinct, creative, and actionable "Methods" or "Approaches" to perform this task effectively.
      For example, if the task is "Study Math", methods could be "Pomodoro Drill", "Feynman Technique", or "Practice Test Run".
      
      Return exactly 3 items.
    `;

    const response = await ai.models.generateContent({
      model: currentSettings.basicAnalysisModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "description"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error suggesting methods:", error);
    return [
      { title: "Standard Approach", description: "Just do it normally." },
      { title: "Focus Mode", description: "Remove all distractions." },
      { title: "Speed Run", description: "Try to do it as fast as possible." }
    ];
  }
};

export const analyzeDailyLog = async (
  user: UserProfile,
  completedTasks: ScheduledBlock[],
  goals: Goal[]
): Promise<{ achievements: { goalId: string; description: string }[]; summary: string }> => {
  try {
    const ai = getAIClient();
    
    const tasksStr = completedTasks.map(t => `- ${t.title} (${t.type})`).join("\n");
    const goalsStr = goals.map(g => `- ID: ${g.id}, Goal: ${g.title}, Desc: ${g.description}`).join("\n");

    const prompt = `
      User: ${user.name} (${user.age}yo).
      
      Completed Tasks Today:
      ${tasksStr}

      Life-Long Goals:
      ${goalsStr}

      Task:
      1. Analyze the completed tasks.
      2. Identify if any tasks contribute meaningfully to the Life-Long Goals.
      3. Create specific "Achievements" linking a task to a goal.
      4. Write a brief encouraging summary of the day.

      Note: Not every task needs to link to a goal. Only link if there is a logical connection (e.g., "Math Study" -> "Become a Scientist").
    `;

    const response = await ai.models.generateContent({
      model: currentSettings.basicAnalysisModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            achievements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  goalId: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Short achievement note" },
                },
                required: ["goalId", "description"],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ["achievements", "summary"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error analyzing log:", error);
    return { achievements: [], summary: "Could not analyze tasks at this time." };
  }
};

export const analyzeMentalHealth = async (
  user: UserProfile,
  schedule: ScheduledBlock[]
): Promise<MindAnalysis> => {
  try {
    const ai = getAIClient();
    const tasksStr = schedule.map(t => `- ${t.startTime} to ${t.endTime}: ${t.title} (${t.type}) [${t.isCompleted ? 'Completed' : 'Planned'}]`).join("\n");
    const todayStr = new Date().toISOString().split('T')[0];

    const prompt = `
      Analyze this daily schedule for mental well-being impact.
      User Profile: ${user.name}, Age ${user.age}, Bio: ${user.bio}.
      Date: ${todayStr}
      
      Daily Schedule:
      ${tasksStr}

      Task:
      1. Estimate the user's likely status in 4 categories: Stress, Energy, Focus, Satisfaction.
      2. For 'Stress', a higher score means HIGHER stress (Bad). For others, higher is Good.
      3. Provide a short piece of advice.
    `;

    const categorySchema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER, description: "0-100 scale" },
        label: { type: Type.STRING, description: "e.g. Low, Moderate, High" }
      },
      required: ["score", "label"]
    };

    const response = await ai.models.generateContent({
      model: currentSettings.basicAnalysisModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallMood: { type: Type.STRING, description: "One word mood summary e.g. Balanced, Hectic, Calm" },
            categories: {
              type: Type.OBJECT,
              properties: {
                stress: categorySchema,
                energy: categorySchema,
                focus: categorySchema,
                satisfaction: categorySchema
              },
              required: ["stress", "energy", "focus", "satisfaction"]
            },
            advice: { type: Type.STRING },
          },
          required: ["overallMood", "categories", "advice"],
        },
      },
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return { ...result, date: todayStr };
    }
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Error analyzing mental health:", error);
    const fallbackCat = { score: 0, label: "Unknown" };
    return { 
      date: new Date().toISOString().split('T')[0],
      overallMood: "Unknown",
      categories: { stress: fallbackCat, energy: fallbackCat, focus: fallbackCat, satisfaction: fallbackCat },
      advice: "Could not analyze at this moment." 
    };
  }
};

export const generateStatsReflection = async (
  user: UserProfile,
  stats: Record<string, number>
): Promise<StatsReflection> => {
  try {
    const ai = getAIClient();
    const statsStr = Object.entries(stats).map(([key, val]) => `${key}: ${val} minutes`).join(", ");

    const prompt = `
      Review these quantitative statistics for the user's task completion history.
      User: ${user.name}, ${user.age} years old.
      
      Time distribution (Total minutes per category):
      ${statsStr}
      
      Provide a structured review in JSON format containing:
      - strengths: Array of 3 distinct, concise keywords or short phrases (max 2-3 words) highlighting what went well (e.g., "Consistent Math", "Good Focus").
      - weaknesses: Array of 3 distinct, concise keywords or short phrases (max 2-3 words) highlighting areas for improvement (e.g., "Low Exercise", "Neglected Reading").
      - suggestions: Array of 3 distinct, concise keywords or short phrases (max 2-3 words) for action (e.g., "Try Pomodoro", "Walk Outside").
      - summary: A cohesive paragraph summarizing the feedback.
    `;

    const response = await ai.models.generateContent({
      model: currentSettings.basicAnalysisModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING }
            },
            required: ["strengths", "weaknesses", "suggestions", "summary"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error generating stats reflection:", error);
    return {
        strengths: ["Consistency", "Tracking"],
        weaknesses: ["Data needed", "New habit"],
        suggestions: ["Log daily", "Be honest"],
        summary: "Great job tracking your time! Continue to build your history for better insights."
    };
  }
}

export const generateReflectionText = async (
  user: UserProfile,
  taskTitle: string,
  facts: string[],
  currentDescription: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    const factsStr = facts.filter(f => f.trim() !== "").join(", ");
    
    let instruction = "";
    if (!factsStr && !currentDescription) {
      instruction = "The user completed this task but didn't write anything. Generate a hypothetical, positive, productive 1st-person journal entry describing what they likely did based on the task title.";
    } else if (factsStr && !currentDescription) {
      instruction = `The user provided these facts: "${factsStr}". Weave these facts into a cohesive 2-3 sentence 1st-person journal entry.`;
    } else {
      instruction = `The user wrote this draft: "${currentDescription}". And provided these additional facts: "${factsStr}". Rewrite this into a polished, engaging 1st-person journal entry that combines both sources.`;
    }

    const prompt = `
      User: ${user.name} (${user.age}, ${user.gender}, ${user.race}).
      Task: ${taskTitle}
      
      ${instruction}
      
      Keep it personal, encouraging, and written in the first person ("I did...").
    `;

    const response = await ai.models.generateContent({
      model: currentSettings.basicAnalysisModel,
      contents: prompt,
      config: {
        responseMimeType: "text/plain",
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating reflection text:", error);
    return currentDescription || "Could not generate text.";
  }
};

// --- APP GENERATION (Uses appGeneratorModel) ---

export const generateMiniAppStream = async function* (
  user: UserProfile,
  taskTitle: string,
  methodTitle: string,
  methodDescription: string
) {
  const ai = getAIClient();
  const prompt = `
    You are an expert full-stack web developer.
    Create a single-file self-contained HTML application (HTML, CSS, JS inside one file) that helps the user perform a specific task.
    
    User Profile: ${user.name}, ${user.age} years old.
    Task: ${taskTitle}
    Method to Implement: ${methodTitle}
    Method Description: ${methodDescription}

    **CRITICAL: Determine the App Type based on the Task**
    1. **LEARNING/STUDYING (e.g., "Study Math", "Read History", "Learn Code", "Memorize"):**
       - Create an **Interactive Learning Web Page**.
       - Focus on **knowledge consumption** and **active recall**.
       - Features could include: Interactive Flashcards, Expandable Summaries, Quiz Modules with immediate feedback, "Fill in the blank" exercises, or a Concept Map explorer.
       - **Content:** Since you don't have the user's specific study notes, generate **relevant example content** based on the Task Title. For example, if the task is "Study Calculus", generate actual Calculus practice problems or flashcards.
       - DO NOT make a generic timer or tracker for these. Make it about the *subject*.
    
    2. **DOING/CREATING (e.g., "Workout", "Budgeting", "Write Email", "Plan Trip"):**
       - Create a **Functional Tool/Utility**.
       - Features could include: Specialized Calculators, Gamified Progress Trackers, Guided Wizards, Generators, or Checklists.

    **Design Requirements:**
    1. Use a modern, **"Dreamy Midnight"** aesthetic to match the parent app.
    2. **Colors:** Background: Slate-900 (#0f172a). Accents: Pink-500 (#ec4899), Violet-500 (#8b5cf6), Teal-500 (#14b8a6).
    3. **Font:** Use 'Quicksand' from Google Fonts (<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">) and set font-family to 'Quicksand', sans-serif.
    4. **Styling:** Use Tailwind CSS (<script src="https://cdn.tailwindcss.com"></script>). Use rounded-3xl, soft gradients, and backdrop-blur effects.
    
    **Technical Requirements:**
    1. The app MUST be contained in a single HTML string.
    2. Ensure all JavaScript is valid, robust, and handles errors gracefully.
    3. Output ONLY the raw HTML code. Do NOT wrap it in markdown code blocks (like \`\`\`html). Just the code.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: currentSettings.appGeneratorModel,
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating app:", error);
    yield "<!-- Error generating app. Please try again. -->";
  }
};

export const generateStaticPageStream = async function* (
  user: UserProfile,
  taskTitle: string,
  methodTitle: string,
  methodDescription: string
) {
  const ai = getAIClient();
  const prompt = `
    You are an expert web designer and educator.
    Create a single-file **Static Educational Web Page** (HTML, CSS) that explains a specific concept or method to the user.
    
    **User Context:**
    User: ${user.name}, ${user.age} years old.
    Task: ${taskTitle}
    Topic/Method: ${methodTitle}
    Description: ${methodDescription}

    **Objective:**
    - Use the provided Google Search tools to find accurate, up-to-date information about the Topic/Method.
    - Synthesize this information into a beautiful, readable guide.
    - This is NOT an interactive tool. It is a Knowledge Page (like a Wikipedia article or a blog post but styled beautifully).
    
    **Content Requirements:**
    1. **Title:** Clear and catchy.
    2. **Introduction:** What is this method? Why is it useful for this task?
    3. **Step-by-Step Guide:** How to do it.
    4. **Tips & Tricks:** Advice found from search results.
    5. **Key Takeaways:** Bullet points.

    **Design Requirements:**
    1. Use a modern, **"Dreamy Midnight"** aesthetic to match the parent app.
    2. **Colors:** Background: Slate-900 (#0f172a). Text: Slate-200. Headers: Gradients (Pink/Violet/Teal).
    3. **Font:** Use 'Quicksand' (<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">).
    4. **Styling:** Use Tailwind CSS (<script src="https://cdn.tailwindcss.com"></script>). Use cards, distinct sections, and good typography.
    
    **Technical Requirements:**
    1. Single HTML string.
    2. Output ONLY the raw HTML code. Do NOT wrap it in markdown.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview", // Use Pro model for search capabilities
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding
      }
    });

    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating static page:", error);
    yield "<!-- Error generating page. Please try again. -->";
  }
};

// --- STORYTELLING (Uses storytellingModel) ---

export const generateDailyEssay = async (
  user: UserProfile,
  completedTasks: ScheduledBlock[]
): Promise<EssayData> => {
  try {
    const ai = getAIClient();

    // Prepare data for the prompt
    const tasksData = completedTasks.map(t => ({
      id: t.id,
      time: `${t.startTime}-${t.endTime}`,
      title: t.title,
      description: t.description || "",
      facts: t.facts?.filter(f => f) || [],
      hasImage: !!t.imageUrl,
      hasAppGenerated: !!t.generatedAppKey
    }));

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `
      You are a creative ghostwriter and biographer for the user: ${user.name}.
      Current Date: ${dateStr}.
      Write a cohesive, engaging, and first-person narrative "Essay" or "Diary Entry" about their day based on their completed schedule.
      
      Tasks Completed Today:
      ${JSON.stringify(tasksData, null, 2)}

      Instructions:
      1. Write a fluent story, not a list. Connect events logically.
      2. If a task has 'hasImage: true', you MUST insert an "image" section at the appropriate moment in the story to illustrate it.
      3. If a task has 'hasAppGenerated: true', you MUST insert an "app_link" section inviting the user to re-open the tool they built.
      4. If the user provided logs (facts/description), incorporate them deeply. If not, infer likely positive details based on the title.
      5. Identify specific methods or actions (e.g. "Pomodoro", "Meditation", "Running") and use the "highlight" section type to make them interactive.

      Output JSON format:
      {
        "title": "A creative title for the day",
        "date": "YYYY-MM-DD",
        "sections": [
          { "type": "text", "content": "Paragraph text..." },
          { "type": "image", "relatedTaskId": "id_of_task", "content": "Caption for image" },
          { "type": "app_link", "relatedTaskId": "id_of_task", "appTitle": "Name of app/tool inferred", "content": "Link text like 'Open the Timer'" },
          { "type": "highlight", "content": "The Method Name", "tooltip": "Description of method" }
        ]
      }
      
      Note: Use 'text' for the main narrative. Break paragraphs into separate 'text' sections.
    `;

    const response = await ai.models.generateContent({
      model: currentSettings.storytellingModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["text", "image", "app_link", "highlight"] },
                  content: { type: Type.STRING },
                  relatedTaskId: { type: Type.STRING },
                  appTitle: { type: Type.STRING },
                  tooltip: { type: Type.STRING }
                },
                required: ["type", "content"]
              }
            }
          },
          required: ["title", "date", "sections"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response");
  } catch (error) {
    console.error("Error generating essay:", error);
    return {
      title: "My Day",
      date: new Date().toISOString(),
      sections: [{ type: 'text', content: "Could not generate essay at this time." }]
    };
  }
}

// --- IMAGE GENERATION (Uses bannerImageModel or reflectionImageModel) ---

export const generateStatsBanner = async (
  user: UserProfile,
  stats: Record<string, number>
): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const statsStr = Object.entries(stats)
      .filter(([_, val]) => val > 0)
      .map(([key, val]) => `${key} (${val}m)`)
      .join(", ");

    const prompt = `
      Create a beautiful watercolor painting representing a visual summary of the user's day based on these activities: ${statsStr}.
      The image should be artistic, abstract, and visualize the balance and flow of these activities.
      Use a watercolor style.
      The aspect ratio is landscape (16:9).
      User Context: ${user.name}, ${user.age} years old.
    `;

    const response = await ai.models.generateContent({
      model: currentSettings.bannerImageModel, 
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating stats banner:", error);
    return null;
  }
}

export const generateTaskBanner = async (taskTitle: string): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const prompt = `Generate an abstract, modern, wide landscape banner image representing the concept: "${taskTitle}". Minimalistic, artistic, suitable for a dark UI header. No text in image.`;
    
    // For banners, we use the lighter/faster image model by default usually, but respecting the setting
    const response = await ai.models.generateContent({
      model: currentSettings.bannerImageModel,
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
       if (part.inlineData) {
         return `data:image/png;base64,${part.inlineData.data}`;
       }
    }
    return null;
  } catch (error) {
    console.error("Error generating banner:", error);
    return null;
  }
}

export const generateReflectionImage = async (
  user: UserProfile,
  taskTitle: string,
  description: string
): Promise<string | null> => {
  try {
    const ai = getAIClient();
    
    const prompt = `
      A photorealistic, artistic, high-quality image representing this moment: "${taskTitle}: ${description}".
      
      Context: The subject is a ${user.age} year old ${user.gender} of ${user.race} descent.
      Style: Cinematic, slightly dark/moody but with nice lighting (Cyberpunk/Lo-fi or Natural calm depending on context), aesthetic.
      The image should be suitable for a personal life-log.
    `;

    const response = await ai.models.generateContent({
      model: currentSettings.reflectionImageModel, // Usually high quality Pro model
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;

  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};