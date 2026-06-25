import { motion } from 'framer-motion';
import { FiBriefcase, FiCheck, FiPlus, FiEdit2, FiTrash2, FiFileText, FiClipboard, FiShield } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { SkillTag, TechBadge } from './Badge';
import { Button } from './Button';
import { formatRate } from '@/lib/utils';

interface Props {
  candidate: Candidate;
  inCart: boolean;
  onAdd(c: Candidate): void;
  index?: number;
  /** Recruiter / admin card mode — shows Edit + Delete instead of Shortlist */
  recruiterView?: boolean;
  onEdit?(): void;
  onDelete?(): void;
}

export function CandidateCard({
  candidate: c,
  inCart,
  onAdd,
  index = 0,
  recruiterView,
  onEdit,
  onDelete,
}: Props) {
  const docIcons = [
    { label: 'CV',   icon: <FiFileText size={12} />,  ok: c.documents.resume },
    { label: 'Eval', icon: <FiClipboard size={12} />, ok: c.documents.evaluationReport },
    { label: 'BG',   icon: <FiShield size={12} />,    ok: c.documents.backgroundReport },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="card flex flex-col overflow-hidden hover:shadow-card-hover transition-shadow duration-200"
    >
      {/* ── Top: avatar centred ── */}
      <div className="flex flex-col items-center pt-6 pb-4 px-5 border-b border-slate-50">
        <div className="relative mb-3">
          <img
            src={c.photo}
            alt={c.name}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
            loading="lazy"
          />
          <span
            className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-success text-white ring-2 ring-white"
            title="Pre-vetted by Qpact"
          >
            <FiCheck size={14} />
          </span>
        </div>

        <h3 className="font-display text-base font-bold text-secondary text-center leading-tight">
          {c.name}
        </h3>

        {/* Technology only — no availability status */}
        <div className="mt-1.5">
          <TechBadge>{c.technology}</TechBadge>
        </div>
      </div>

      {/* ── Details ── */}
      <div className="flex flex-col gap-3 p-5">
        {/* Experience + Rate */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Experience</p>
            <p className="font-semibold text-secondary flex items-center justify-center gap-1">
              <FiBriefcase size={12} />
              {c.experience} yrs
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Rate</p>
            <p className="font-semibold text-secondary">{formatRate(c.ratePerHour)}</p>
          </div>
        </div>

        {/* Skills */}
        {c.skills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1.5">Skills</p>
            <div className="flex flex-wrap gap-1">
              {c.skills.slice(0, 4).map(s => (
                <SkillTag key={s}>{s}</SkillTag>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1.5">Documents</p>
          <div className="flex gap-1.5">
            {docIcons.map(d => (
              <span
                key={d.label}
                title={d.label}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
                  d.ok ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {d.icon}
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="mt-auto border-t border-slate-50 px-5 py-3 flex gap-2">
        {recruiterView ? (
          // Recruiter / admin: Edit + Delete only (no View)
          <>
            {onEdit && (
              <Button size="sm" variant="outline" fullWidth onClick={onEdit}>
                <FiEdit2 size={13} /> Edit
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="danger" fullWidth onClick={onDelete}>
                Delete
              </Button>
            )}
          </>
        ) : (
          // Client: Shortlist only (no View)
          <Button
            size="sm"
            variant={inCart ? 'secondary' : 'primary'}
            fullWidth
            onClick={() => onAdd(c)}
            disabled={inCart}
          >
            {inCart ? (
              <><FiCheck size={13} /> Added</>
            ) : (
              <><FiPlus size={13} /> Shortlist</>
            )}
          </Button>
        )}
      </div>
    </motion.article>
  );
}
