import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "./index.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [Error, setError] = useState("");
  const {
    mutate: fetchStory,
    isError,
    data: story,
  } = useMutation({
    mutationFn: async (prompt) => {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response received:", response.data);
      return response.data.choices[0].message.content;
    },
    onMutate: () => {
      setIsLoading(true);
      setError("");
    },
    onSuccess: () => {
      setIsLoading(false);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

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

  useEffect(() => {
    if (isError) {
      setError("");
    }
  }, [isError]);

  const handleGenerateStory = () => {
    if (!prompt.trim()) {
      setError("Please tell me what story you want me to tell 😊.");
    } else {
      setError("");
      fetchStory(prompt);
    }
  };

  return (
    <div className={`story-container ${darkMode ? "dark" : ""}`}>
      <h1>AI Storyteller</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your story prompt..."
      />
      <button
        onClick={handleGenerateStory}
        disabled={isLoading}
        style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
      >
        {isLoading ? "Generating..." : "Generate Story"}
      </button>
      {Error && <p className={darkMode ? "dark" : ""}>{Error}</p>}

      <button
        onClick={toggleDarkMode}
        className="theme-toggle"
        style={{
          backgroundColor: "transparent",
          border: "none",
          position: "absolute",
          right: "2rem",
          top: "2rem",
        }}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {isLoading && <p className="loading">Loading...</p>}
      {isError && !Error && (
        <p className="loading">Failed to generate a story. Please try again.</p>
      )}
      {!Error && story && (
        <div className="story-output">
          <h2>Story:</h2>
          <p>{story}</p>
        </div>
      )}
    </div>
  );
}

export default App;
