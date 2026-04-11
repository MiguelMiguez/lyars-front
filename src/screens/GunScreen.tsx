import { useGame } from "../contexts/GameContext";
import { useSocket } from "../contexts/SocketContext";
import { useSound } from "../hooks/useSound";
import { CylinderAnimation } from "../components/CylinderAnimation";
import { useEffect, useRef, useState } from "react";
import styles from "./GunScreen.module.css";

export function GunScreen() {
  const { state, pullTrigger, goToLobby } = useGame();
  const socket = useSocket();
  const { play } = useSound();
  const [isSpinning, setIsSpinning] = useState(false);

  const myPlayer = state.players.find((p) => p.id === socket.id);
  const myShotsFired = myPlayer?.shotsFired ?? 0;
  const myAlive = myPlayer?.alive ?? true;

  useEffect(() => {
    if (state.lastEvent === "spinning") {
      setIsSpinning(true);
      const timer = setTimeout(() => setIsSpinning(false), 1300);
      return () => clearTimeout(timer);
    }
  }, [state.lastEvent]);

  const prevShotsFired = useRef(myShotsFired);
  const prevLogLength = useRef(state.triggerLog.length);

  useEffect(() => {
    if (state.lastEvent === "spinning") {
      play("spin");
    } else if (state.triggerLog.length !== prevLogLength.current) {
      const lastEntry = state.triggerLog[state.triggerLog.length - 1];
      if (lastEntry) {
        if (lastEntry.result === "click") play("click");
        if (lastEntry.result === "bang") play("bang");
      }
    }
    prevShotsFired.current = myShotsFired;
    prevLogLength.current = state.triggerLog.length;
  }, [state.lastEvent, state.triggerLog.length, myShotsFired, play]);

  const getEventMessage = () => {
    if (state.lastEvent === "spinning") return "Los cilindros están girando...";
    if (state.lastEvent === "click")
      return `Click — ${state.lastShooterName} sobrevive`;
    if (state.lastEvent === "eliminated" && state.lastEliminatedName) {
      return `💀 ${state.lastEliminatedName} fue eliminado`;
    }
    if (!myAlive) return "Fuiste eliminado.";
    return "Apretá el gatillo...";
  };

  const messageClass =
    state.lastEvent === "click"
      ? styles.clickMsg
      : state.lastEvent === "eliminated"
        ? styles.eliminatedMsg
        : "";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.shotCounter}>Tu arma: {myShotsFired} / 6</span>
        <button className={styles.backBtn} onClick={goToLobby}>
          ← Lobby
        </button>
      </div>

      <div className={styles.cylinderArea}>
        <CylinderAnimation event={state.lastEvent} shotsFired={myShotsFired} />
      </div>

      <p className={`${styles.eventMessage} ${messageClass}`}>
        {getEventMessage()}
      </p>

      <button
        className={styles.triggerBtn}
        onClick={pullTrigger}
        disabled={myShotsFired >= 6 || isSpinning || !myAlive}
      >
        {!myAlive ? "Eliminado" : "Disparar"}
      </button>

      <div className={styles.playersPanel}>
        <p className={styles.panelTitle}>Jugadores</p>
        {state.players.map((p) => {
          const isMe = p.id === socket.id;
          const isLastShooter = state.lastShooterName === p.name;
          return (
            <div
              key={p.id}
              className={`${styles.playerRow} ${!p.alive ? styles.playerDead : ""} ${isLastShooter && p.alive ? styles.playerHighlight : ""} ${isMe ? styles.playerMe : ""}`}
            >
              <span
                className={`${styles.playerName} ${!p.alive ? styles.playerNameDead : ""}`}
              >
                {p.name}
                {isMe ? " (vos)" : ""}
              </span>
              <span className={styles.playerShots}>
                {!p.alive ? "💀" : `${p.shotsFired}/6`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
