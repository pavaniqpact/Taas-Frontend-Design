import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiSearch, FiBell, FiShoppingCart, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Button } from '@/shared/components/ui/Button';
import { initials } from '@/lib/utils';

const NOTIFS = [
  { title:'New evaluation cleared', body:'A Python developer passed assessment.', t:'2m' },
  { title:'Profile viewed',          body:'Acme Corp viewed 3 of your resources.', t:'1h' },
  { title:'Background check done',   body:'BG verification completed.',            t:'Yesterday' },
];

interface Props {
  onMenu(): void;
  search?: string; onSearch?(v: string): void;
  searchPlaceholder?: string;
  actions?: ReactNode;
}

export function Topbar({ onMenu, search, onSearch, searchPlaceholder = 'Search…', actions }: Props) {
  const { user, logout } = useAuth();
  const { count }        = useCart();
  const { push }         = useToast();
  const navigate         = useNavigate();
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  function doLogout() {
    logout();
    setConfirmLogout(false);
    setProfileOpen(false);
    push({ type: 'info', title: 'Signed out', description: 'You have been logged out of Qpact.' });
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-100 bg-white/80 px-4 backdrop-blur-sm lg:px-6">
      <button onClick={onMenu} className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Menu">
        <FiMenu size={20} />
      </button>

      {onSearch
        ? <div className="relative max-w-md flex-1">
            <FiSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:shadow-glow" />
          </div>
        : <div className="flex-1" />
      }

      <div className="flex items-center gap-1">
        {actions}

        {/* Cart icon for clients */}
        {user?.role === 'client' && (
          <button onClick={() => navigate('/client/cart')}
            className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Shortlist">
            <FiShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setNotifOpen(v=>!v); setProfileOpen(false); }}
            className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 transition">
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-white" />
          </button>
          <AnimatePresence>
            {notifOpen && <Dropdown w="w-72" onClose={() => setNotifOpen(false)}>
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-secondary">Notifications</p>
              </div>
              <ul className="max-h-64 overflow-auto">
                {NOTIFS.map((n, i) => (
                  <li key={i} className="flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-default">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium text-secondary">{n.title}</p>
                      <p className="text-xs text-slate-500">{n.body}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{n.t}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Dropdown>}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setProfileOpen(v=>!v); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 hover:bg-slate-100 transition">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
              {user ? initials(`${user.firstName} ${user.lastName}`) : '?'}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold leading-tight text-secondary">{user?.firstName} {user?.lastName}</span>
              <span className="block text-[10px] capitalize leading-tight text-slate-400">{user?.role}</span>
            </span>
            <FiChevronDown size={14} className="text-slate-400" />
          </button>
          <AnimatePresence>
            {profileOpen && <Dropdown onClose={() => setProfileOpen(false)}>
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-secondary">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <p className="mt-0.5 text-xs text-slate-400">{user?.companyName} · {user?.designation}</p>
              </div>
              <div className="p-1.5">
                <button onClick={() => { setProfileOpen(false); setConfirmLogout(true); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5">
                  <FiLogOut size={15} /> Sign out
                </button>
              </div>
            </Dropdown>}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog open={confirmLogout} title="Sign out?" message="You'll need to log in again."
        confirmLabel="Sign out" onConfirm={doLogout} onCancel={() => setConfirmLogout(false)} />
    </header>
  );
}

function Dropdown({ children, onClose, w = 'w-64' }: { children: ReactNode; onClose(): void; w?: string }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <motion.div initial={{ opacity:0, y:6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0 }} transition={{ duration:0.14 }}
        className={`absolute right-0 z-20 mt-2 ${w} overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card-hover`}>
        {children}
      </motion.div>
    </>
  );
}

export { Button };
