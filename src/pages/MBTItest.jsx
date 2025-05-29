import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

 

  
const questions = [
  {
    question: "You feel energized by...",
    options: [
      { text: "Being around people", trait: "E" },
      { text: "Spending time alone", trait: "I" },
    ],
  },
  {
    question: "When solving problems, you...",
    options: [
      { text: "Trust experience", trait: "S" },
      { text: "Trust intuition", trait: "N" },
    ],
  },
  {
    question: "You make decisions based on...",
    options: [
      { text: "Logic", trait: "T" },
      { text: "Emotions", trait: "F" },
    ],
  },
  {
    question: "You prefer to...",
    options: [
      { text: "Have a clear plan", trait: "J" },
      { text: "Go with the flow", trait: "P" },
    ],
  },
  {
    question: "In social situations...",
    options: [
      { text: "You start conversations", trait: "E" },
      { text: "You wait to be approached", trait: "I" },
    ],
  },
  {
    question: "You focus on...",
    options: [
      { text: "What is real", trait: "S" },
      { text: "What could be", trait: "N" },
    ],
  },
  {
    question: "In a group project, you...",
    options: [
      { text: "Stick to logic", trait: "T" },
      { text: "Consider people’s feelings", trait: "F" },
    ],
  },
  {
    question: "Your schedule is usually...",
    options: [
      { text: "Organized and set", trait: "J" },
      { text: "Flexible and spontaneous", trait: "P" },
    ],
  },
];

export default function MBTITest() {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleAnswer = (trait) => {
    const updated = { ...scores, [trait]: scores[trait] + 1 };
    setScores(updated);

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      const mbti =
        (updated.E >= updated.I ? "E" : "I") +
        (updated.S >= updated.N ? "S" : "N") +
        (updated.T >= updated.F ? "T" : "F") +
        (updated.J >= updated.P ? "J" : "P");
      setResult(mbti);
    }
  };
  const handleSave = () => {
    console.log("Saving MBTI to localStorage:", result);
    localStorage.setItem("mbtiResult", result);
    navigate("/edit-profile");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-700 rounded-2xl shadow-xl">
      {!result ? (
        <div>
          <h2 className="text-xl font-bold mb-4">Question {currentQ + 1} of {questions.length}</h2>
          <p className="text-lg mb-6">{questions[currentQ].question}</p>
          <div className="grid gap-4">
            {questions[currentQ].options.map((opt, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(opt.trait)}
                className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-pink-700 transition"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You are an <span className="text-pink-600">{result}</span></h2>
          <button onClick={handleSave} className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition">
            Save
          </button>
        </div>
      )}
    </div>
  );
}
