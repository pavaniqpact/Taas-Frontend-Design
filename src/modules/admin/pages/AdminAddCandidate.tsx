import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFile, FiCheck } from 'react-icons/fi';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { CandidateAvatar } from '@/shared/components/ui/CandidateAvatar';
import { useResources } from '@/store/resources';
import { useToast } from '@/store/toast';
import { resourceSchema, type ResourceValues } from '@/lib/validation';
import { TECHNOLOGIES } from '@/constants';

interface DocFiles {
  resume: File | null;
  evaluationReport: File | null;
  backgroundReport: File | null;
}

export function AdminAddCandidate() {
  const navigate     = useNavigate();
  const { id }       = useParams();
  const isEdit       = !!id;
  const { openMenu } = useShell();
  const { add, update, getById } = useResources();
  const { push }     = useToast();

  const existing = useMemo(() => (id ? getById(id) : undefined), [id, getById]);

  const [docFiles, setDocFiles] = useState<DocFiles>({
    resume: null, evaluationReport: null, backgroundReport: null,
  });

  const docLabels = {
    resume:           docFiles.resume           ? docFiles.resume.name           : existing?.documents.resume           ? 'resume.pdf'     : null,
    evaluationReport: docFiles.evaluationReport ? docFiles.evaluationReport.name : existing?.documents.evaluationReport ? 'evaluation.pdf' : null,
    backgroundReport: docFiles.backgroundReport ? docFiles.backgroundReport.name : existing?.documents.backgroundReport ? 'background.pdf' : null,
  };

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } =
    useForm<ResourceValues>({
      resolver: zodResolver(resourceSchema), mode: 'onChange',
      defaultValues: { technology: 'AI Engineer', gender: 'male', experience: 0, ratePerHour: 45, summary: '', skills: '' },
    });

  const selectedGender = watch('gender') as 'male' | 'female';

  useEffect(() => {
    if (existing) reset({
      name: existing.name, technology: existing.technology, gender: existing.gender,
      experience: existing.experience, ratePerHour: existing.ratePerHour,
      skills: existing.skills.join(', '), summary: existing.summary,
    });
  }, [existing, reset]);

  async function onSubmit(v: ResourceValues) {
    const skills    = v.skills.split(',').map(s => s.trim()).filter(Boolean);
    const hasResume = !!(docFiles.resume || existing?.documents.resume);
    const hasEval   = !!(docFiles.evaluationReport || existing?.documents.evaluationReport);
    const hasBg     = !!(docFiles.backgroundReport || existing?.documents.backgroundReport);

    const documentUrls = {
      resume:           docFiles.resume           ? URL.createObjectURL(docFiles.resume)           : existing?.documentUrls?.resume,
      evaluationReport: docFiles.evaluationReport ? URL.createObjectURL(docFiles.evaluationReport) : existing?.documentUrls?.evaluationReport,
      backgroundReport: docFiles.backgroundReport ? URL.createObjectURL(docFiles.backgroundReport) : existing?.documentUrls?.backgroundReport,
    };

    const payload = {
      name: v.name, technology: v.technology as any, availability: 'Available' as const,
      gender: v.gender as 'male' | 'female', experience: v.experience,
      ratePerHour: v.ratePerHour, skills, summary: v.summary, photo: '',
      documents: { resume: hasResume, evaluationReport: hasEval, backgroundReport: hasBg },
      documentUrls,
    };

    if (isEdit && existing) {
      await update(existing.id, payload);
      push({ type: 'success', title: 'Candidate updated', description: `${v.name} saved.` });
    } else {
      await add('usr-admin', payload);
      push({ type: 'success', title: 'Candidate added', description: `${v.name} added to platform.` });
    }
    navigate('/admin/candidates');
  }

  function pickDoc(k: keyof DocFiles) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      setDocFiles(d => ({ ...d, [k]: f }));
    };
  }

  return (
    <>
      <Topbar onMenu={openMenu} />
      <main className="page">
        <PageTransition>
          <button onClick={() => navigate('/admin/candidates')}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-secondary">
            <FiArrowLeft size={14} /> Back
          </button>
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-2xl font-bold text-secondary">{isEdit ? 'Edit candidate' : 'Add candidate'}</h1>

            <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit(onSubmit)} className="card mt-6 p-6 sm:p-8" noValidate>

              <div className="mb-6 flex items-center gap-4">
                <CandidateAvatar gender={selectedGender ?? 'male'} id={existing?.id ?? 'preview'} size="md" />
                <div>
                  <p className="text-sm font-semibold text-secondary">Avatar preview</p>
                  <p className="text-xs text-slate-400 mt-0.5">Automatically assigned based on gender.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input label="Full name" placeholder="Candidate full name" error={errors.name?.message} {...register('name')} />
                </div>
                <div>
                  <label className="label">Technology</label>
                  <select className={`field${errors.technology ? ' field-error' : ''}`} {...register('technology')}>
                    {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.technology && <p className="mt-1 text-xs font-medium text-danger">{errors.technology.message}</p>}
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className={`field${errors.gender ? ' field-error' : ''}`} {...register('gender')}>
                    <option value="male">♂ Male</option>
                    <option value="female">♀ Female</option>
                  </select>
                </div>
                <Input label="Experience (years)" type="number" placeholder="5" error={errors.experience?.message} {...register('experience')} />
                <Input label="Rate per hour ($)" type="number" placeholder="45" error={errors.ratePerHour?.message} {...register('ratePerHour')} />
                <div className="sm:col-span-2">
                  <Input label="Skills (comma separated)" placeholder="React, Node.js, AWS" error={errors.skills?.message} {...register('skills')} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Summary</label>
                  <textarea rows={3} placeholder="Professional summary…"
                    className={`field resize-none${errors.summary ? ' field-error' : ''}`} {...register('summary')} />
                  {errors.summary && <p className="mt-1 text-xs font-medium text-danger">{errors.summary.message}</p>}
                </div>
              </div>

              <div className="mt-6">
                <p className="label">Documents</p>
                <p className="text-xs text-slate-400 mb-3">Upload PDF files. Recruiters and clients can view and download them.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {([['Resume','resume'],['Evaluation','evaluationReport'],['Background','backgroundReport']] as const).map(([label, key]) => (
                    <label key={key} className="cursor-pointer">
                      <div className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition
                        ${docLabels[key] ? 'border-success/40 bg-success/5' : 'border-slate-200 hover:border-primary hover:bg-primary-50'}`}>
                        <span className={`grid h-10 w-10 place-items-center rounded-lg ${docLabels[key] ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>
                          {docLabels[key] ? <FiCheck size={18} /> : <FiFile size={18} />}
                        </span>
                        <span className="text-sm font-medium text-secondary">{label}</span>
                        <span className="max-w-full truncate text-xs text-slate-400">{docLabels[key] || 'Upload'}</span>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={pickDoc(key)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-3 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/candidates')}>Cancel</Button>
                <Button type="submit" loading={isSubmitting} className="sm:min-w-36">
                  {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add candidate'}
                </Button>
              </div>
            </motion.form>
          </div>
        </PageTransition>
      </main>
    </>
  );
}