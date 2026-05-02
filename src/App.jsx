import { useEffect, useRef } from 'react';
import Vinyl from './Vinyl.jsx';
import track from '../LOSHAD (MINUS).mp3';

export default function App() {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const playAudio = () => {
      audio.play().catch(() => {});
    };

    playAudio();
    window.addEventListener('pointerdown', playAudio, { once: true });
    window.addEventListener('keydown', playAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', playAudio);
      window.removeEventListener('keydown', playAudio);
    };
  }, []);

  return (
    <main className="site" aria-label="Undead Horse">
      <div className="container">
        <Vinyl />
      </div>
      <audio
        ref={audioRef}
        src={track}
        autoPlay
        loop
        playsInline
        preload="auto"
      />
    </main>
  );
}
