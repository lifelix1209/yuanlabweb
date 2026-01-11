import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider } from './hooks/useLabData';
import { Navbar, Hero, Research, Members, Alumni, Publications, LabRetreatGallery, Contact } from './components/sections';
import { AdminPanel } from './components/admin';
import { Login } from './components/admin/Login';
import { IntroScreen } from './components/sections/IntroScreen';

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

// 首页组件（包含开场动画）
function HomePage() {
  const [showIntro, setShowIntro] = useState(() => {
    // 使用 sessionStorage，每次打开浏览器都会播放
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('introPlayed');
    }
    return true;
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('introPlayed', 'true');
    setShowIntro(false);
  };

  return (
    <>
      {/* 开场动画 */}
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

      {/* 主内容 */}
      <div style={{ opacity: showIntro ? 0 : 1, transition: 'opacity 0.8s ease' }}>
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
