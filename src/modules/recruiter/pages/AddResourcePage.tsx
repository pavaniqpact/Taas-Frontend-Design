import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiFile, FiCheck, FiImage } from 'react-icons/fi';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useResources } from '@/store/resources';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';
import { resourceSchema, type ResourceValues } from '@/lib/validation';
import { TECHNOLOGIES, AVAILABILITIES } from '@/constants';

interface DocState { resume: string|null; evaluationReport: string|null; backgroundReport: string|null; }

export function AddResourcePage() {
  const navigate     = useNavigate();
  const { id }       = useParams();
  const isEdit       = !!id;
  const { openMenu } = useShell();
  const { user }     = useAuth();
  const { add, update, getById } = useResources();
  const { push }     = useToast();

  const existing = useMemo(() => (id ? getById(id) : undefined), [id, getById]);
  const [photo, setPhoto] = useState<string|null>(existing?.photo ?? null);
  const [docs,  setDocs]  = useState<DocState>({
    resume: existing?.documents.resume ? 'resume.pdf' : null,
    evaluationReport: existing?.documents.evaluationReport ? 'evaluation.pdf' : null,
    backgroundReport: existing?.documents.backgroundReport ? 'background.pdf' : null,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ResourceValues>({
      resolver: zodResolver(resourceSchema), mode: 'onChange',
      defaultValues: { technology:'AI Engineer', availability:'Available', gender:'male' as const, experience:0, ratePerHour:45, summary:'', skills:'' },
    });

  useEffect(() => {
    if (existing) reset({
      name: existing.name, technology: existing.technology,
      availability: existing.availability, experience: existing.experience,
      ratePerHour: existing.ratePerHour, skills: existing.skills.join(', '),
      summary: existing.summary, gender: existing.gender,
    });
  }, [existing, reset]);

  async function onSubmit(v: ResourceValues) {
    if (!user) return;
    const skills    = v.skills.split(',').map(s => s.trim()).filter(Boolean);
    const documents = { resume:!!docs.resume, evaluationReport:!!docs.evaluationReport, backgroundReport:!!docs.backgroundReport };
    const payload = {
      name: v.name, technology: v.technology as any, availability: v.availability,
      experience: v.experience, ratePerHour: v.ratePerHour, skills, summary: v.summary,
      gender: v.gender as 'male' | 'female',
      documents,
      photo: '',
    };

    if (isEdit && existing) {
      await update(existing.id, payload);
      push({ type:'success', title:'Resource updated', description:`${v.name} saved.` });
    } else {
      await add(user.id, payload);
      push({ type:'success', title:'Resource added!', description:`${v.name} is in your dashboard.` });
    }
    navigate('/recruiter');
  }

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPhoto(URL.createObjectURL(f));
  }
  function pickDoc(k: keyof DocState) { return (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setDocs(d => ({ ...d, [k]: f.name }));
  }; }

  return (
    <>
      <Topbar onMenu={openMenu} />
      <main className="page">
        <PageTransition>
          <button onClick={() => navigate('/recruiter')} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-secondary">
            <FiArrowLeft size={14}/> Back to dashboard
          </button>

          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-2xl font-bold text-secondary">{isEdit ? 'Edit resource' : 'Add resource'}</h1>
            <p className="mt-1 text-sm text-slate-500">{isEdit ? "Update this candidate's details." : "Upload a candidate. Only visible to you."}</p>

            <motion.form initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              onSubmit={handleSubmit(onSubmit)} className="card mt-6 p-6 sm:p-8" noValidate>

              {/* Photo upload */}
              <div className="mb-6 flex items-center gap-5">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400 ring-2 ring-white shadow-sm">
                  {photo ? <img src={photo} alt="preview" className="h-full w-full object-cover"/> : <FiImage size={28}/>}
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-secondary-700 hover:border-primary hover:text-primary transition">
                    <FiUpload size={14}/> {photo ? 'Change photo' : 'Upload photo'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input label="Candidate name" placeholder="Full name" error={errors.name?.message} {...register('name')} />
                </div>
                <div>
                  <label className="label">Technology</label>
                  <select className={`field${errors.technology?' field-error':''}`} {...register('technology')}>
                    {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.technology && <p className="mt-1 text-xs font-medium text-danger">{errors.technology.message}</p>}
                </div>
                <div>
                  <label className="label">Availability</label>
                  <select className="field" {...register('availability')}>
                    {AVAILABILITIES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className={`field${errors.gender ? ' field-error' : ''}`} {...register('gender')}>
                    <option value="male">♂ Male</option>
                    <option value="female">♀ Female</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-xs font-medium text-danger">{errors.gender.message}</p>}
                </div>
                <Input label="Experience (years)" type="number" placeholder="5" error={errors.experience?.message} {...register('experience')} />
                <Input label="Rate per hour ($)" type="number" placeholder="45"  error={errors.ratePerHour?.message} {...register('ratePerHour')} />
                <div className="sm:col-span-2">
                  <Input label="Skills (comma separated)" placeholder="React, Node.js, AWS" error={errors.skills?.message} {...register('skills')} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Summary</label>
                  <textarea rows={3} placeholder="Short professional summary…"
                    className={`field resize-none${errors.summary?' field-error':''}`} {...register('summary')} />
                  {errors.summary && <p className="mt-1 text-xs font-medium text-danger">{errors.summary.message}</p>}
                </div>
              </div>

              {/* Document uploads */}
              <div className="mt-6">
                <p className="label">Documents</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {([['Resume','resume'],['Evaluation','evaluationReport'],['Background','backgroundReport']] as const).map(([label, key]) => (
                    <label key={key} className="cursor-pointer">
                      <div className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition ${docs[key]?'border-success/40 bg-success/5':'border-slate-200 hover:border-primary hover:bg-primary-50'}`}>
                        <span className={`grid h-10 w-10 place-items-center rounded-lg ${docs[key]?'bg-success/10 text-success':'bg-slate-100 text-slate-400'}`}>
                          {docs[key] ? <FiCheck size={18}/> : <FiFile size={18}/>}
                        </span>
                        <span className="text-sm font-medium text-secondary">{label}</span>
                        <span className="max-w-full truncate text-xs text-slate-400">{docs[key] || 'Click to upload'}</span>
                      </div>
                      <input type="file" className="hidden" onChange={pickDoc(key)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => navigate('/recruiter')}>Cancel</Button>
                <Button type="submit" loading={isSubmitting} className="sm:min-w-36">
                  {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Save resource'}
                </Button>
              </div>
            </motion.form>
          </div>
        </PageTransition>
      </main>
    </>
  );
}
