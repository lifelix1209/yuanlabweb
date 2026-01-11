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
        // 保存原始请求的路径，登录后可以跳转回来
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
    return null; // 或者返回一个加载中的组件
  }

  return isAuthorized ? children : null;
}

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* 主站路由 */}
          <Route path="/" element={
            <>
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
            </>
          } />

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
