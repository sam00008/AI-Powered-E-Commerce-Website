import React, { useContext, useState, useEffect, useCallback, useRef } from "react";
import aiIcon from "../../public/chat.webp";
import { ShopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

// ✅ 1. Persistent recognition instance (Unchanged)
let recognition = null;
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = true;
}

// --- 🚀 2. Pre-compiled Commands (Upgraded for Flexibility) ---

const rawNavCommands = {
  "go home|open home|home": "/",
  "show cart|open cart|go to bag|bag|cart": "/cart",
  "show new|new arrivals": "/category/new",
  "show women|women's collection": "/category/women",
  "show men|men's collection": "/category/men",
  "show kids|kids collection": "/category/kids",
  "show jeans|jeans collection": "/category/jeans",
  "go to order|show orders|order history": "/orders",
  "show t-shirt|t-shirt collection": "/category/t-shirts",
  "open shirt|shirt collection": "/category/shirts",
};

// 🎯 Conversational prefixes for navigation
const navPrefixes =
  "(?:show|open|go to|navigate to|take me to|show me|I want to see)";

const navigationCommands = Object.keys(rawNavCommands).map((pattern) => {
  const spoken = pattern
    .split("|")[0]
    .replace(/^(show|open|go to)\s/i, "")
    .trim();
  
  return {
    // This regex now matches "show me [pattern]" OR just "[pattern]"
    regex: new RegExp(`\\b(?:${navPrefixes}\\s+(?:the\\s+)?)?(${pattern})\\b`, "i"),
    path: rawNavCommands[pattern],
    spoken: spoken || "that",
  };
});

// 🧹 Pre-compiled UI Commands
const uiCommands = [
  {
    regex: /\b(open search|show search)\b/i,
    action: (speak, navigate, { setShowSearch }) => {
      speak("Opening search.");
      setShowSearch(true);
      navigate("/search");
    },
  },
  {
    regex: /\b(close search|hide search)\b/i,
    action: (speak, navigate, { setShowSearch }) => {
      speak("Closing search.");
      setShowSearch(false);
    },
  },
  {
    regex: /\b(scroll down)\b/i,
    action: (speak) => {
      speak("Scrolling down.");
      window.scrollBy({ top: 400, left: 0, behavior: "smooth" });
    },
  },
  {
    regex: /\b(scroll up)\b/i,
    action: (speak) => {
      speak("Scrolling up.");
      window.scrollBy({ top: -400, left: 0, behavior: "smooth" });
    },
  },
];

// 🎯 More flexible search regex
const searchRegex =
  /(?:search for|find|look for|show me|I want to see|do you have)\s+(.*)/i;

// --- React Component ---

function Ai() {
  const { setShowSearch, setSearchQuery } = useContext(ShopDataContext);
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const intendedStop = useRef(false);

  // ✅ Speak function (Unchanged)
  function speak(message) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  // ✅ Command Processing Logic (Re-ordered and enhanced)
  const processCommand = useCallback(
    (transcript) => {
      // 🛑 1. Stop Command (Highest Priority)
      if (/\b(mic off|stop listening|turn off)\b/i.test(transcript)) {
        speak("Turning off the microphone.");
        intendedStop.current = true;
        if (recognition) recognition.stop();
        return;
      }

      // 🗺️ 2. Simple Navigation (NOW CHECKED FIRST)
      for (const cmd of navigationCommands) {
        if (cmd.regex.test(transcript)) {
          speak(`Going to the ${cmd.spoken} page.`);
          navigate(cmd.path);
          return;
        }
      }

      // 🔎 3. Advanced Search Command (NOW CHECKED SECOND)
      const match = transcript.match(searchRegex);
      if (match) {
        const query = match[1].trim();
        if (query) {
          speak(`Searching for ${query}`);
          setSearchQuery(query);
          setShowSearch(true);
          navigate("/search");
          return;
        }
      }

      // 🖱️ 4. UI/Scroll Control (Now a clean loop)
      const uiContext = { setShowSearch };
      for (const cmd of uiCommands) {
        if (cmd.regex.test(transcript)) {
          cmd.action(speak, navigate, uiContext);
          return;
        }
      }

      // ❓ 5. Fallback
      if (transcript.length > 0) {
        speak("Sorry, I didn't understand that command.");
      }
    },
    [navigate, setShowSearch, setSearchQuery]
  );

  // ✅ useEffect to manage all listeners (Unchanged)
  useEffect(() => {
    if (!recognition) {
      console.error("Speech recognition not supported.");
      return;
    }

    const handleResult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim().toLowerCase();
      console.log("Transcript:", transcript);
      processCommand(transcript);
    };

    const handleError = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        speak("I need permission to use the microphone.");
        intendedStop.current = true;
      }
    };

    const handleStart = () => {
      setIsListening(true);
      intendedStop.current = false;
      console.log("Speech recognition started.");
    };

    const handleEnd = () => {
      setIsListening(false);
      console.log("Speech recognition ended.");
      if (!intendedStop.current) {
        console.log("Restarting recognition...");
        try {
          recognition.start();
        } catch (e) {
          console.warn("Restart failed:", e);
        }
      }
    };

    recognition.addEventListener("result", handleResult);
    recognition.addEventListener("error", handleError);
    recognition.addEventListener("start", handleStart);
    recognition.addEventListener("end", handleEnd);

    return () => {
      recognition.removeEventListener("result", handleResult);
      recognition.removeEventListener("error", handleError);
      recognition.removeEventListener("start", handleStart);
      recognition.removeEventListener("end", handleEnd);
      intendedStop.current = true;
      recognition.stop();
    };
  }, [processCommand]);

  // ✅ Toggle click handler (Unchanged)
  const handleVoiceInput = () => {
    if (!recognition) {
      speak("Sorry, your browser does not support voice recognition.");
      return;
    }

    if (isListening) {
      console.log("Stopping listening via click.");
      intendedStop.current = true;
      recognition.stop();
    } else {
      try {
        recognition.start();
        speak("How may I help you?");
      } catch (e) {
        console.warn("Recognition start failed:", e);
      }
    }
  };

  // --- JSX (Unchanged) ---
  return (
    <div
      className="fixed lg:bottom-[20px] md:bottom-[40px] bottom-[80px] left-[2%] z-50"
      onClick={handleVoiceInput}
    >
      {isListening && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          LISTENING...
        </div>
      )}
      <img
        src={aiIcon}
        alt="AI Assistant"
        className={`w-[100px] cursor-pointer hover:scale-105 transition-all ${
          isListening ? "scale-110 opacity-75 animate-pulse" : ""
        }`}
      />
    </div>
  );
}

export default Ai;