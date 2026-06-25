import { useState } from 'react';
import { motion } from 'framer-motion';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { seedUsers } from '@/lib/mockData';

export function AdminClients() {
  const { openMenu } = useShell();
  const [search, setSearch] = useState('');
  const clients = seedUsers.filter(u => u.role === 'client');
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q);
  });

  return (
    <>
      <Topbar onMenu={openMenu} search={search} onSearch={setSearch} searchPlaceholder="Search clients…"/>
      <main className="page">
        <PageTransition>
          <div className="mb-5">
            <h1 className="font-display text-2xl font-bold text-secondary">Client management</h1>
            <p className="mt-1 text-sm text-slate-500">{clients.length} registered clients</p>
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
