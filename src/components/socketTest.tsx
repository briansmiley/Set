import { useState, useEffect } from "react";
import { socket } from "../client";

console.log("Socket instance created:", socket);

export default function SocketTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPong, setLastPong] = useState("");

  useEffect(() => {
    const onConnect = () => {
      console.log("Socket connected event fired");
      setIsConnected(true);
    };
    const onDisconnect = () => {
      console.log("Socket disconnected event fired");
      setIsConnected(false);
    };
    const onPong = () => {
      console.log("Pong received from server");
      setLastPong(new Date().toISOString());
    };
    const onTestMessageResponse = (message: string) => {
      console.log("Test message response received:", message);
    };
    socket.on("connect", onConnect);

    socket.on("disconnect", onDisconnect);
    socket.on("pong", onPong);
    socket.on("test-message-response", onTestMessageResponse);

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("pong", onPong);
      socket.off("test-message-response", onTestMessageResponse);
    };
  }, []);

  const sendPing = () => {
    console.log("Socket state before ping:", {
      id: socket.id,
      connected: socket.connected,
      disconnected: socket.disconnected,
    });
    socket.emit("ping");
  };

  const sendTestMessage = () => {
    console.log("Sending test message");
    socket.emit("test-message", { text: "Hello from client!" });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl">Socket.IO Test</h2>
      <div className="space-y-4">
        <p>
          Connection status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </p>

        <div className="space-x-4">
          <div className="flex flex-col">
            <button
              onClick={sendPing}
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Send Ping
            </button>
            <p>Last Pong: {lastPong}</p>
          </div>

          <button
            onClick={sendTestMessage}
            className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
          >
            Send Test Message
          </button>
        </div>
      </div>
    </div>
  );
}
