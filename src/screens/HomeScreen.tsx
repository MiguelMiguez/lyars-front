import { useState } from "react";
import { useGame } from "../contexts/GameContext";
import styles from "./HomeScreen.module.css";

export function HomeScreen() {
  const { createRoom, joinRoom } = useGame();
  const [mode, setMode] = useState<"menu" | "join">("menu");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Ingresá tu nombre.");
      return;
    }
    setError("");
    createRoom(trimmed);
  };

  const handleJoin = () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) {
      setError("Ingresá tu nombre y el código de la sala.");
      return;
    }
    setError("");
    joinRoom(trimmedCode, trimmedName);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lyars</h1>
      <p className={styles.subtitle}>El arma digital para cartas físicas</p>

      {mode === "menu" ? (
        <div className={styles.actions}>
          <input
            className={styles.input}
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoComplete="off"
          />
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleCreate}
          >
            Crear Sala
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setMode("join")}
          >
            Unirse a Sala
          </button>
        </div>
      ) : (
        <div className={styles.joinForm}>
          <input
            className={styles.input}
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoComplete="off"
          />
          <input
            className={`${styles.input} ${styles.inputCode}`}
            placeholder="CÓDIGO"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            autoComplete="off"
          />
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleJoin}
          >
            Unirse
          </button>
          <button className={styles.backBtn} onClick={() => setMode("menu")}>
            ← Volver
          </button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
