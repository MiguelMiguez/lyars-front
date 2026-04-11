import { SocketProvider } from "./contexts/SocketContext";
import { GameProvider, useGame } from "./contexts/GameContext";
import { HomeScreen } from "./screens/HomeScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { GunScreen } from "./screens/GunScreen";
import { EliminatedScreen } from "./screens/EliminatedScreen";
import { GameOverScreen } from "./screens/GameOverScreen";

function ScreenRouter() {
  const { state } = useGame();

  switch (state.screen) {
    case "home":
      return <HomeScreen />;
    case "lobby":
      return <LobbyScreen />;
    case "gun":
      return <GunScreen />;
    case "eliminated":
      return <EliminatedScreen />;
    case "game-over":
      return <GameOverScreen />;
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <ScreenRouter />
      </GameProvider>
    </SocketProvider>
  );
}
