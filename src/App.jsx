import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider } from './hooks/useLabData';
import { LanguageProvider } from './i18n/LanguageContext';
import { SmoothScroll } from './components/motion/SmoothScroll';
import { Splash } from './components/intro/Splash';
import { safeStorage } from './lib/storage';
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

const INTRO_KEY = 'yuanlab.introPlayed';

// 首页：首次访问播放开屏（≤1.3s），内容始终立即渲染在开屏之下
function HomePage() {
  const [showIntro, setShowIntro] = useState(() => safeStorage.get('session', INTRO_KEY) !== 'true');
  const [released, setReleased] = useState(!showIntro);

  const handleRelease = useCallback(() => setReleased(true), []);
  const handleDone = useCallback(() => {
    safeStorage.set('session', INTRO_KEY, 'true');
    setShowIntro(false);
  }, []);

  return (
    <SmoothScroll>
      <Navbar />
      <main>
        <Hero play={released} />
        <Research />
        <Members />
        <Publications />
        <Alumni />
        <LabRetreatGallery />
      </main>
      <Contact />
      {showIntro && <Splash onRelease={handleRelease} onDone={handleDone} />}
    </SmoothScroll>
  );
}

function App() {
  return (
    <DataProvider>
      <LanguageProvider>
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
      </LanguageProvider>
    </DataProvider>
  );
}

export default App;
