import { useCallback, useEffect, useRef, useState } from 'react';
import Vinyl from './Vinyl.jsx';
import track from '../LOSHAD (MINUS).mp3';

export default function App() {
  const audioRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    audio.play().then(() => {
      setHasStarted(true);
    }).catch(() => {});

    return undefined;
  }, []);

  const startExperience = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.play().then(() => {
      setHasStarted(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (hasStarted) {
      return undefined;
    }

    window.addEventListener('keydown', startExperience);
    window.addEventListener('pointerdown', startExperience);

    return () => {
      window.removeEventListener('keydown', startExperience);
      window.removeEventListener('pointerdown', startExperience);
    };
  }, [hasStarted, startExperience]);

  return (
    <main className="site" aria-label="Undead Horse">
      <div className="container">
        <Vinyl />
      </div>
      {!hasStarted && (
        <div
          className="start-screen"
          role="button"
          tabIndex={0}
          onClick={startExperience}
          onKeyDown={startExperience}
        >
          <p className="start-text">Нажми любую клавишу</p>
        </div>
      )}
      <audio
        ref={audioRef}
        src={track}
        loop
        playsInline
        preload="auto"
      />
      <a href="http://project42-studio.ru/" target="_blank" rel="noopener noreferrer"></a>
    </main>
  );
}
