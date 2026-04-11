import { useGame } from "../contexts/GameContext";
import styles from "./GameOverScreen.module.css";

export function GameOverScreen() {
  const { state, goToLobby } = useGame();

  return (
    <div className={styles.container}>
      {state.winner ? (
        <>
          <span className={styles.icon}>🏆</span>
          <h1 className={styles.titleWinner}>¡{state.winner} sobrevivió!</h1>
          <p className={styles.subtitle}>Último en pie.</p>
        </>
      ) : (
        <>
          <span className={styles.icon}>☠️</span>
          <h1 className={styles.title}>Fin de Ronda</h1>
          <p className={styles.subtitle}>Todos fueron eliminados.</p>
        </>
      )}

      <div className={styles.playerList}>
        {state.players.map((p) => (
          <div
            key={p.id}
            className={`${styles.playerRow} ${p.name === state.winner ? styles.winnerRow : ""}`}
          >
            <span
              className={`${styles.playerName} ${p.alive ? styles.playerAlive : ""}`}
            >
              {p.name}
              {p.name === state.winner ? " 👑" : ""}
            </span>
            <span className={styles.playerShots}>
              {p.alive ? "Sobrevivió" : `💀 ${p.shotsFired}/6`}
            </span>
          </div>
        ))}
      </div>

      <button className={styles.backBtn} onClick={goToLobby}>
        Volver al Lobby
      </button>
    </div>
  );
}
