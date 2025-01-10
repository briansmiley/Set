import type { Player, SetGameState } from "@/lib/types";
import type { DisconnectDescription } from "node_modules/socket.io-client/build/esm/socket";
import type { Socket } from "socket.io-client";

export interface DefaultServerToClientEvents {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (
    reason: Socket.DisconnectReason,
    description?: DisconnectDescription,
  ) => void;
}

interface Room {
  id: string;
  players: Player[];
  gameState: SetGameState;
}

interface ServerToClientEvents extends DefaultServerToClientEvents {
  // Game events - each includes the new room state
  playerJoined: (player: Player, room: Room) => void;
  playerLeft: (playerId: Player["id"], room: Room) => void;
  setAttempted: (
    playerId: Player["id"],
    cardIndices: number[],
    valid: boolean,
    room: Room,
  ) => void;
  gameStarted: (room: Room) => void;
  gameOver: (winningPlayer: Player, room: Room) => void;

  // Error handling
  error: (message: string) => void;
}

interface ClientToServerEvents {
  joinRoom: (roomId: string, player: Player) => void;
  createRoom: (playerId: Player["id"]) => void;
  leaveRoom: (roomId: string, playerId: Player["id"]) => void;
  claimSet: (
    roomId: string,
    playerId: Player["id"],
    cardIndices: number[],
  ) => void;
  startGame: (roomId: string) => void;
}

export type { ServerToClientEvents, ClientToServerEvents, Room };
