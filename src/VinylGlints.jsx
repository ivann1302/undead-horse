import { useEffect, useRef } from 'react';

function drawSoftReflection(ctx, cx, cy, size, options) {
  const {
    x,
    y,
    width,
    height,
    rotation,
    strength,
    time,
  } = options;

  ctx.save();
  ctx.translate(cx + x * size, cy + y * size);
  ctx.rotate(rotation);
  ctx.scale(width * size, height * size);

  const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  haze.addColorStop(0, `rgba(255, 255, 230, ${0.16 * strength})`);
  haze.addColorStop(0.16, `rgba(210, 238, 235, ${0.11 * strength})`);
  haze.addColorStop(0.34, `rgba(255, 238, 170, ${0.06 * strength})`);
  haze.addColorStop(0.7, `rgba(190, 222, 220, ${0.025 * strength})`);
  haze.addColorStop(1, 'rgba(255, 220, 150, 0)');

  ctx.fillStyle = haze;
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.save();
  ctx.translate(cx + x * size, cy + y * size);
  ctx.rotate(rotation);
  ctx.globalAlpha = 0.22 * strength;
  ctx.lineCap = 'round';

  for (let i = 0; i < 22; i += 1) {
    const t = i / 21;
    const offset = (t - 0.5) * height * size * 0.62;
    const ripple = Math.sin(time * 0.55 + i * 1.7) * height * size * 0.018;
    const lineLength = width * size * (0.54 + Math.sin(i * 2.1) * 0.08);
    const alpha = (0.035 + (i % 5 === 0 ? 0.055 : 0.018)) * strength;

    ctx.strokeStyle = `rgba(230, 248, 242, ${alpha})`;
    ctx.lineWidth = Math.max(0.7, size * (i % 5 === 0 ? 0.0032 : 0.0018));
    ctx.beginPath();
    ctx.moveTo(-lineLength * 0.52, offset + ripple);
    ctx.quadraticCurveTo(0, offset - ripple * 0.6, lineLength * 0.52, offset + ripple * 0.35);
    ctx.stroke();
  }

  const core = ctx.createLinearGradient(-width * size * 0.42, 0, width * size * 0.42, 0);
  core.addColorStop(0, 'rgba(255, 255, 225, 0)');
  core.addColorStop(0.35, `rgba(255, 255, 230, ${0.08 * strength})`);
  core.addColorStop(0.5, `rgba(255, 248, 205, ${0.14 * strength})`);
  core.addColorStop(0.65, `rgba(210, 238, 235, ${0.07 * strength})`);
  core.addColorStop(1, 'rgba(255, 255, 225, 0)');

  ctx.globalAlpha = 0.72 + Math.sin(time * 1.1) * 0.05;
  ctx.strokeStyle = core;
  ctx.lineWidth = Math.max(1, height * size * 0.16);
  ctx.beginPath();
  ctx.moveTo(-width * size * 0.43, -height * size * 0.02);
  ctx.quadraticCurveTo(0, height * size * 0.03, width * size * 0.43, height * size * 0.01);
  ctx.stroke();
  ctx.restore();
}

export default function VinylGlints() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });

    if (!ctx) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let lastWidth = 0;
    let lastHeight = 0;

    const render = (now = 0) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));

      if (width !== lastWidth || height !== lastHeight) {
        canvas.width = width;
        canvas.height = height;
        lastWidth = width;
        lastHeight = height;
      }

      const size = Math.min(width, height);
      const cx = width * 0.5;
      const cy = height * 0.5;
      const time = reducedMotion.matches ? 0 : now * 0.001;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
      ctx.clip();

      drawSoftReflection(ctx, cx, cy, size, {
        x: -0.24,
        y: -0.2,
        width: 0.36,
        height: 0.24,
        rotation: -0.88,
        strength: 1,
        time,
      });

      drawSoftReflection(ctx, cx, cy, size, {
        x: 0.22,
        y: 0.25,
        width: 0.38,
        height: 0.24,
        rotation: -0.88,
        strength: 0.86,
        time: time + 1.3,
      });

      ctx.restore();

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas className="vinyl-glints" ref={canvasRef} aria-hidden="true" />;
}
