import React, { useRef, useState, createContext } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { translationService } from "services/translation.service";

export const ChatDataContext = createContext();

export const ChatDataContextProvider = (props) => {
  const user = useSelector((state) => state.auth.user);
  const authToken = JSON.parse(localStorage.getItem("user"))?.token;
  const socket = useRef(null);
  const [status, setStatus] = useState("waiting"); // waiting -> enqueued -> connected
  const partnerRef = useRef();
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("en");

  const translateMessage = async (message) => {
    try {
      let translatedMessage = message;
      if (language !== partnerRef.current.language) {
        const result = await translationService.translateMessage({
          to: language,
          from: partnerRef.current.language,
          message: message,
        });
        translatedMessage = result.data.text;
      }
      setMessages((prev) => [
        ...prev,
        {
          author: "partner",
          content: translatedMessage,
          original: message,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          author: "partner",
          content: message,
          original: message,
        },
      ]);
      console.warn("Failed to translate incoming message", e);
    }
  };

  const initiateConnection = (language) => {
    const websocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    websocket.onopen = () => {
      websocket.send(
        JSON.stringify({
          action: "connect",
          token: authToken,
          id: user.userId,
          firstName: user.firstName,
          language: language,
        })
      );
      socket.current = websocket;
    };

    websocket.onmessage = (e) => {
      const event = JSON.parse(e.data);
      const { action } = event;

      if (action === "initiate") {
        partnerRef.current = {
          name: event.user.name,
          id: event.user.id,
          language: event.user.language,
        };
        setStatus("connected");
      } else if (action === "message") {
        translateMessage(event.message);
      } else if (action === "enqueue") {
        setStatus("enqueued");
      }
    };

    websocket.onclose = (e) => {
      if (e.reason === "partner_left") {
        toast.error("The other person disconnected from the chat.");
      } else if (e.reason !== "close_chat" && e.reason !== "dequeue") {
        toast.error("Lost connection to server");
      }
      setStatus("waiting");
      socket.current = null;
      setMessages([]);
      partnerRef.current = null;
    };
  };

  const sendMessage = (message) => {
    setMessages((prev) => [...prev, { author: "self", content: message }]);
    socket.current.send(
      JSON.stringify({
        action: "message",
        message: message,
        partnerId: partnerRef.current.id,
        token: authToken,
      })
    );
  };

  const leaveChat = () => {
    setStatus("waiting");
    if (status === "connected") {
      socket.current.send(
        JSON.stringify({
          action: "close_chat",
          partnerId: partnerRef.current.id,
          id: user.userId,
          token: authToken,
        })
      );
    } else {
      socket.current.send(
        JSON.stringify({
          action: "dequeue",
          id: user.userId,
          token: authToken,
        })
      );
    }
  };

  return (
    <ChatDataContext.Provider
      value={{
        initiateConnection: initiateConnection,
        sendMessage: sendMessage,
        leaveChat: leaveChat,
        status: status,
        partnerRef: partnerRef,
        messages: messages,
        language: language,
        setLanguage: setLanguage,
      }}
    >
      {props.children}
    </ChatDataContext.Provider>
  );
};
