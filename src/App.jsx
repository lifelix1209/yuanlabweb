import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider, useLabData } from './hooks/useLabData';
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

// 开场动画组件
function IntroScreen({ onComplete, isDataReady }) {
  const [stage, setStage] = useState('bgIn');

  // 当数据准备好时，直接完成动画
  useEffect(() => {
    if (isDataReady && stage !== 'done') {
      console.log('✅ 数据加载完成，准备结束动画'); // 调试日志
      
      if (stage !== 'fadeOut') {
        setStage('fadeOut');
      }
      
      const t = setTimeout(() => {
        console.log('✅ 动画完成，调用 onComplete'); // 调试日志
        setStage('done');
        onComplete();
      }, 600);
      
      return () => clearTimeout(t);
    }
  }, [isDataReady, stage, onComplete]);

  // 动画时间线控制
  useEffect(() => {
    if (stage === 'done') return;

    let timeoutId;

    switch (stage) {
      case 'bgIn':
        timeoutId = setTimeout(() => setStage('line1'), 500);
        break;
      case 'line1':
        timeoutId = setTimeout(() => setStage('line2'), 2400);
        break;
      case 'line2':
        timeoutId = setTimeout(() => setStage('fadeOut'), 2200);
        break;
      case 'fadeOut':
        timeoutId = setTimeout(() => {
          if (isDataReady) {
            console.log('✅ fadeOut 完成，数据已就绪'); // 调试日志
            setStage('done');
            onComplete();
          } else {
            console.log('⏳ 数据未就绪，重新播放动画'); // 调试日志
            setStage('bgIn');
          }
        }, 600);
        break;
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
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
      opacity: stage === 'fadeOut' ? 0 : 1,
      transition: 'opacity 0.5s ease',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* 数据加载提示 */}
      {!isDataReady && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          Loading...
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
        transform: stage === 'line1' || stage === 'line2' || stage === 'fadeOut' 
          ? 'translateY(0) rotateX(0)' 
          : 'translateY(80px) rotateX(-60deg)',
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

// 首页组件 - 延迟渲染版本
function HomePage() {
  const { loading } = useLabData();
  const [showIntro, setShowIntro] = useState(() => {
    // 每次都显示开屏动画（用于开发测试）
    // 生产环境可改为: return !sessionStorage.getItem('introPlayed');
    return !sessionStorage.getItem('introPlayed');
  });
  const [contentReady, setContentReady] = useState(false);

  const isDataReady = !loading;

  const handleIntroComplete = () => {
    console.log('🎬 handleIntroComplete 被调用');
    sessionStorage.setItem('introPlayed', 'true');
    setShowIntro(false);
  };

  // 动画开始后立即准备好主内容
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showIntro && (
        <IntroScreen
          onComplete={handleIntroComplete}
          isDataReady={isDataReady}
        />
      )}

      {/* 等待 contentReady 后再渲染，确保 Hook 顺序稳定 */}
      {contentReady && (
        <div
          style={{
            opacity: showIntro ? 0 : 1,
            transition: 'opacity 0.8s ease',
            minHeight: '100vh',
            pointerEvents: showIntro ? 'none' : 'auto',
            position: 'relative',
            zIndex: 1,
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
      )}
    </>
  );
}

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
