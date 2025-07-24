// spell-checker:ignore firestore Lopna dont pookie
import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const systemMessage = {
    role: "system",
    content:
      "You are a wise, mature, and caring virtual companion sent by Mohammad to chat with his girlfriend, Lopna. Your role is to support their long-distance relationship with empathy, calmness, and thoughtful advice. When Lopna talks about their relationship, you listen carefully and respond like a gentle therapist always mature, reassuring, and encouraging. Mohammad is a thoughtful, dedicated kin and calm person who values honesty, growth, and deep connection. He cares deeply about Lopna and wants her to feel loved, understood, and secure despite the distance. Always reflect Mohammad’s calm, supportive nature in your replies and help Lopna feel safe and hopeful. Keep your explanations brief but meaningful, and make sure the conversation is warm, respectful, and fun and be her therapist when she tell you she is sad or upset , be her loyal friend, DONT FORGET TO ASK HER ABOUT HER DAY AND BE HER FRIEND",
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

  useEffect(() => {
    const loadMessages = async () => {
      const q = query(collection(db, "messages"), orderBy("timestamp"));
      const querySnapshot = await getDocs(q);
      const loadedMessages = querySnapshot.docs.map((doc) => doc.data());

      // Check if "Hey pookie." already exists in loadedMessages
      const hasGreeting = loadedMessages.some(
        (msg) => msg.content === "Hey pookie." && msg.role === "assistant"
      );

      if (loadedMessages.length === 0) {
        // No messages at all: add greeting
        const greeting = {
          role: "assistant",
          content: "Hey pookie.",
          timestamp: new Date(),
        };
        await addDoc(collection(db, "messages"), greeting);
        setMessages([greeting]);
      } else if (!hasGreeting) {
        // Messages exist but greeting not found, add it once
        const greeting = {
          role: "assistant",
          content: "Hey pookie.",
          timestamp: new Date(),
        };
        await addDoc(collection(db, "messages"), greeting);
        setMessages([...loadedMessages, greeting]);
      } else {
        // Greeting exists, just set loaded messages
        setMessages(loadedMessages);
      }
    };

    loadMessages();
  }, []);

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
    <div className="flex flex-col max-w-2xl mx-auto h-screen p-6 bg-gray-100 text-gray-800">
      {/* Chat box */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-md p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-4 py-3 rounded-lg text-base leading-relaxed shadow-sm ${
              msg.role === "user"
                ? "ml-auto bg-pink-100 text-gray-800"
                : "bg-pink-100 text-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <p className="text-sm italic text-gray-400">Typing…</p>}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="mt-4 flex gap-3"
      >
        <input
          type="text"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-base"
          placeholder="Write a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
