
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, Folder, FolderPlus, MessageCircle, LogOut,
  User, Menu, X, ChevronRight, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DarkModeToggle from './DarkModeToggle';

const NavItem = ({ 
  icon: Icon, 
  label, 
  to, 
  active, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  to: string; 
  active: boolean; 
  onClick?: () => void; 
}) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
      active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
    )}
    onClick={onClick}
  >
    <Icon size={18} />
    <span>{label}</span>
    {active && <ChevronRight className="h-4 w-4 ml-auto" />}
  </Link>
);

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Folder, label: 'My Folders', path: '/my-folders' },
    { icon: FolderPlus, label: 'Create Folder', path: '/create-folder' },
    { icon: Lock, label: 'Access Folder', path: '/access-folder' },
    { icon: MessageCircle, label: 'Global Chat', path: '/chat' },
  ];

  // Extract display name logic - prioritize username if available
  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed z-50 top-4 left-4 p-2 rounded-md bg-background shadow-md border border-border"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - Desktop always visible, mobile conditionally */}
      <aside 
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center">
                  <Lock className="text-primary-foreground h-4 w-4" />
                </div>
                <span className="font-bold text-xl">LockBox</span>
              </Link>
              <DarkModeToggle />
            </div>
          </div>
          
          {/* User Profile */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="bg-secondary w-10 h-10 rounded-full flex items-center justify-center">
                <User className="text-secondary-foreground h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem 
                key={item.path}
                icon={item.icon}
                label={item.label}
                to={item.path}
                active={location.pathname === item.path}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center" 
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
