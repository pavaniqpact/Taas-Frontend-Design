import { useMemo, useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { CandidateCard } from '@/shared/components/ui/CandidateCard';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { useResources } from '@/store/resources';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { TECHNOLOGIES, SKILLS_BY_TECH, PAGE_SIZE } from '@/constants';
import type { Candidate } from '@/types';
import { cn } from '@/lib/utils';

const ALL_SKILLS = [...new Set(Object.values(SKILLS_BY_TECH).flat())].sort();

export function ClientDashboard() {
  const { openMenu } = useShell();
  const { candidates } = useResources();
  const { add, has }   = useCart();
  const { push }       = useToast();

  // ── Filter state ────────────────────────────────────────────────
  const [search, setSearch]   = useState('');
  const [tech, setTech]       = useState('All');
  const [skill, setSkill]     = useState('All');
  const [minExp, setMinExp]   = useState(0);
  const [maxRate, setMaxRate] = useState(150);
  const [page, setPage]       = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const resetFilters = () => { setSearch(''); setTech('All'); setSkill('All'); setMinExp(0); setMaxRate(150); setPage(1); };
  const activeFilters = (tech!=='All'?1:0)+(skill!=='All'?1:0)+(minExp>0?1:0)+(maxRate<150?1:0);

  function goPage(p: number) { setPage(p); }
  function resetAnd(fn: () => void) { fn(); setPage(1); }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter(c => {
      const matchQ = !q || c.name.toLowerCase().includes(q) || c.technology.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q));
      return matchQ && (tech==='All'||c.technology===tech) && (skill==='All'||c.skills.includes(skill)) && c.experience>=minExp && c.ratePerHour<=maxRate;
    });
  }, [candidates, search, tech, skill, minExp, maxRate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safe       = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safe-1)*PAGE_SIZE, safe*PAGE_SIZE);

  function handleAdd(c: Candidate) {
    add(c);
    push({ type:'success', title:'Added to shortlist', description:`${c.name} added.` });
  }

  return (
    <>
      <Topbar onMenu={openMenu} search={search} onSearch={v => { setSearch(v); setPage(1); }} searchPlaceholder="Search by name, skill or technology…" />
      <main className="page">
        <PageTransition>
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-secondary">Talent pool</h1>
              <p className="mt-1 text-sm text-slate-500">{candidates.length} pre-vetted profiles ready to hire</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(v=>!v)}>
              <FiFilter size={14}/> Filters {activeFilters>0 && <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">{activeFilters}</span>}
            </Button>
          </div>

          {/* Filter panel (collapsible) */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
                className="overflow-hidden">
                <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Technology */}
                    <div>
                      <label className="label">Technology</label>
                      <select className="field" value={tech} onChange={e=>{setTech(e.target.value);setPage(1);}}>
                        <option value="All">All technologies</option>
                        {TECHNOLOGIES.map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    {/* Skill */}
                    <div>
                      <label className="label">Skill</label>
                      <select className="field" value={skill} onChange={e=>{setSkill(e.target.value);setPage(1);}}>
                        <option value="All">All skills</option>
                        {ALL_SKILLS.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                    {/* Experience */}
                    <div>
                      <label className="label">Min experience: <span className="font-bold text-primary">{minExp} yrs</span></label>
                      <input type="range" min={0} max={14} value={minExp} onChange={e=>{resetAnd(()=>setMinExp(+e.target.value));}}
                        className="w-full mt-2" style={{ accentColor:'#2563EB' }} />
                    </div>
                    {/* Rate */}
                    <div>
                      <label className="label">Max rate: <span className="font-bold text-primary">${maxRate}/hr</span></label>
                      <input type="range" min={25} max={150} value={maxRate} onChange={e=>{resetAnd(()=>setMaxRate(+e.target.value));}}
                        className="w-full mt-2" style={{ accentColor:'#2563EB' }} />
                    </div>
                  </div>
                  {activeFilters > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={resetFilters}>
                        <FiX size={13}/> Clear filters
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <p className="mb-4 text-sm text-slate-500">
            <span className="font-semibold text-secondary">{filtered.length}</span> profiles {filtered.length !== candidates.length ? 'match' : 'available'}
          </p>

          {/* Cards grid */}
          {pageItems.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-20 text-center">
              <p className="font-display text-lg font-bold text-secondary">No profiles match</p>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters.</p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>Clear filters</Button>
            </div>
          ) : (
            <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4')}>
              {pageItems.map((c, i) => (
                <CandidateCard key={c.id} candidate={c} inCart={has(c.id)} onAdd={handleAdd} index={i} />
              ))}
            </div>
          )}

          <Pagination page={safe} totalPages={totalPages}
            onPrev={() => setPage(p=>p-1)} onNext={() => setPage(p=>p+1)} onPage={goPage} />
        </PageTransition>
      </main>
    </>
  );
}
