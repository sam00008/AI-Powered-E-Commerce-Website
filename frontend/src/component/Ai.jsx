import React, { useContext, useState, useEffect, useCallback, useRef } from "react";
import aiIcon from "../../public/chat.webp"; // Ensure this path is correct
import { ShopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

// --- 🧠 AI PROCESSING ENGINE (Levenshtein Distance) ---
// This calculates how similar two strings are (0 to 100%)
const getSimilarity = (s1, s2) => {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
};

const editDistance = (s1, s2) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

// ✅ 1. Persistent recognition instance
let recognition = null;
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = true;
}

// --- 🚀 2. Command Data Structure ---

const rawNavCommands = {
  "go home|open home|home|homepage": "/",
  "show cart|open cart|go to bag|bag|cart|my cart": "/cart",
  "show new|new arrivals|latest products|new stuff": "/category/new",
  "show women|women's collection|ladies|for women": "/category/women",
  "show men|men's collection|mens|for men": "/category/men",
  "show kids|kids collection|children|baby": "/category/kids",
  "show jeans|jeans collection|denim|pants": "/category/jeans",
  "go to order|show orders|order history|my orders": "/orders",
  "show t-shirt|t-shirt collection|tees": "/category/t-shirts",
  "open shirt|shirt collection|formal shirts": "/category/shirts",
};

// 🛠️ Flatten commands for the AI processor
// This converts the object into a flat array of every possible phrase
const commandList = [];
Object.keys(rawNavCommands).forEach((key) => {
  const phrases = key.split("|");
  const path = rawNavCommands[key];
  phrases.forEach((phrase) => {
    commandList.push({ phrase: phrase.trim(), path });
  });
});

// 🧹 UI Commands (kept simple)
const uiCommands = [
  {
    regex: /\b(stop listening|turn off|mic off)\b/i,
    action: (speak, _, __, stopRef) => {
        speak("Turning off.");
        stopRef.current = true;
        if(recognition) recognition.stop();
    }
  },
  {
    regex: /\b(scroll down|go down)\b/i,
    action: (speak) => {
      speak("Scrolling down.");
      window.scrollBy({ top: 500, behavior: "smooth" });
    },
  },
  {
    regex: /\b(scroll up|go up)\b/i,
    action: (speak) => {
      speak("Scrolling up.");
      window.scrollBy({ top: -500, behavior: "smooth" });
    },
  },
];

const searchRegex = /(?:search for|find|look for|show me|do you have)\s+(.*)/i;

// --- React Component ---

function Ai() {
  const { setShowSearch, setSearchQuery } = useContext(ShopDataContext);
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const intendedStop = useRef(false);

  // ✅ Speak function
  function speak(message) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    utterance.rate = 1; 
    window.speechSynthesis.speak(utterance);
  }

  // ✅ INTELLIGENT COMMAND PROCESSING
  const processCommand = useCallback(
    (transcript) => {
      const cleanTranscript = transcript.toLowerCase().trim();

      // 1️⃣ Check UI/Stop commands first (Regex is fine for strict actions)
      for (const cmd of uiCommands) {
        if (cmd.regex.test(cleanTranscript)) {
          cmd.action(speak, navigate, { setShowSearch }, intendedStop);
          return;
        }
      }

      // 2️⃣ FUZZY MATCHING (The "AI" Logic)
      // We compare what user said to every known command phrase
      let bestMatch = null;
      let highestScore = 0;

      commandList.forEach((cmd) => {
        // Calculate similarity score (0.0 to 1.0)
        const score = getSimilarity(cleanTranscript, cmd.phrase);
        
        // Bonus logic: Check if the transcript *includes* the phrase (for partial matches)
        const partialMatchBonus = cleanTranscript.includes(cmd.phrase) ? 0.2 : 0;
        const totalScore = score + partialMatchBonus;

        if (totalScore > highestScore) {
            highestScore = totalScore;
            bestMatch = cmd;
        }
      });

      // 🎯 Threshold: If confidence is > 60%, execute navigation
      console.log(`Best Match: "${bestMatch?.phrase}" with Score: ${highestScore}`);
      
      if (bestMatch && highestScore > 0.6) {
        speak(`Navigating to ${bestMatch.phrase}.`);
        navigate(bestMatch.path);
        return;
      }

      // 3️⃣ Search Fallback (If no navigation match, assume it's a search query)
      // This is smarter: if it doesn't match a path, try to find the "intent" to search
      const searchMatch = cleanTranscript.match(searchRegex);
      if (searchMatch) {
        const query = searchMatch[1].trim();
        speak(`Searching for ${query}`);
        setSearchQuery(query);
        setShowSearch(true);
        navigate("/search");
        return;
      } 
      // Fallback for direct product names without "search for" prefix
      // If the user says "Red Shoes" and it didn't match a page, let's search for it.
      else if (cleanTranscript.length > 3) {
         speak(`Searching for ${cleanTranscript}`);
         setSearchQuery(cleanTranscript);
         setShowSearch(true);
         navigate("/search");
         return;
      }

      speak("I didn't quite catch that.");
    },
    [navigate, setShowSearch, setSearchQuery]
  );

  // ✅ Speech Recognition Setup
  useEffect(() => {
    if (!recognition) return;

    const handleResult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      console.log("🗣️ User said:", transcript);
      processCommand(transcript);
    };

    const handleEnd = () => {
      setIsListening(false);
      if (!intendedStop.current) recognition.start(); // Auto-restart
    };

    recognition.addEventListener("result", handleResult);
    recognition.addEventListener("end", handleEnd);
    recognition.addEventListener("start", () => setIsListening(true));
    recognition.addEventListener("error", (e) => console.error("Error", e));

    return () => {
        recognition.removeEventListener("result", handleResult);
        recognition.removeEventListener("end", handleEnd);
        intendedStop.current = true;
        recognition.stop();
    };
  }, [processCommand]);

  const handleVoiceInput = () => {
    if (!recognition) {
        alert("Voice not supported in this browser.");
        return;
    }
    if (isListening) {
      intendedStop.current = true;
      recognition.stop();
      speak("Stopped listening.");
    } else {
      intendedStop.current = false;
      recognition.start();
      speak("I'm listening.");
    }
  };

  return (
    <div
      className="fixed lg:bottom-[20px] md:bottom-[40px] bottom-[80px] left-[2%] z-50"
      onClick={handleVoiceInput}
    >
      {isListening && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse whitespace-nowrap">
           LISTENING...
        </div>
      )}
      <img
        src={aiIcon}
        alt="AI Assistant"
        className={`w-[60px] md:w-[80px] lg:w-[100px] cursor-pointer hover:scale-105 transition-all duration-300 ${
          isListening ? "scale-110 drop-shadow-[0_0_15px_rgba(0,255,0,0.6)]" : "drop-shadow-lg"
        }`}
      />
    </div>
  );
}

export default Ai;