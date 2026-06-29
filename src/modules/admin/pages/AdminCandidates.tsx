import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { CandidateCard } from '@/shared/components/ui/CandidateCard';
import { useResources } from '@/store/resources';
import { useToast } from '@/store/toast';
import { TECHNOLOGIES, PAGE_SIZE, SKILLS_BY_TECH } from '@/constants';
import { cn } from '@/lib/utils';
import type { Candidate } from '@/types';

const ALL_SKILLS = [...new Set(Object.values(SKILLS_BY_TECH).flat())].sort();

export function AdminCandidates() {
  const navigate     = useNavigate();
  const { openMenu } = useShell();
  const { candidates, remove } = useResources();
  const { push }     = useToast();

  const [search, setSearch]         = useState('');
  const [tech, setTech]             = useState('All');
  const [skills, setSkills]         = useState<string[]>([]);
  const [minExp, setMinExp]         = useState(0);
  const [maxRate, setMaxRate]       = useState(150);
  const [page, setPage]             = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [toDelete, setToDelete]     = useState<Candidate | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const toggleSkill = (s: string) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // Skills shown depend on the selected technology.
  const skillOptions    = tech === 'All' ? ALL_SKILLS : (SKILLS_BY_TECH[tech] ?? []);
  const allActiveSkills = skills;

  // Changing technology refreshes the skill list and clears chosen skills.
  const changeTech = (value: string) => {
    setTech(value);
    setSkills([]);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(''); setTech('All');
    setSkills([]);
    setMinExp(0); setMaxRate(150); setPage(1);
  };

  const activeFilters =
    (tech !== 'All' ? 1 : 0) +
    (allActiveSkills.length > 0 ? 1 : 0) +
    (minExp > 0 ? 1 : 0) +
    (maxRate < 150 ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return candidates.filter(c =>
      (!q || c.name.toLowerCase().includes(q) || c.technology.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q))) &&
      (tech === 'All' || c.technology === tech) &&
      (allActiveSkills.length === 0 || allActiveSkills.some(s => c.skills.includes(s))) &&
      c.experience >= minExp && c.ratePerHour <= maxRate
    );
  }, [candidates, search, tech, allActiveSkills.join(','), minExp, maxRate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safe       = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safe - 1) * PAGE_SIZE, safe * PAGE_SIZE);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await remove(toDelete.id);
    setDeleting(false);
    push({ type: 'success', title: 'Candidate deleted', description: `${toDelete.name} removed.` });
    setToDelete(null);
  }

  return (
    <>
      <Topbar
        onMenu={openMenu}
        actions={<Button size="sm" onClick={() => navigate('/admin/candidates/add')}><FiPlus size={14} />Add candidate</Button>}
      />
      <main className="page">
        <PageTransition>

          {/* Header */}
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-secondary">Candidate management</h1>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} profiles available · {candidates.length} total
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(v => !v)}>
              <FiFilter size={14} /> Filters
              {activeFilters > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>

          {/* Search */}
          <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="relative max-w-md">
              <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, skill or technology…" className="field pl-9 pr-8" />
              {search && (
                <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FiX size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter panel — collapsible, same layout as ClientDashboard */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Technology */}
                    <div>
                      <label className="label">Technology</label>
                      <select className="field" value={tech}
                        onChange={e => changeTech(e.target.value)}>
                        <option value="All">All technologies</option>
                        {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="label">Skills</label>
                      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        {skillOptions.map(s => (
                          <label key={s} className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-slate-50 transition">
                            <span className={`text-sm ${skills.includes(s) ? 'font-medium text-primary' : 'text-secondary'}`}>{s}</span>
                            <input
                              type="checkbox"
                              checked={skills.includes(s)}
                              onChange={() => { toggleSkill(s); setPage(1); }}
                              className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-primary"
                            />
                          </label>
                        ))}
                        {skillOptions.length === 0 && (
                          <p className="px-3 py-2 text-sm text-slate-400">No skills listed for this technology.</p>
                        )}
                      </div>
                    </div>

                    {/* Min experience */}
                    <div>
                      <label className="label">
                        Min experience: <span className="font-bold text-primary">{minExp} yrs</span>
                      </label>
                      <input type="range" min={0} max={14} value={minExp}
                        onChange={e => { setMinExp(+e.target.value); setPage(1); }}
                        className="w-full mt-2" style={{ accentColor: '#2563EB' }} />
                    </div>

                    {/* Max rate */}
                    <div>
                      <label className="label">
                        Max rate: <span className="font-bold text-primary">${maxRate}/hr</span>
                      </label>
                      <input type="range" min={25} max={150} value={maxRate}
                        onChange={e => { setMaxRate(+e.target.value); setPage(1); }}
                        className="w-full mt-2" style={{ accentColor: '#2563EB' }} />
                    </div>

                  </div>
                  {activeFilters > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={resetFilters}>
                        <FiX size={13} /> Clear filters
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <p className="mb-4 text-sm text-slate-500">
            <span className="font-semibold text-secondary">{filtered.length}</span> profiles available
          </p>

          {/* Card grid — same as client, but with recruiterView for Edit/Delete */}
          {pageItems.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-20 text-center">
              <p className="font-display text-lg font-bold text-secondary">No candidates found</p>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters.</p>
              {activeFilters > 0 && (
                <Button variant="outline" className="mt-4" onClick={resetFilters}>Clear filters</Button>
              )}
            </div>
          ) : (
            <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4')}>
              {pageItems.map((c, i) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  inCart={false}
                  onAdd={() => {}}
                  index={i}
                  recruiterView
                  onEdit={() => navigate(`/admin/candidates/edit/${c.id}`)}
                  onDelete={() => setToDelete(c)}
                />
              ))}
            </div>
          )}

          <Pagination
            page={safe} totalPages={totalPages}
            onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} onPage={p => setPage(p)}
          />

        </PageTransition>
      </main>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete candidate?"
        message={`${toDelete?.name || 'This candidate'} will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}