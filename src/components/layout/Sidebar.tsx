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
  Plus,
  Flag,
  Shield,
  BarChart2,
  Calendar,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const adminNavItems = [
    { icon: BarChart2, label: 'Overview', path: '/admin' },
    { icon: Trophy, label: 'Hackathons', path: '/admin/hackathons' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Flag, label: 'Reports', path: '/admin/reports' },
  ];

  const userNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Trophy, label: 'Hackathons', path: '/hackathons' },
    { icon: Calendar, label: 'Upcoming', path: '/upcoming' },
    { icon: Users, label: 'Teams', path: '/teams' },
    { icon: Plus, label: 'Post Hackathon', path: '/create-hackathon' },
    { icon: Users, label: 'Find Members', path: '/profiles' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Megaphone, label: 'Announcements', path: '/announcements' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Flag, label: 'Report User', path: '/report' },
  ];

  const navItems = profile?.isAdmin ? adminNavItems : userNavItems;

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
                  src="/assets/hackmatesroundlogo.png" 
                  alt="HackMates Logo" 
                  className="h-8 w-14 rounded-lg object-contain"
                />
                <div>
                  <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">HackMates</span>
                  {profile?.isAdmin && <p className="text-xs text-purple-500 font-medium -mt-1">Admin Panel</p>}
                </div>
              </div>
            )}
            {collapsed && (
              <img 
                src="/assets/hackmatesroundlogo.png" 
                alt="HackMates Logo" 
                className="h-8 w-14 rounded-lg object-contain mx-auto"
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
                  className={() =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
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

      {/* Mobile Navigation - Sidebar Drawer */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 text-primary bg-background/80 backdrop-blur-sm border-border shadow-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[75vw] sm:w-[350px] p-0 border-r border-sidebar-border bg-sidebar">
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 items-center px-4 border-b border-sidebar-border mt-8">
                <div className="flex items-center gap-2">
                  <img src="/assets/hackmatesroundlogo.png" alt="HackMates Logo" className="h-8 w-14 rounded-lg object-contain" />
                  <div>
                    <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">HackMates</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={() => cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
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

              <div className="border-t border-sidebar-border p-2 space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground" 
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Sign Out</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
