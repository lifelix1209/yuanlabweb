import { useEffect, useState } from 'react';

export function IntroScreen({ onComplete }) {
  const [stage, setStage] = useState('initial'); // initial, bgIn, line1, line2, done

  useEffect(() => {
    // 动画序列
    const t1 = setTimeout(() => setStage('bgIn'), 50);
    const t2 = setTimeout(() => setStage('line1'), 600);
    const t3 = setTimeout(() => setStage('line2'), 3000);
    const t4 = setTimeout(() => setStage('fadeOut'), 5200);
    const t5 = setTimeout(() => {
      setStage('done');
      onComplete();
    }, 5800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      opacity: stage === 'initial' ? 0 : 1,
      transition: 'opacity 0.5s ease',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* 网格背景 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* 旋转光晕 */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
        animation: 'glowRotate 20s linear infinite',
      }} />

      {/* 粒子 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
            animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* 第一行文字 */}
      <div style={{
        marginBottom: '40px',
        fontSize: 'clamp(2rem, 6vw, 4rem)',
        fontWeight: 900,
        color: '#000000',
        textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
        opacity: stage === 'line1' || stage === 'line2' || stage === 'fadeOut' ? 1 : 0,
        transform: stage === 'line1' || stage === 'line2' || stage === 'fadeOut' ? 'translateY(0) rotateX(0)' : 'translateY(80px) rotateX(-60deg)',
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformStyle: 'preserve-3d',
      }}>
        We are Yuan Lab
      </div>

      {/* 第二行文字 */}
      <div style={{
        position: 'absolute',
        top: '52%',
        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
        fontWeight: 800,
        color: '#ffffff',
        textShadow: '0 2px 10px rgba(0,0,0,0.5), 0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.5)',
        opacity: stage === 'line2' || stage === 'fadeOut' ? 1 : 0,
        transform: stage === 'line2' || stage === 'fadeOut' ? 'translateY(0)' : 'translateY(60px)',
        transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        We focus on CNCC
      </div>

      {/* 底部标签 */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
        fontWeight: 600,
        letterSpacing: '0.3em',
        color: 'rgba(255, 255, 255, 0.7)',
        opacity: stage === 'line2' || stage === 'fadeOut' ? 0.7 : 0,
        transition: 'opacity 0.8s ease',
        textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
      }}>
        YUAN LAB · EST. 2020
      </div>

      <style>{`
        @keyframes glowRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
