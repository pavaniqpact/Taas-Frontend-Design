import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface ShellCtx { openMenu(): void; }

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet context={{ openMenu: () => setMenuOpen(true) } satisfies ShellCtx} />
      </div>
    </div>
  );
}

export function useShell() { return useOutletContext<ShellCtx>(); }
