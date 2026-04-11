import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSocket } from "./SocketContext";

export type Screen = "home" | "lobby" | "gun" | "eliminated" | "game-over";

export interface PlayerInfo {
  id: string;
  name: string;
  alive: boolean;
  shotsFired: number;
}

export interface TriggerEvent {
  playerName: string;
  playerId: string;
  shotNumber: number;
  result: "click" | "bang";
}

export interface GameState {
  screen: Screen;
  roomCode: string | null;
  playerName: string | null;
  isHost: boolean;
  hostId: string | null;
  players: PlayerInfo[];
  lastEvent: "idle" | "spinning" | "click" | "bang" | "eliminated";
  winner: string | null;
  lastEliminatedName: string | null;
  lastShooterName: string | null;
  triggerLog: TriggerEvent[];
}

type Action =
  | { type: "SET_SCREEN"; screen: Screen }
  | {
      type: "ROOM_CREATED";
      roomCode: string;
      players: PlayerInfo[];
      hostId: string;
    }
  | {
      type: "ROOM_JOINED";
      roomCode: string;
      players: PlayerInfo[];
      hostId: string;
    }
  | { type: "PLAYERS_UPDATED"; players: PlayerInfo[]; hostId?: string }
  | { type: "CYLINDER_SPUN"; players: PlayerInfo[] }
  | {
      type: "CLICK";
      shotNumber: number;
      playerName: string;
      playerId: string;
      players: PlayerInfo[];
    }
  | { type: "BANG"; shotNumber: number; playerName: string }
  | {
      type: "PLAYER_ELIMINATED";
      playerName: string;
      playerId: string;
      shotNumber: number;
      players: PlayerInfo[];
    }
  | { type: "GUN_RESET"; players: PlayerInfo[] }
  | { type: "GAME_OVER"; players: PlayerInfo[]; winner: string | null }
  | { type: "LOBBY_RESET"; players: PlayerInfo[] }
  | { type: "RESET" };

