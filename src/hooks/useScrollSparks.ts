import { useEffect } from 'react';

export function useScrollSparks() {
  useEffect(() => {
    let lastScroll = 0;
    let sparkTimeout: ReturnType<typeof setTimeout> | null = null;

    const createSpark = (scrollbarX: number, y: number) => {
      const spark = document.createElement('div');
      spark.className = 'scroll-spark';
      const randX = (Math.random() - 0.5) * 30;
      const randY = (Math.random() - 0.5) * 20;
      spark.style.setProperty('--spark-x', `${randX}px`);
      spark.style.setProperty('--spark-y', `${randY}px`);
      spark.style.left = `${scrollbarX + Math.random() * 6 - 3}px`;
      spark.style.top = `${y + Math.random() * 10 - 5}px`;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 600);
    };

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScroll < 25) return;
      lastScroll = now;

      const scrollbarX = document.documentElement.clientWidth - 4;
      const scrollFraction = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
      const thumbY = scrollFraction * window.innerHeight;

      for (let i = 0; i < 8; i++) {
        setTimeout(() => createSpark(scrollbarX, thumbY), i * 15);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}
