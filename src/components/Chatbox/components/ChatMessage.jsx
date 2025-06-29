import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({chat}) => {
  return (
    !chat.hideInChat && (
      <div
        className={`messages ${
          chat.role === "model" ? "bot" : "user"
        }-messages ${chat.isError ? "error" : ""}`}
      >
        {chat.role === "model" && <ChatbotIcon />}
        <p className="messages-text">{chat.text}</p>
      </div>
    )
  );
};

export default ChatMessage;