const initialState: GameState = {
  screen: "home",
  roomCode: null,
  playerName: null,
  isHost: false,
  hostId: null,
  players: [],
  winner: null,
  lastEvent: "idle",
  lastEliminatedName: null,
  lastShooterName: null,
  triggerLog: [],
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "ROOM_CREATED":
      return {
        ...state,
        screen: "lobby",
        roomCode: action.roomCode,
        isHost: true,
        hostId: action.hostId,
        players: action.players,
      };
    case "ROOM_JOINED":
      return {
        ...state,
        screen: "lobby",
        roomCode: action.roomCode,
        hostId: action.hostId,
        players: action.players,
      };
    case "PLAYERS_UPDATED":
      return {
        ...state,
        players: action.players,
        hostId: action.hostId ?? state.hostId,
      };
    case "CYLINDER_SPUN":
      return {
        ...state,
        screen: "gun",
        players: action.players,
        lastEvent: "spinning",
        lastEliminatedName: null,
        lastShooterName: null,
        triggerLog: [],
      };
    case "CLICK":
      return {
        ...state,
        players: action.players,
        lastEvent: "click",
        lastShooterName: action.playerName,
        triggerLog: [
          ...state.triggerLog,
          {
            playerName: action.playerName,
            playerId: action.playerId,
            shotNumber: action.shotNumber,
            result: "click",
          },
        ],
      };
    case "BANG":
      return {
        ...state,
        lastEvent: "bang",
        screen: "eliminated",
        lastEliminatedName: action.playerName,
        triggerLog: [
          ...state.triggerLog,
          {
            playerName: action.playerName,
            playerId: "",
            shotNumber: action.shotNumber,
            result: "bang",
          },
        ],
      };
    case "PLAYER_ELIMINATED":
      return {
        ...state,
        players: action.players,
        lastEvent: "eliminated",
        lastEliminatedName: action.playerName,
        triggerLog: [
          ...state.triggerLog,
          {
            playerName: action.playerName,
            playerId: action.playerId,
            shotNumber: action.shotNumber,
            result: "bang",
          },
        ],
      };
    case "GUN_RESET":
      return {
        ...state,
        screen: "lobby",
        players: action.players,
        winner: null,
        lastEvent: "idle",
        lastEliminatedName: null,
        lastShooterName: null,
        triggerLog: [],
      };
    case "GAME_OVER":
      return {
        ...state,
        screen: "game-over",
        players: action.players,
        winner: action.winner,
        lastEvent: "idle",
      };
    case "LOBBY_RESET":
      return {
        ...state,
        screen: "lobby",
        players: action.players,
        winner: null,
        lastEvent: "idle",
        lastEliminatedName: null,
        lastShooterName: null,
        triggerLog: [],
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  createRoom: (hostName: string) => void;
  joinRoom: (code: string, playerName: string) => void;
  spinCylinder: () => void;
  pullTrigger: () => void;
  resetGun: () => void;
  leaveRoom: () => void;
  goToLobby: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const socket = useSocket();
  const [state, dispatch] = useReducer(reducer, initialState);

  const createRoom = useCallback(
    (hostName: string) => {
      dispatch({ type: "SET_SCREEN", screen: "home" });
      socket.emit(
        "create-room",
        { hostName },
        (res: {
          success: boolean;
          roomCode: string;
          players: PlayerInfo[];
        }) => {
          if (res.success && socket.id) {
            dispatch({
              type: "ROOM_CREATED",
              roomCode: res.roomCode,
              players: res.players,
              hostId: socket.id,
            });
          }
        },
      );
    },
    [socket],
  );

  const joinRoom = useCallback(
    (code: string, playerName: string) => {
      socket.emit(
        "join-room",
        { code, playerName },
        (res: {
          success: boolean;
          roomCode?: string;
          players?: PlayerInfo[];
          hostId?: string;
          error?: string;
        }) => {
          if (res.success && res.roomCode && res.players && res.hostId) {
            dispatch({
              type: "ROOM_JOINED",
              roomCode: res.roomCode,
              players: res.players,
              hostId: res.hostId,
            });
          }
        },
      );
    },
    [socket],
  );

  const spinCylinder = useCallback(() => {
    socket.emit("spin-cylinder", () => {});
  }, [socket]);

  const pullTrigger = useCallback(() => {
    socket.emit("pull-trigger", () => {});
  }, [socket]);

  const resetGun = useCallback(() => {
    socket.emit("reset-gun", () => {});
  }, [socket]);

  const leaveRoom = useCallback(() => {
    socket.emit("leave-room");
    dispatch({ type: "RESET" });
  }, [socket]);

  const goToLobby = useCallback(() => {
    socket.emit("return-to-lobby", () => {});
  }, [socket]);

  useEffect(() => {
    const onPlayerJoined = (data: {
      players: PlayerInfo[];
      hostId: string;
    }) => {
      dispatch({
        type: "PLAYERS_UPDATED",
        players: data.players,
        hostId: data.hostId,
      });
    };

    const onPlayerLeft = (data: {
      players: PlayerInfo[];
      hostId: string;
      hostChanged: boolean;
    }) => {
      dispatch({
        type: "PLAYERS_UPDATED",
        players: data.players,
        hostId: data.hostId,
      });
      if (data.hostChanged && data.hostId === socket.id) {
        // this client became the new host
      }
    };

    const onCylinderSpun = (data: { players: PlayerInfo[] }) => {
      dispatch({ type: "CYLINDER_SPUN", players: data.players });
    };

    const onClick = (data: {
      shotNumber: number;
      playerName: string;
      playerId: string;
      players: PlayerInfo[];
    }) => {
      dispatch({
        type: "CLICK",
        shotNumber: data.shotNumber,
        playerName: data.playerName,
        playerId: data.playerId,
        players: data.players,
      });
    };

    const onBang = (data: { shotNumber: number; playerName: string }) => {
      dispatch({
        type: "BANG",
        shotNumber: data.shotNumber,
        playerName: data.playerName,
      });
    };

    const onPlayerEliminated = (data: {
      playerName: string;
      playerId: string;
      shotNumber: number;
      players: PlayerInfo[];
    }) => {
      dispatch({
        type: "PLAYER_ELIMINATED",
        playerName: data.playerName,
        playerId: data.playerId,
        shotNumber: data.shotNumber,
        players: data.players,
      });
    };

    const onGunReset = (data: { players: PlayerInfo[] }) => {
      dispatch({ type: "GUN_RESET", players: data.players });
    };

    const onGameOver = (data: {
      players: PlayerInfo[];
      winner: string | null;
    }) => {
      dispatch({
        type: "GAME_OVER",
        players: data.players,
        winner: data.winner,
      });
    };

    const onLobbyReset = (data: { players: PlayerInfo[] }) => {
      dispatch({ type: "LOBBY_RESET", players: data.players });
    };

    socket.on("player-joined", onPlayerJoined);
    socket.on("player-left", onPlayerLeft);
    socket.on("cylinder-spun", onCylinderSpun);
    socket.on("click", onClick);
    socket.on("bang", onBang);
    socket.on("player-eliminated", onPlayerEliminated);
    socket.on("gun-reset", onGunReset);
    socket.on("game-over", onGameOver);
    socket.on("lobby-reset", onLobbyReset);

    return () => {
      socket.off("player-joined", onPlayerJoined);
      socket.off("player-left", onPlayerLeft);
      socket.off("cylinder-spun", onCylinderSpun);
      socket.off("click", onClick);
      socket.off("bang", onBang);
      socket.off("player-eliminated", onPlayerEliminated);
      socket.off("gun-reset", onGunReset);
      socket.off("game-over", onGameOver);
      socket.off("lobby-reset", onLobbyReset);
    };
  }, [socket]);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        createRoom,
        joinRoom,
        spinCylinder,
        pullTrigger,
        resetGun,
        leaveRoom,
        goToLobby,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame debe usarse dentro de GameProvider");
  return ctx;
}
