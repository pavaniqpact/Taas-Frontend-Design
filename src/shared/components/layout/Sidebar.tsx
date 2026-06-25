import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiGrid, FiShoppingCart, FiUsers, FiPlusCircle, FiX, FiLogOut,
  FiUserPlus, FiList,
} from 'react-icons/fi';
import { Logo } from '@/shared/components/ui/Logo';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { cn, initials } from '@/lib/utils';

interface NavItem { to: string; label: string; icon: JSX.Element; badge?: number; end?: boolean; }

export function Sidebar({ open, onClose }: { open: boolean; onClose(): void }) {
  const { user, logout } = useAuth();
  const { count }        = useCart();
  const location         = useLocation();
  const navigate         = useNavigate();

  const clientItems: NavItem[] = [
    { to: '/client',      label: 'Talent Pool',  icon: <FiGrid />,         end: true },
    { to: '/client/cart', label: 'Shortlist',    icon: <FiShoppingCart />, badge: count, end: true },
  ];
  const recruiterItems: NavItem[] = [
    { to: '/recruiter',     label: 'My Resources', icon: <FiUsers />,       end: true },
    { to: '/recruiter/add', label: 'Add Resource', icon: <FiPlusCircle />, end: true },
  ];
  const adminItems: NavItem[] = [
    { to: '/admin/recruiters', label: 'Recruiters', icon: <FiUsers />    },
    { to: '/admin/candidates', label: 'Candidates', icon: <FiList />     },
    { to: '/admin/clients',    label: 'Clients',    icon: <FiUserPlus /> },
  ];

  const items = user?.role === 'client' ? clientItems : user?.role === 'recruiter' ? recruiterItems : adminItems;
  const sectionLabel = user?.role === 'client' ? 'Hiring' : user?.role === 'recruiter' ? 'Recruiting' : 'Administration';

  function doLogout() {
    logout();
    navigate('/login', { replace: true });
    onClose();
  }

  const content = (
    <div className="flex h-full flex-col bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        <Logo />
        <button className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={onClose}>
          <FiX size={20} />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{sectionLabel}</p>
        <nav className="space-y-0.5">
          {items.map(item => {
            const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  active ? 'text-primary' : 'text-secondary-700 hover:bg-slate-50',
                )}>
                {active && (
                  <motion.span layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-primary-50"
                    transition={{ type:'spring', stiffness:380, damping:30 }} />
                )}
                <span className="relative text-lg">{item.icon}</span>
                <span className="relative flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="relative grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Profile block */}
      {user && (
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
              {initials(`${user.firstName} ${user.lastName}`)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-secondary">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-slate-400 capitalize">{user.role} · {user.companyName}</p>
            </div>
            <button onClick={doLogout}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-danger/10 hover:text-danger transition"
              title="Sign out" aria-label="Sign out">
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col">{content}</aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.aside className="absolute left-0 top-0 h-full w-72"
              initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ type:'spring', stiffness:320, damping:32 }}>
              {content}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
