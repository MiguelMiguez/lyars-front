import { useEffect, useState } from "react";
import styles from "./CylinderAnimation.module.css";

interface CylinderAnimationProps {
  event: "idle" | "spinning" | "click" | "bang" | "eliminated";
  shotsFired: number;
}

export function CylinderAnimation({
  event,
  shotsFired,
}: CylinderAnimationProps) {
  const [animClass, setAnimClass] = useState("");
  const [showFlash, setShowFlash] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (event === "spinning") {
      setAnimClass(styles.spinning);
      const timer = setTimeout(() => setAnimClass(""), 1300);
      return () => clearTimeout(timer);
    }
    if (event === "click") {
      setAnimClass(styles.clicking);
      const timer = setTimeout(() => setAnimClass(""), 200);
      return () => clearTimeout(timer);
    }
    if (event === "bang") {
      setShowFlash(true);
      setShake(true);
      const t1 = setTimeout(() => setShowFlash(false), 500);
      const t2 = setTimeout(() => setShake(false), 600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [event, shotsFired]);

  const chamberAngles = [0, 60, 120, 180, 240, 300];

  return (
    <div className={`${styles.wrapper} ${shake ? styles.shake : ""}`}>
      <svg
        className={`${styles.cylinder} ${animClass}`}
        viewBox="0 0 200 200"
        width="260"
        height="260"
      >
        {/* Outer ring */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#333"
          strokeWidth="4"
        />
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="#222"
          strokeWidth="1"
        />

        {/* Center hub */}
        <circle
          cx="100"
          cy="100"
          r="20"
          fill="#1a1a1a"
          stroke="#444"
          strokeWidth="2"
        />
        <circle
          cx="100"
          cy="100"
          r="8"
          fill="#333"
          stroke="#555"
          strokeWidth="1"
        />

        {/* Chambers */}
        {chamberAngles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 100 + 55 * Math.cos(rad);
          const cy = 100 + 55 * Math.sin(rad);
          const fired = i < shotsFired;

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="16"
                fill={fired ? "#1a1a1a" : "#111"}
                stroke={fired ? "#555" : "#dc2626"}
                strokeWidth={fired ? "1" : "2"}
              />
              <circle
                cx={cx}
                cy={cy}
                r="8"
                fill={fired ? "#0a0a0a" : "#1a1a1a"}
                stroke={fired ? "#333" : "#444"}
                strokeWidth="1"
              />
              {!fired && (
                <circle cx={cx} cy={cy} r="4" fill="#dc2626" opacity="0.6" />
              )}
            </g>
          );
        })}

        {/* Spokes */}
        {chamberAngles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 22 * Math.cos(rad);
          const y1 = 100 + 22 * Math.sin(rad);
          const x2 = 100 + 38 * Math.cos(rad);
          const y2 = 100 + 38 * Math.sin(rad);
          return (
            <line
              key={`spoke-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#333"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* Muzzle flash overlay */}
      <div
        className={`${styles.flash} ${showFlash ? styles.flashActive : ""}`}
      />
    </div>
  );
}
