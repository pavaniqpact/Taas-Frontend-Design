import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { useResources } from '@/store/resources';
import { seedUsers } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { FiUsers, FiUser, FiShield, FiTrendingUp } from 'react-icons/fi';

export function AdminOverview() {
  const { openMenu } = useShell();
  const { candidates } = useResources();
  const recruiters = seedUsers.filter(u => u.role === 'recruiter');
  const clients    = seedUsers.filter(u => u.role === 'client');

  const stats = [
    { label:'Total candidates', value:candidates.length, icon:<FiUsers/>, color:'text-primary bg-primary-50' },
    { label:'Active candidates',value:candidates.filter(c=>c.status==='Active').length, icon:<FiTrendingUp/>, color:'text-success bg-success/10' },
    { label:'Recruiters',        value:recruiters.length,  icon:<FiUser/>,   color:'text-accent bg-accent/10' },
    { label:'Clients',           value:clients.length,     icon:<FiShield/>, color:'text-secondary bg-secondary/10' },
  ];

  return (
    <>
      <Topbar onMenu={openMenu} />
      <main className="page">
        <PageTransition>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-secondary">Platform overview</h1>
            <p className="mt-1 text-sm text-slate-500">Super Admin — manage all platform resources.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.05 }}
                className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <span className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${s.color}`}>{s.icon}</span>
                </div>
                <p className="mt-3 font-display text-3xl font-extrabold text-secondary">{s.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="font-display font-bold text-secondary mb-3">Recent candidates</h2>
              <div className="space-y-3">
                {candidates.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center gap-3">
                    <img src={c.photo} alt={c.name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-secondary">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.technology}</p>
                    </div>
                    <span className={`chip text-xs ${c.status==='Active'?'bg-success/10 text-success':'bg-warning/10 text-amber-700'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h2 className="font-display font-bold text-secondary mb-3">Recruiters</h2>
              <div className="space-y-3">
                {recruiters.map(r => (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-sm font-bold text-primary">
                      {r.firstName[0]}{r.lastName[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-secondary">{r.firstName} {r.lastName}</p>
                      <p className="text-xs text-slate-400">{r.companyName} — {r.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageTransition>
      </main>
    </>
  );
}
