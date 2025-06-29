import React, {useRef} from "react";

const ChatForm = ({chatHistory, setChatHistory, generateBotResponse}) => {
  const inputRef = useRef();

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";
    setChatHistory((history) => [
      ...history,
      {role: "user", text: userMessage},
    ]);

    setTimeout(() => {
      // Simulate a bot response after a delay
      setChatHistory((history) => [
        ...history,
        {role: "model", text: "Thinking..."},
      ]);

      // Call the function to generate bot response
      generateBotResponse([
        ...chatHistory,
        {
          role: "user",
          text: `Using the details provided above, please address this query: ${userMessage}`,
        },
      ]);
    }, 600);
  };

  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
      <input
        type="text"
        placeholder="Messages..."
        className="messages-input"
        required
        ref={inputRef}
      />
      <button className="material-symbols-outlined">arrow_upward</button>
    </form>
  );
};

export default ChatForm;
