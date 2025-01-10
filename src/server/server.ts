import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  Room,
} from "./interface";

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// In-memory store of active rooms
const rooms = new Map<string, Room>();

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("createRoom", (playerId) => {
    // Generate a random room ID
    const roomId = Math.random().toString(36).substring(2, 8);

    // Create new room with initial state
    const room: Room = {
      id: roomId,
      players: [{
        id: playerId,
        name: `Player ${playerId}`,
        foundSets: [],
        score: 0,
        penalties: 0
      }],
      gameState: {
        deck: [],
        board: [],
        players: [],
        selectedIndices: [],
        setPresent: false,
        settings: {
          deckMode: "finiteDeck"
        }
      }
    };

    // Store room in memory
    rooms.set(roomId, room);

    // Join the Socket.IO room
    socket.join(roomId);

    // Emit back to the client that created the room
    io.to(roomId).emit("playerJoined", room.players[0], room);
  socket.on("joinRoom", async (roomId, player) => {
    // Join the Socket.IO room
    await socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        players: [],
        gameState: {
          // Initialize your game state here
        },
      });
    }

    // Get room and update players
    const room = rooms.get(roomId)!;
    room.players.push(player);

    // Emit to everyone in the room (including sender)
    io.to(roomId).emit("playerJoined", player, room);
  });

  socket.on("claimSet", (roomId, playerId, cardIndices) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Validate set logic here
    const isValid = true; // Your validation logic

    // Update room state if valid
    if (isValid) {
      // Update game state
    }

    // Emit to everyone in the room
    io.to(roomId).emit("setAttempted", playerId, cardIndices, isValid, room);
  });

  socket.on("leaveRoom", async (roomId, playerId) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Remove player from room state
    room.players = room.players.filter((p) => p.id !== playerId);

    // Leave the Socket.IO room
    await socket.leave(roomId);

    // Emit to others in the room
    io.to(roomId).emit("playerLeft", playerId, room);

    // Clean up empty rooms
    if (room.players.length === 0) {
      rooms.delete(roomId);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // You might want to handle cleaning up rooms/players here too
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
