import { useRef, useCallback, useEffect } from "react";

type SoundName = "spin" | "click" | "bang";

const SOUND_FILES: Record<SoundName, string> = {
  spin: "/sounds/spin.wav",
  click: "/sounds/click.wav",
  bang: "/sounds/bang.wav",
};

export function useSound() {
  const audioRefs = useRef<Record<SoundName, HTMLAudioElement | null>>({
    spin: null,
    click: null,
    bang: null,
  });

  useEffect(() => {
    for (const [name, path] of Object.entries(SOUND_FILES) as [
      SoundName,
      string,
    ][]) {
      const audio = new Audio(path);
      audio.preload = "auto";
      audioRefs.current[name] = audio;
    }
  }, []);

  const play = useCallback((name: SoundName) => {
    const audio = audioRefs.current[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);

  return { play };
}
