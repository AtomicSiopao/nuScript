
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GenerationRequest, DesignPattern, GeneratedFile, Language, TestCaseData, TestStep } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAutomationScript = async (request: GenerationRequest): Promise<GeneratedFile[]> => {
  const { testCase, framework, pattern, language } = request;

  const modelName = 'gemini-3-pro-preview';

  const stepsText = testCase.steps
    .map((s, i) => `Step ${i + 1}: ${s.action}\n   Expected Result: ${s.expected}`)
    .join('\n\n');

  let prompt = `
    Role: Expert QA Automation Engineer.
    Task: Convert the following Manual Test Case into a robust automated test script suite.
    
    Target Framework: ${framework}
    Design Pattern: ${pattern}
    Programming Language: ${language}
    
    Test Case Details:
    ------------------
    ID: ${testCase.id}
    Title: ${testCase.title}
    Description: ${testCase.description}
    Preconditions: ${testCase.preconditions}
    Test Data: ${testCase.testData}
    
    Test Steps and Expected Results:
    ${stepsText}
    ------------------

    Requirements:
    1. Write clean, modern, and production-ready code.
    2. Add comments explaining the logic.
    3. Split the code into appropriate files based on the Design Pattern.
    4. **If the selected pattern is "${DesignPattern.Default}"**:
       - Generate a single, self-contained, and flat test script file.
       - Do NOT use any design patterns like Page Object Model or BDD/Gherkin.
       - Include all locators and logic directly within the test file.
    5. **If the selected pattern is "${DesignPattern.Gherkin}"**:
       - Strictly separate the .feature file and the step definitions.
    6. **If the selected pattern is "${DesignPattern.POM}"**:
       - Create separate files for Page Classes and Test Specs.
       - **CRITICAL**: Use **getter methods** for all locators in your Page Objects (e.g., \`get usernameInput() { return cy.get('#username'); }\`). Do NOT use public class fields or simple variables for locators.
       - Ensure robust selector strategies (prefer data-testid, id, or stable attributes).
    7. Include a dedicated file for the test data (e.g., JSON fixture) if the test data is complex, regardless of the pattern.
    8. Ensure valid ${language} syntax.
    9. Adhere to industry standards:
       - Use meaningful naming conventions.
       - Avoid hard-coded waits (use implicit/explicit waits or framework-specific assertions).
       - Ensure code is DRY (Don't Repeat Yourself).

    Return the response as a JSON object containing an array of files.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      files: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            filename: {
              type: Type.STRING,
              description: "The name of the file including extension (e.g., login.cy.ts, login.page.ts)",
            },
            content: {
              type: Type.STRING,
              description: "The full source code/content of the file.",
            },
          },
          required: ["filename", "content"],
        },
      },
    },
    required: ["files"],
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 },
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    const parsed = JSON.parse(text);
    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error("Invalid response format");
    }

    return parsed.files;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate script. Please try again.");
  }
};

export const suggestCompleteTestCase = async (title: string): Promise<Partial<TestCaseData>> => {
  const modelName = 'gemini-3-flash-preview';
  
  const prompt = `
    Role: Senior QA Engineer.
    Task: Generate detailed test case information based on the title: "${title}".
    
    Requirements:
    1. Description: A concise summary (1-2 sentences).
    2. Preconditions: List of necessary preconditions. Return as a numbered list string with each precondition separated by a newline character (\\n).
    3. Test Data: Relevant test data. Return this as a valid JSON string (e.g. {"username": "user"}).
    4. Steps: An array of steps, where each step has an "action" and a specific "expected" result for that action.
    
    Return the response as a JSON object.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING },
      preconditions: { type: Type.STRING },
      testData: { type: Type.STRING },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            expected: { type: Type.STRING }
          },
          required: ["action", "expected"]
        }
      },
    },
    required: ["description", "preconditions", "steps"],
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) return {};
    
    const parsed = JSON.parse(text);
    
    // Add unique IDs to suggested steps
    if (parsed.steps) {
        parsed.steps = parsed.steps.map((s: any) => ({
            ...s,
            id: Math.random().toString(36).substr(2, 9)
        }));
    }

    return parsed;
  } catch (error) {
    console.error("Suggestion Error:", error);
    return {};
  }
};
