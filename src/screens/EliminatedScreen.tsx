import { useGame } from "../contexts/GameContext";
import styles from "./EliminatedScreen.module.css";

export function EliminatedScreen() {
  const { goToLobby } = useGame();

  return (
    <div className={styles.container}>
      <span className={styles.skull}>💀</span>
      <h1 className={styles.title}>Eliminado</h1>
      <p className={styles.subtitle}>La bala tenía tu nombre.</p>
      <button className={styles.backBtn} onClick={goToLobby}>
        Volver al Lobby
      </button>
    </div>
  );
}
