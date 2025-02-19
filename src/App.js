import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import "./index.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [Error, setError] = useState("");
  const [story, setStory] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [themeColor, setThemeColor] = useState();
  const [textColor, setTextColor] = useState();
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "Clever dog",
    "The last human",
    "The haunted house",
  ]);

  const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  const GEMINI_API_KEY = "AIzaSyBZi96EAEsdctf3UUi6VAdfLyhuKoc0_fA";

  const fetchStory = async () => {
    if (!prompt.trim()) {
      setError("Please tell me what story you want me to tell 😊.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }
      );
      const generatedStory = response.data.candidates[0].content.parts[0].text;
      setStory(generatedStory);
      extractThemeAndTextColor(generatedStory);
      fetchPromptSuggestions();
    } catch (err) {
      setError("Failed to generate a story. Please try again.");
      setStory("");
    } finally {
      setIsLoading(false);
    }
  };
  const extractThemeAndTextColor = async (storyText) => {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Suggest two contrasting hex colors that fit this story: "${storyText}". 
                                The first color should be a good theme color (background) and the second should be a readable text color on that background.
                                Return only the two hex colors, separated by a comma, without any additional text.`,
                },
              ],
            },
          ],
        }
      );

      const colors = response.data.candidates[0].content.parts[0].text
        .trim()
        .split(",");
      const themeColor = colors[0].trim();
      const textColor = colors[1].trim();

      setThemeColor(themeColor);
      setTextColor(textColor);
    } catch (err) {
      console.error("Error fetching theme and text colors:", err);
    }
  };

  const fetchPromptSuggestions = async () => {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: "Suggest three creative story prompts." }],
            },
          ],
        }
      );
      const suggestions =
        response.data.candidates[0].content.parts[0].text.split("\n");
      setSuggestedPrompts(suggestions);
    } catch (err) {
      console.error("Error fetching prompt suggestions:", err);
    }
  };
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div
      className={`story-container ${darkMode ? "dark" : ""}`}
      style={{ backgroundColor: themeColor }}
    >
      <h1 style={{ color: textColor }}>AI Storyteller</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your story prompt..."
      />
      <button
        onClick={fetchStory}
        disabled={isLoading}
        style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
      >
        {isLoading ? "Generating..." : "Generate Story"}
      </button>
      {Error && (
        <p
          className={darkMode ? "dark" : ""}
          style={{
            color: story !== "" ? textColor : "#6a5acd",
            fontWeight: "bold",
          }}
        >
          {Error}
        </p>
      )}

      <button
        onClick={toggleDarkMode}
        className="theme-toggle"
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "#6a5acd",
          position: "absolute",
          right: "2rem",
          top: "2rem",
        }}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {isLoading && (
        <p className="loading" style={{ color: story ? textColor : "" }}>
          Loading...
        </p>
      )}
      {story && (
        <div className="story-output">
          <h2 style={{ color: themeColor }}> Story:</h2>
          <ReactMarkdown>{story}</ReactMarkdown>
        </div>
      )}
      <div className="prompt-suggestions">
        <h3 style={{ color: textColor }}>Try these stories:</h3>
        <ul>
          {suggestedPrompts.map((sug, index) => (
            <li
              key={index}
              onClick={() => setPrompt(sug)}
              style={{
                cursor: "pointer",
                listStyleType: "none",
                color: textColor,
              }}
            >
              <ReactMarkdown>{sug}</ReactMarkdown>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
