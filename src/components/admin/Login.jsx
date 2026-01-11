import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'Yuanlab@zje3';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      localStorage.setItem('adminAuth', 'true');
      // 跳转到之前访问的路径，或默认跳转到 /admin
      const redirectPath = sessionStorage.getItem('redirectPath') || '/admin';
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath, { replace: true });
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-sci-dark flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="bg-sci-card rounded-2xl border border-sci-border shadow-sci p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sci-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sci">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">管理后台</h1>
            <p className="text-slate-500 mt-2">请登录以管理实验室数据</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">用户名</label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-sci-border bg-sci-dark text-slate-200 outline-none transition focus:border-sci-primary focus:ring-2 focus:ring-sci-primary/20 placeholder:text-slate-600"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">密码</label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-sci-border bg-sci-dark text-slate-200 outline-none transition focus:border-sci-primary focus:ring-2 focus:ring-sci-primary/20 placeholder:text-slate-600"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sci-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sci-gradient text-white rounded-xl font-semibold hover:shadow-sci transition-all duration-300 hover:-translate-y-0.5"
            >
              登录
            </button>
          </form>

          {/* 返回首页 */}
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-500 hover:text-sci-primary transition-colors">
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
