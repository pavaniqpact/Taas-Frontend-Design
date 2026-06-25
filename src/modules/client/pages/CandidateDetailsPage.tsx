import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBriefcase, FiCheck, FiPlus, FiDownload, FiFileText, FiClipboard, FiShield } from 'react-icons/fi';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { Button } from '@/shared/components/ui/Button';
import { CandidateAvatar } from '@/shared/components/ui/CandidateAvatar';
import { AvailabilityBadge, SkillTag, TechBadge } from '@/shared/components/ui/Badge';
import { useResources } from '@/store/resources';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { useDemand } from '@/store/demand';
import { useAuth } from '@/store/auth';
import { formatRate } from '@/lib/utils';

export function CandidateDetailsPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { openMenu }    = useShell();
  const { getById }     = useResources();
  const { add, has }    = useCart();
  const { user }        = useAuth();
  const { addDemand }   = useDemand();
  const { push }   = useToast();
  const c = id ? getById(id) : undefined;

  if (!c) return (
    <>
      <Topbar onMenu={openMenu} />
      <main className="page grid place-items-center text-center">
        <div>
          <p className="font-display text-xl font-bold text-secondary">Profile not found</p>
          <Button className="mt-4" onClick={() => navigate('/client')}>Back to talent pool</Button>
        </div>
      </main>
    </>
  );

  const inCart = has(c.id);
  const docs = [
    { label:'Resume',            icon:<FiFileText />,  ok:c.documents.resume },
    { label:'Evaluation report', icon:<FiClipboard />, ok:c.documents.evaluationReport },
    { label:'Background report', icon:<FiShield />,    ok:c.documents.backgroundReport },
  ];

  function handleAdd() {
    if (!user) return;
    add(c!);
    addDemand(c!.id, user.id);
    push({ type: 'success', title: 'Added to shortlist', description: `${c!.name} added.` });
  }
  function download(label: string) {
    push({ type:'info', title:`Preparing ${label}`, description:'Download will begin shortly.' });
  }

  return (
    <>
      <Topbar onMenu={openMenu} />
      <main className="page">
        <PageTransition>
          <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-secondary">
            <FiArrowLeft size={14}/> Back
          </button>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main */}
            <div className="space-y-5 lg:col-span-2">
              <div className="card p-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <div className="relative shrink-0">
                    <CandidateAvatar gender={c!.gender} id={c!.id} size="lg" className="ring-4 ring-white shadow-md" />
                    <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-success text-white ring-4 ring-white" title="Pre-vetted">
                      <FiCheck size={16}/>
                    </span>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="font-display text-2xl font-extrabold text-secondary">{c.name}</h1>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <TechBadge>{c.technology}</TechBadge>
                      <AvailabilityBadge value={c.availability} />
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-slate-500 sm:justify-start">
                      <span className="inline-flex items-center gap-1.5"><FiBriefcase size={13}/>{c.experience} years</span>
                      <span className="inline-flex items-center gap-1.5">{formatRate(c!.ratePerHour)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display font-bold text-secondary mb-2">Summary</h2>
                <p className="text-sm leading-relaxed text-slate-600">{c.summary}</p>
              </div>

              <div className="card p-6">
                <h2 className="font-display font-bold text-secondary mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">{c.skills.map(s=><SkillTag key={s}>{s}</SkillTag>)}</div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} className="card p-6">
                <p className="text-sm text-slate-500 mb-1">Hourly rate</p>
                <p className="font-display text-3xl font-extrabold text-secondary">{formatRate(c.ratePerHour)}</p>
                <Button fullWidth size="lg" className="mt-4" variant={inCart?'secondary':'primary'} onClick={handleAdd} disabled={inCart}>
                  {inCart ? <><FiCheck/>In shortlist</> : <><FiPlus/>Add to shortlist</>}
                </Button>
                <Button fullWidth variant="outline" className="mt-2" onClick={() => navigate('/client')}>
                  Back to pool
                </Button>
              </motion.div>

              <div className="card p-6">
                <h2 className="font-display font-bold text-secondary mb-1">Documents</h2>
                <p className="text-xs text-slate-400 mb-4">Download verified reports.</p>
                <div className="space-y-2">
                  {docs.map(d => (
                    <button key={d.label} disabled={!d.ok} onClick={() => download(d.label)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-primary hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-50 text-slate-600">{d.icon}</span>
                      <span className="flex-1 text-sm font-medium text-secondary">{d.label}</span>
                      {d.ok ? <FiDownload size={15} className="text-primary"/> : <span className="text-xs text-slate-400">N/A</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageTransition>
      </main>
    </>
  );
}
