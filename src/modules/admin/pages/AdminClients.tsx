import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { getGlobalRegistry } from '@/store/auth';

export function AdminClients() {
  const { openMenu } = useShell();
  const [search, setSearch] = useState('');
  const [, setTick] = useState(0);
  // Re-read registry on every render tick so new registrations appear live
  const clients = getGlobalRegistry().filter(u => u.role === 'client');
  // Poll for changes every 2s (simple approach for demo without websockets)
  useState(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  });
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q);
  });

  return (
    <>
      {/* Same as candidates: no search prop -> bell + profile sit on the right */}
      <Topbar onMenu={openMenu} />
      <main className="page">
        <PageTransition>
          <div className="mb-5">
            <h1 className="font-display text-2xl font-bold text-secondary">Client management</h1>
            <p className="mt-1 text-sm text-slate-500">{clients.length} registered clients</p>
          </div>

          {/* Search moved into the page body (candidate style) */}
          <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="relative max-w-md">
              <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search clients…" className="field pl-9 pr-8"/>
              {search && <button onClick={()=>setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><FiX size={13}/></button>}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-20 text-center">
              <p className="font-display text-lg font-bold text-secondary">No clients found</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                    {['Client','Email','Company','Designation','Phone'].map(h => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <motion.tr key={c.id} initial={{opacity:0}} animate={{opacity:1}} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-success/10 text-sm font-bold text-success shrink-0">
                            {c.firstName[0]}{c.lastName[0]}
                          </span>
                          <p className="font-medium text-secondary">{c.firstName} {c.lastName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{c.email}</td>
                      <td className="px-5 py-3 text-slate-600">{c.companyName}</td>
                      <td className="px-5 py-3 text-slate-600">{c.designation}</td>
                      <td className="px-5 py-3 text-slate-500">{c.phone}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageTransition>
      </main>
    </>
  );
}