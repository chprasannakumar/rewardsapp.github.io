import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

/**
 * LoginBackground renders a full‑screen canvas with a field of tiny particles
 * and a moving radial‑gradient glow that follows the cursor (Antigravity‑style).
 *
 * • Canvas particles provide a 3‑D micro‑/nano‑particle field.
 * • The gradient background moves with the mouse, creating a subtle glowing
 *   aura that adds depth.
 * • Both effects are toggleable via `ENABLE_PARTICLES` and `ENABLE_GLOW`.
 * • All styling stays inside MUI's `sx` prop – no external CSS.
 */
const LoginBackground = () => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Flags – set to false to disable either effect.
  const ENABLE_PARTICLES = true; // particle field
  const ENABLE_GLOW = true; // moving gradient glow

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // ---------------------------------------------------------------
    // Gradient glow – updates CSS custom properties for the background.
    // ---------------------------------------------------------------
    const handleGlowMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--cursor-x', `${x}%`);
      document.documentElement.style.setProperty('--cursor-y', `${y}%`);
    };
    if (ENABLE_GLOW) {
      window.addEventListener('mousemove', handleGlowMove);
    }

    // ---------------------------------------------------------------
    // Particle system – comment out the whole block to disable it.
    // ---------------------------------------------------------------
    if (ENABLE_PARTICLES) {
      const PARTICLE_COUNT = 150; // richer field of particles
      const particles = [];

      // Initialise particles with random positions and velocities
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
        });
      }

      const handleMouseMove = (e) => {
        mousePos.current.x = e.clientX;
        mousePos.current.y = e.clientY;
      };
      window.addEventListener('mousemove', handleMouseMove);

      const render = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => {
          // Attraction to mouse (soft pull)
          const dx = mousePos.current.x - p.x;
          const dy = mousePos.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.min(0.02, 100 / (dist * dist)); // weaker when far
          p.vx += dx * pull;
          p.vy += dy * pull;

          // Damping for smoother motion
          p.vx *= 0.96;
          p.vy *= 0.96;

          // Update position
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around edges for endless flow
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Draw particle – soft glowing circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
          ctx.fill();
        });
        requestAnimationFrame(render);
      };
      render();

      // Clean‑up for particle mouse listener
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (ENABLE_GLOW) {
          window.removeEventListener('mousemove', handleGlowMove);
        }
      };
    }

    // If particles are disabled but glow is enabled, still clean up glow listener.
    if (!ENABLE_PARTICLES && ENABLE_GLOW) {
      return () => {
        window.removeEventListener('mousemove', handleGlowMove);
      };
    }
    // ---------------------------------------------------------------
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        // Gradient uses CSS variables for cursor‑responsive glow
        background: ENABLE_GLOW
          ? 'radial-gradient(circle at var(--cursor-x, 50%) var(--cursor-y, 50%), #4f46e5, #1e293b)'
          : 'radial-gradient(circle at 50% 50%, #4f46e5, #1e293b)',
        // Dark overlay to make particles pop
        '&::after': {
          content: "''",
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.15)',
        },
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default LoginBackground;
