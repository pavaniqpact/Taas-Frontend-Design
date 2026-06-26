import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SkillTag, TechBadge } from '@/shared/components/ui/Badge';
import { CandidateAvatar } from '@/shared/components/ui/CandidateAvatar';
import { useResources } from '@/store/resources';
import { useToast } from '@/store/toast';
import { TECHNOLOGIES, PAGE_SIZE, SKILLS_BY_TECH } from '@/constants';
import { formatRate, formatDate } from '@/lib/utils';
import type { Candidate } from '@/types';

const ALL_SKILLS = [...new Set(Object.values(SKILLS_BY_TECH).flat())].sort();

export function AdminCandidates() {
  const navigate     = useNavigate();
  const { openMenu } = useShell();
  const { candidates, remove } = useResources();
  const { push }     = useToast();

  const [search, setSearch]   = useState('');
  const [tech, setTech]       = useState('All');
  const [skill, setSkill]     = useState('All');
  const [minExp, setMinExp]   = useState(0);
  const [maxRate, setMaxRate] = useState(150);
  const [page, setPage]       = useState(1);
  const [toDelete, setToDelete] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewing, setViewing]   = useState<Candidate | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return candidates.filter(c =>
      (!q || c.name.toLowerCase().includes(q) || c.technology.toLowerCase().includes(q) || c.skills.some(s=>s.toLowerCase().includes(q))) &&
      (tech==='All'||c.technology===tech) && (skill==='All'||c.skills.includes(skill)) && c.experience>=minExp && c.ratePerHour<=maxRate
    );
  }, [candidates, search, tech, skill, minExp, maxRate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length/PAGE_SIZE));
  const safe       = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safe-1)*PAGE_SIZE, safe*PAGE_SIZE);

  const resetFilters = () => { setSearch(''); setTech('All'); setSkill('All'); setMinExp(0); setMaxRate(150); setPage(1); };

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await remove(toDelete.id);
    setDeleting(false);
    push({ type:'success', title:'Candidate deleted', description:`${toDelete.name} removed.` });
    setToDelete(null);
  }

  return (
    <>
      <Topbar onMenu={openMenu}
        actions={<Button size="sm" onClick={() => navigate('/admin/candidates/add')}><FiPlus size={14}/>Add candidate</Button>} />
      <main className="page">
        <PageTransition>
          <div className="mb-5">
            <h1 className="font-display text-2xl font-bold text-secondary">Candidate management</h1>
            <p className="mt-1 text-sm text-slate-500">{candidates.length} total candidates on the platform</p>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-1">
                <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                  placeholder="Search…" className="field pl-9 pr-8"/>
                {search && <button onClick={()=>{setSearch('');setPage(1);}} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><FiX size={13}/></button>}
              </div>
              <select className="field" value={tech} onChange={e=>{setTech(e.target.value);setPage(1);}}>
                <option value="All">All technologies</option>
                {TECHNOLOGIES.map(t=><option key={t}>{t}</option>)}
              </select>
              <select className="field" value={skill} onChange={e=>{setSkill(e.target.value);setPage(1);}}>
                <option value="All">All skills</option>
                {ALL_SKILLS.map(s=><option key={s}>{s}</option>)}
              </select>
              <div>
                <input type="range" min={0} max={14} value={minExp} onChange={e=>{setMinExp(+e.target.value);setPage(1);}}
                  className="w-full" style={{accentColor:'#2563EB'}}/>
                <p className="text-xs text-slate-500 mt-1">Min exp: <b>{minExp} yrs</b></p>
              </div>
              <div>
                <input type="range" min={25} max={150} value={maxRate} onChange={e=>{setMaxRate(+e.target.value);setPage(1);}}
                  className="w-full" style={{accentColor:'#2563EB'}}/>
                <p className="text-xs text-slate-500 mt-1">Max rate: <b>${maxRate}/hr</b></p>
              </div>
            </div>
          </div>

          <p className="mb-3 text-sm text-slate-500"><span className="font-semibold text-secondary">{filtered.length}</span> candidates match</p>

          {pageItems.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-20 text-center">
              <p className="font-display text-lg font-bold text-secondary">No candidates found</p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>Clear filters</Button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                      {['Candidate','Technology','Experience','Rate','Created',''].map(h=>(
                        <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(c => (
                      <motion.tr key={c.id} initial={{opacity:0}} animate={{opacity:1}} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <CandidateAvatar gender={c.gender} id={c.id} size="xs" />
                            <div>
                              <p className="font-medium text-secondary">{c.name}</p>
                              <p className="text-xs text-slate-400">{c.recruiterId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><TechBadge>{c.technology}</TechBadge></td>
                        <td className="px-5 py-3 text-slate-600">{c.experience} yrs</td>
                        <td className="px-5 py-3 font-semibold text-secondary">{formatRate(c.ratePerHour)}</td>
                        <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={()=>setViewing(c)} title="View" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary transition"><FiEye size={15}/></button>
                            <button onClick={()=>navigate(`/admin/candidates/edit/${c.id}`)} title="Edit" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary transition"><FiEdit2 size={15}/></button>
                            <button onClick={()=>setToDelete(c)} title="Delete" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-danger/10 hover:text-danger transition"><FiTrash2 size={15}/></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Pagination page={safe} totalPages={totalPages} onPrev={()=>setPage(p=>p-1)} onNext={()=>setPage(p=>p+1)} onPage={setPage}/>
        </PageTransition>
      </main>

      <Modal open={!!viewing} onClose={()=>setViewing(null)} title={viewing?.name} description={viewing?.technology}>
        {viewing && <div className="space-y-4">
          <div className="flex items-center gap-4">
            <CandidateAvatar gender={viewing.gender} id={viewing.id} size="sm" className="ring-2 ring-white shadow" />
            <div>
              <p className="font-display font-bold text-secondary">{viewing.name}</p>
              <p className="text-sm text-slate-500">{viewing.technology}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[['Experience',`${viewing.experience} yrs`],['Rate',formatRate(viewing.ratePerHour)],['Recruiter',viewing.recruiterId],['Created',formatDate(viewing.createdAt)]].map(([l,v])=>(
              <div key={l} className="rounded-xl bg-slate-50 px-3 py-2"><p className="text-xs text-slate-400">{l}</p><p className="font-medium text-secondary">{v}</p></div>
            ))}
          </div>
          <div><p className="label">Skills</p><div className="flex flex-wrap gap-1.5">{viewing.skills.map(s=><SkillTag key={s}>{s}</SkillTag>)}</div></div>
          <p className="text-sm text-slate-600">{viewing.summary}</p>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" fullWidth onClick={()=>setViewing(null)}>Close</Button>
            <Button fullWidth onClick={()=>{navigate(`/admin/candidates/edit/${viewing.id}`);setViewing(null);}}>Edit</Button>
          </div>
        </div>}
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Delete candidate?" message={`${toDelete?.name||'This candidate'} will be permanently removed.`}
        confirmLabel="Delete" loading={deleting} onConfirm={confirmDelete} onCancel={()=>setToDelete(null)}/>
    </>
  );
}