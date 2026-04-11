import { useState } from "react";
import { useGame } from "../contexts/GameContext";
import { useSocket } from "../contexts/SocketContext";
import styles from "./LobbyScreen.module.css";

export function LobbyScreen() {
  const { state, spinCylinder, leaveRoom } = useGame();
  const socket = useSocket();
  const [copied, setCopied] = useState(false);
  const isHost = state.hostId === socket.id || state.isHost;

  const handleCopyCode = async () => {
    if (state.roomCode) {
      await navigator.clipboard.writeText(state.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.roomLabel}>Código de sala</p>
          <p className={styles.roomCode} onClick={handleCopyCode}>
            {state.roomCode}
          </p>
          {copied && <p className={styles.copied}>¡Copiado!</p>}
        </div>
        <button className={styles.leaveBtn} onClick={leaveRoom}>
          Salir
        </button>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          Jugadores ({state.players.length})
        </p>
        <div className={styles.playerList}>
          {state.players.map((p) => (
            <div key={p.id} className={styles.playerCard}>
              <span
                className={`${styles.playerDot} ${!p.alive ? styles.playerDotDead : ""}`}
              />
              <span className={styles.playerName}>{p.name}</span>
              {p.id === state.hostId && (
                <span className={styles.hostBadge}>Host</span>
              )}
              {!p.alive && <span className={styles.deadLabel}>Eliminado</span>}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        {isHost ? (
          <button className={styles.spinBtn} onClick={spinCylinder}>
            🔫 Girar Cilindro
          </button>
        ) : (
          <p className={styles.waitMsg}>
            Esperando a que el host gire el cilindro...
          </p>
        )}
      </div>
    </div>
  );
}
