import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase, FiCheck, FiPlus,
  FiEdit2, FiTrash2,
  FiFileText, FiClipboard, FiShield,
  FiDownload, FiEye, FiX,
} from 'react-icons/fi';
import type { Candidate } from '@/types';
import { SkillTag, TechBadge } from './Badge';
import { Button } from './Button';
import { CandidateAvatar } from './CandidateAvatar';
import { useToast } from '@/store/toast';
import { formatRate } from '@/lib/utils';

interface Props {
  candidate: Candidate;
  inCart: boolean;
  onAdd(c: Candidate): void;
  index?: number;
  inDemand?: boolean;
  docMode?: 'client' | 'recruiter';
  recruiterView?: boolean;
  onEdit?(): void;
  onDelete?(): void;
}

export function CandidateCard({
  candidate: c,
  inCart,
  onAdd,
  index = 0,
  inDemand = false,
  docMode = 'client',
  recruiterView,
  onEdit,
  onDelete,
}: Props) {
  const { push } = useToast();
  const [activeDoc, setActiveDoc] = useState<{ label: string; icon: JSX.Element; key: string } | null>(null);

  const docs = [
    { label: 'CV',   icon: <FiFileText size={13} />,  ok: c.documents.resume,           key: 'resume' },
    { label: 'Eval', icon: <FiClipboard size={13} />, ok: c.documents.evaluationReport, key: 'evaluationReport' },
    { label: 'BG',   icon: <FiShield size={13} />,    ok: c.documents.backgroundReport, key: 'backgroundReport' },
  ];

  const isFemale = c.gender === 'female';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="card flex flex-col overflow-hidden hover:shadow-card-hover transition-shadow duration-200"
    >
      {/* ── Top ── */}
      <div className="flex flex-col items-center pt-6 pb-4 px-5 border-b border-slate-50">
        {inDemand && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600 border border-orange-200"
          >
            🔥 On demand
          </motion.span>
        )}
        <div className="relative mb-3">
          <CandidateAvatar gender={c.gender} id={c.id} size="md" />
          <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-success text-white ring-2 ring-white" title="Pre-vetted by Qpact">
            <FiCheck size={14} />
          </span>
        </div>
        <h3 className="font-display text-base font-bold text-secondary text-center leading-tight">{c.name}</h3>
        <div className="mt-1.5 flex flex-wrap justify-center items-center gap-1.5">
          <TechBadge>{c.technology}</TechBadge>
          <span className={`chip text-[11px] font-semibold ${isFemale ? 'bg-pink-50 text-pink-600 border border-pink-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
            {isFemale ? '♀ Female' : '♂ Male'}
          </span>
        </div>
      </div>

      {/* ── Details ── */}
      <div className="flex flex-col gap-3 p-5">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Experience</p>
            <p className="font-semibold text-secondary flex items-center justify-center gap-1"><FiBriefcase size={12} />{c.experience} yrs</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Rate</p>
            <p className="font-semibold text-secondary">{formatRate(c.ratePerHour)}</p>
          </div>
        </div>

        {c.skills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1.5">Skills</p>
            <div className="flex flex-wrap gap-1">{c.skills.slice(0, 4).map(s => <SkillTag key={s}>{s}</SkillTag>)}</div>
          </div>
        )}

        {/* Documents — horizontal chips, click opens popup */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1.5">Documents</p>
          <div className="flex gap-2">
            {docs.map(d => (
              <button key={d.label} disabled={!d.ok}
                onClick={() => d.ok && setActiveDoc({ label: d.label, icon: d.icon, key: d.key })}
                title={d.ok ? `Click to open ${d.label}` : `${d.label} not available`}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition
                  ${d.ok ? 'border-slate-200 bg-slate-50 text-secondary hover:border-primary hover:bg-primary-50 hover:text-primary cursor-pointer' : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'}`}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="mt-auto border-t border-slate-50 px-5 py-3 flex gap-2">
        {recruiterView ? (
          <>
            {onEdit   && <Button size="sm" variant="outline" fullWidth onClick={onEdit}><FiEdit2 size={13} /> Edit</Button>}
            {onDelete && <Button size="sm" variant="danger"  fullWidth onClick={onDelete}>Delete</Button>}
          </>
        ) : (
          <Button size="sm" variant={inCart ? 'secondary' : 'primary'} fullWidth onClick={() => onAdd(c)} disabled={inCart}>
            {inCart ? <><FiCheck size={13} /> Added</> : <><FiPlus size={13} /> Shortlist</>}
          </Button>
        )}
      </div>

      {/* ── Document popup ── */}
      <AnimatePresence>
        {activeDoc && (
          <motion.div className="absolute inset-0 z-10 flex items-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-secondary/30 backdrop-blur-[2px] rounded-2xl" onClick={() => setActiveDoc(null)} />
            <motion.div className="relative w-full rounded-b-2xl bg-white border-t border-slate-100 p-4 z-10"
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 28 }}>
              <button onClick={() => setActiveDoc(null)}
                className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full text-slate-400 hover:bg-slate-100">
                <FiX size={13} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-500">{activeDoc.icon}</span>
                <p className="text-sm font-semibold text-secondary">{activeDoc.label}</p>
              </div>
              <div className={`grid gap-2 ${docMode === 'recruiter' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {/* View — recruiter only */}
                {docMode === 'recruiter' && (
                  <button onClick={() => {
                    const url = c.documentUrls?.[activeDoc.key as keyof typeof c.documentUrls];
                    if (url) { window.open(url, '_blank'); }
                    else { push({ type: 'warning', title: 'No file uploaded', description: 'Upload a real file via Edit to view it.' }); }
                    setActiveDoc(null);
                  }} className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-50 py-2 text-sm font-semibold text-primary hover:bg-primary-100 transition">
                    <FiEye size={14} /> View
                  </button>
                )}
                {/* Download — both roles */}
                <button onClick={() => {
                  const url = c.documentUrls?.[activeDoc.key as keyof typeof c.documentUrls];
                  if (url) {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${c.name}_${activeDoc.label}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    push({ type: 'success', title: `Downloading ${activeDoc.label}`, description: 'Download started.' });
                  } else {
                    push({ type: 'warning', title: 'No file uploaded', description: 'Upload a real file via Edit to download it.' });
                  }
                  setActiveDoc(null);
                }} className="flex items-center justify-center gap-2 rounded-xl bg-success py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition">
                  <FiDownload size={14} /> Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.article>
  );
}