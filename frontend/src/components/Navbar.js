import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase, FileText, Wallet as WalletIcon, Users, Shield, LogOut, Moon, Sun } from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Sparkles className="w-4 h-4" /> },
    { path: '/opportunities', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
    { path: '/applications', label: 'Applications', icon: <FileText className="w-4 h-4" /> },
    { path: '/wallet', label: 'Wallet', icon: <WalletIcon className="w-4 h-4" /> },
    { path: '/referrals', label: 'Referrals', icon: <Users className="w-4 h-4" /> }
  ];

  if (user.is_admin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> });
  }

  return (
    <nav className="border-b bg-card sticky top-0 z-50" data-testid="navbar">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">AI Money Agent</span>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2"
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              data-testid="theme-toggle-btn"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
