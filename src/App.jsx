import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider } from './hooks/useLabData';
import { Navbar, Hero, Research, Members, Alumni, Publications, LabRetreatGallery, Contact } from './components/sections';
import { AdminPanel } from './components/admin';
import { Login } from './components/admin/Login';

// 保护路由组件
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
      if (!isAuthenticated) {
        sessionStorage.setItem('redirectPath', location.pathname);
        navigate('/login', { replace: true });
      } else {
        setIsAuthorized(true);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [navigate, location.pathname]);

  if (isChecking) {
    return null;
  }

  return isAuthorized ? children : null;
}

// 开场动画组件（支持循环播放直到数据加载完成）
function IntroScreen({ onComplete, isDataReady }) {
  const [loopCount, setLoopCount] = useState(0);
  const [stage, setStage] = useState('initial');

  // 当数据准备好时，直接完成动画
  useEffect(() => {
    if (isDataReady && stage !== 'done') {
      // 如果已经在 fadeOut 阶段，等待完成
      if (stage === 'fadeOut') return;

      // 强制进入完成流程
      setStage('fadeOut');
      const t = setTimeout(() => {
        setStage('done');
        onComplete();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isDataReady, stage, onComplete]);

  useEffect(() => {
    if (stage === 'done') return;

    // 定义各阶段的时间
    const timeouts = [
      { fn: () => setStage('bgIn'), delay: 50 },
      { fn: () => setStage('line1'), delay: 600 },
      { fn: () => setStage('line2'), delay: 3000 },
      { fn: () => setStage('fadeOut'), delay: 5200 },
      { fn: () => {
        if (isDataReady) {
          setStage('done');
          onComplete();
        } else {
          setLoopCount(c => c + 1);
          setStage('initial');
        }
      }, delay: 5800 },
    ];

    // 设置所有定时器
    const timerIds = timeouts.map((t) =>
      setTimeout(t.fn, t.delay)
    );

    // 清理函数
    return () => {
      timerIds.forEach(id => clearTimeout(id));
    };
  }, [stage, isDataReady, onComplete]);

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
      {/* 循环次数提示（可选） */}
      {!isDataReady && loopCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '12px',
        }}>
          Loading data...
        </div>
      )}

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

// 首页组件（包含开场动画和数据加载）
function HomePage() {
  const { loading } = useLabData();
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('introPlayed');
    }
    return true;
  });

  // 数据是否就绪（不在加载中）
  const isDataReady = !loading;

  const handleIntroComplete = () => {
    sessionStorage.setItem('introPlayed', 'true');
    setShowIntro(false);
  };

  return (
    <>
      {/* 开场动画 - 数据加载完成后自动结束 */}
      {showIntro && (
        <IntroScreen
          onComplete={handleIntroComplete}
          isDataReady={isDataReady}
        />
      )}

      {/* 主内容 - 使用 CSS transition 实现平滑过渡 */}
      <div
        style={{
          opacity: showIntro ? 0 : 1,
          transition: 'opacity 0.8s ease',
        }}
      >
        <Navbar />
        <main>
          <Hero />
          <Research />
          <Members />
          <Alumni />
          <LabRetreatGallery />
          <Publications />
          <Contact />
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* 主站路由 */}
          <Route path="/" element={<HomePage />} />

          {/* 登录页 */}
          <Route path="/login" element={<Login />} />

          {/* 管理后台（需要登录） */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* 其他未知路径跳转到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
