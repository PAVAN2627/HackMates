import { useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/Loading';
import { BarChart2, Trophy, Users, Flag, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminNav = [
  { icon: BarChart2, label: 'Overview', path: '/admin' },
  { icon: Trophy, label: 'Hackathons', path: '/admin/hackathons' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Flag, label: 'Reports', path: '/admin/reports' },
];

export default function AdminLayout() {
  const { profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && profile && !profile.isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, loading]);

  if (loading) return <Loading />;
  if (!profile?.isAdmin) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40">
        <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
          <img
            src="/assets/hackmatesroundlogo.png"
            alt="HackMates"
            className="h-8 w-14 object-contain rounded-lg"
          />
          <div>
            <p className="font-bold text-sm bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">HackMates</p>
            <p className="text-xs text-purple-500 font-medium -mt-0.5">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {adminNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-accent text-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border">
        <div className="flex items-center justify-around px-2 py-3">
          {adminNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center px-3 py-2 rounded-lg transition-all',
                  isActive ? 'text-primary bg-sidebar-accent' : 'text-sidebar-foreground/70'
                )}
              >
                <item.icon className="h-5 w-5" />
              </NavLink>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center px-3 py-2 rounded-lg text-sidebar-foreground/70"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
