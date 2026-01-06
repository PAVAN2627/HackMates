import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  MessageCircle,
  Megaphone,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Unified navigation items for all users
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Trophy, label: 'Hackathons', path: '/hackathons' },
    { icon: Plus, label: 'Post Hackathon', path: '/create-hackathon' },
    { icon: Users, label: 'Find Members', path: '/profiles' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Megaphone, label: 'Announcements', path: '/announcements' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:block fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <img 
                  src="/assets/roundlogohackmates.png" 
                  alt="HackMates Logo" 
                  className="h-8 w-8 rounded-full"
                />
                <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">HackMates</span>
              </div>
            )}
            {collapsed && (
              <img 
                src="/assets/roundlogohackmates.png" 
                alt="HackMates Logo" 
                className="h-8 w-8 rounded-full mx-auto"
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: routeIsActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      routeIsActive
                        ? 'bg-sidebar-accent text-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-sidebar-border p-2 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Sign Out</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation - Horizontal Bottom Bar with Icons Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-0',
                  isActive
                    ? 'text-primary bg-sidebar-accent'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
              </NavLink>
            );
          })}
          
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={cn(
              'flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-0',
              'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
          </button>
        </div>
      </div>
    </>
  );
}