import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Thermometer, Palette } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-primary-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-800">
              Garnmönster
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink
              to="/temperatur"
              active={isActive('/temperatur')}
              icon={<Thermometer className="w-4 h-4" />}
            >
              Temperaturmönster
            </NavLink>
            <NavLink
              to="/garnbibliotek"
              active={isActive('/garnbibliotek')}
              icon={<Palette className="w-4 h-4" />}
            >
              Garnbibliotek
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function NavLink({ to, active, children, icon }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
        active
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
