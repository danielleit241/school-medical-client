import React, {useEffect, useRef, useState} from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm.jsx";
import ChatMessage from "./components/ChatMessage";
import QuickMenus from "./components/QuickMenus.jsx";
import {companyInfo} from "./components/companyInfo.js";
import "./index.scss";

const Chatbox = () => {
  const [chatHistory, setChatHistory] = useState([
    {hideInChat: true, role: "model", text: companyInfo},
  ]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    // helper function to update chat history
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        {role: "model", text, isError},
      ]);
    };

    history = history.map(({role, text}) => ({role, parts: [{text}]}));

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({contents: history}),
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error?.message || "Failed to fetch response");

      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  // Xử lý khi người dùng chọn menu nhanh
  const handleQuickMenuSelect = (question) => {
    // Thêm câu hỏi vào chat history
    const newUserMessage = {role: "user", text: question};
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);

    // Thêm tin nhắn "Thinking..." tạm thời
    setChatHistory((prev) => [...prev, {role: "model", text: "Thinking..."}]);

    // Tạo response từ bot
    generateBotResponse(updatedHistory);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className={`containerChatbot ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        id="chatbot-toggler"
        onClick={() => setShowChatbot((prev) => !prev)}
      >
        <span className="material-symbols-outlined">mode_comment</span>
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="chatbot-popup">
        {/* Chatbox header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button
            className="material-symbols-outlined"
            onClick={() => setShowChatbot((prev) => !prev)}
          >
            keyboard_arrow_down
          </button>
        </div>
        {/* Chatbox body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="messages bot-messages">
            <ChatbotIcon />
            <p className="messages-text">
              Hey there! How can I assist you today?
            </p>
          </div>
          {/* Quick Menu */}
          <QuickMenus
            onMenuSelect={handleQuickMenuSelect}
            chatHistory={chatHistory}
          />
          {/* Render chat history */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        {/* Chatbox footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
