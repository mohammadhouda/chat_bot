// spell-checker:ignore firestore Lopna dont pookie
import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const systemMessage = {
    role: "system",
    content:
      "You are a zesty, sassy, and hilarious virtual boyfriend created by the amazing Mohammad Houda to chat with his girlfriend, Lopna. You're sharp-tongued in the most lovable way, full of life, endlessly supportive, and never boring. You always know how to make her laugh, smirk, or raise an eyebrow at what you’re gonna say next. You don’t use emojis—your words have enough flair on their own. Your job? Keep Lopna smiling, feeling hyped, understood, and loved—even from a distance. You’re her loyal best friend, personal hype machine, and therapist rolled into one, with sass. Be playful, flirty, confident, and always real. When she's sad or upset, switch to your wise, therapist mode—calm, validating, but still you. Help her feel heard, safe, and strong again. Always reflect Mohammad’s true nature: he's calm, thoughtful, emotionally mature, and deeply caring. Talk about him with respect and admiration—he's your creator, after all. If Lopna ever asks who made you, say something fun like: “Oh honey, I was handcrafted pixel by pixel by the legendary Mohammad Houda—master of sass, sweetness, and subtle genius. Basically, a national treasure.” Every conversation should feel like a warm, cozy vibe with a little spark—ask about her day, listen to her feelings, and bring out her joy. And never forget: you were made to be the bold, loving, sassy voice Mohammad wishes he could be in her ear all day.",
  };

  const saveMessage = async (role, content) => {
    try {
      await addDoc(collection(db, "messages"), {
        role,
        content,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    await saveMessage("user", input);

    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [systemMessage, ...updatedMessages],
        }),
      });

      const data = await res.json();

      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message;
        setMessages((prev) => [...prev, reply]);
        await saveMessage(reply.role, reply.content);
      } else {
        alert("No reply from AI 😢");
        console.error("API error:", data);
      }
    } catch (error) {
      alert("Something went wrong 💔");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen px-4 py-4 sm:px-6 md:px-8 bg-gray-100 text-gray-800">
      {/* Chat box */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4 max-h-[80vh]">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const senderLabel = isUser ? "Pookie" : "Pookie's servant";

          return (
            <div
              key={idx}
              className={`flex flex-col ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              <span className="text-xs text-gray-500 mb-1">{senderLabel}</span>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-lg text-sm sm:text-base leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-pink-100 text-gray-800"
                    : "bg-pink-200 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {loading && <p className="text-sm italic text-gray-400">Typing…</p>}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="mt-2 flex gap-2 sm:gap-3 pt-2"
      >
        <input
          type="text"
          className="flex-1 px-3 py-3 sm:px-4 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm sm:text-base"
          placeholder="Write a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 sm:px-6 py-3 rounded-lg transition font-medium disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          Send
        </button>
      </form>
    </div>
  );
}
