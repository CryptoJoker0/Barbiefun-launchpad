// Video Template - Orchestrates the full video sequence

import { useEffect, useRef } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { AnimatePresence, motion } from 'framer-motion';

import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS = {
  scene1: 4500,
  scene2: 5000,
  scene3: 4500,
  scene4: 5000,
  scene5: 5000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  scene1: Scene1,
  scene2: Scene2,
  scene3: Scene3,
  scene4: Scene4,
  scene5: Scene5,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({
    durations,
    loop,
  });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <div
      className="w-full h-screen overflow-hidden relative bg-[#FDF2F8]" // var(--color-barbie-bg)
    >
      {/* Persistent Background Elements (Cross-Scene Continuity) */}
      <div className="absolute inset-0 bg-dots-pattern opacity-20 pointer-events-none z-0" />

      {/* Drifting gradient blobs */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#FBCFE8] blur-[100px] opacity-60 z-0 pointer-events-none"
        animate={{
          x: sceneIndex === 1 ? '30vw' : sceneIndex === 3 ? '-20vw' : '0vw',
          y: sceneIndex === 2 ? '20vh' : sceneIndex === 4 ? '40vh' : '0vh',
          scale: sceneIndex === 4 ? 1.5 : 1,
          backgroundColor: sceneIndex === 4 ? '#FF1493' : '#FBCFE8',
        }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#FF69B4] blur-[120px] opacity-30 z-0 pointer-events-none"
        animate={{
          x: sceneIndex === 1 ? '-40vw' : sceneIndex === 2 ? '-10vw' : '0vw',
          y: sceneIndex === 3 ? '-40vh' : sceneIndex === 4 ? '10vh' : '0vh',
          scale: sceneIndex === 0 ? 1.2 : 1,
        }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      />

      {/* mode="popLayout" = new snaps in while old animates out, creating overlap */}
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
