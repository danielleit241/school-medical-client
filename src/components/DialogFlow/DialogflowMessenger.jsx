import React, {useEffect} from "react";

const DialogflowMessenger = ({
  botId = "6cf70102-1eac-4758-8f82-1ffdd6e78b0f",
  title = "Medical Assistant",
}) => {
  useEffect(() => {
    // Tạo script element
    const script = document.createElement("script");
    script.src =
      "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup khi component unmount
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }

      // Remove df-messenger element if it exists
      const dfMessenger = document.querySelector("df-messenger");
      if (dfMessenger) {
        dfMessenger.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Chờ script load xong và tạo df-messenger element
    const onScriptLoad = () => {
      // Kiểm tra xem df-messenger đã tồn tại chưa
      if (!customElements.get("df-messenger")) {
        return;
      }

      // Kiểm tra và xóa df-messenger cũ nếu có
      const existingMessenger = document.querySelector("df-messenger");
      if (existingMessenger) {
        existingMessenger.remove();
      }

      // Tạo df-messenger element mới
      const dfMessenger = document.createElement("df-messenger");
      dfMessenger.setAttribute("intent", "WELCOME");
      dfMessenger.setAttribute("chat-title", title);
      dfMessenger.setAttribute("agent-id", botId);
      dfMessenger.setAttribute("language-code", "en");

      // Tùy chỉnh styles
      const style = document.createElement("style");
      style.textContent = `
        df-messenger {
          z-index: 999;
          position: fixed;
          bottom: 16px;
          right: 16px;
        }
        df-messenger-chat {
          width: 350px;
          height: 450px;
        }
        .chat-wrapper {
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(dfMessenger);
    };

    // Kiểm tra xem script đã load chưa
    if (window.dfMessengerLoaded) {
      onScriptLoad();
    } else {
      // Không thì đợi script load xong
      const interval = setInterval(() => {
        if (customElements.get("df-messenger")) {
          clearInterval(interval);
          window.dfMessengerLoaded = true;
          onScriptLoad();
        }
      }, 300);

      // Timeout sau 10 giây nếu không load được
      setTimeout(() => {
        clearInterval(interval);
      }, 10000);
    }
  }, [botId, title]);

  // Component này không render gì cả, chỉ xử lý side effects
  return null;
};

export default DialogflowMessenger;
