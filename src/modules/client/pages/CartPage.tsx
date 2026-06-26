import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiArrowLeft, FiSend, FiShoppingCart, FiBriefcase } from 'react-icons/fi';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Input } from '@/shared/components/ui/Input';
import { TechBadge } from '@/shared/components/ui/Badge';
import { CandidateAvatar } from '@/shared/components/ui/CandidateAvatar';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';
import { useDemand } from '@/store/demand';
import { contactSalesSchema, type ContactSalesValues } from '@/lib/validation';
import { formatRate, delay } from '@/lib/utils';
import type { Candidate } from '@/types';

export function CartPage() {
  const navigate     = useNavigate();
  const { openMenu } = useShell();
  const { items, remove, clear, count } = useCart();
  const { user }                        = useAuth();
  const { push }                        = useToast();
  const { removeDemand, clearUserDemand } = useDemand();

  // ── State — one contact-sales modal, one confirm-remove ──
  const [salesOpen, setSalesOpen]   = useState(false);
  const [toRemove,  setToRemove]    = useState<Candidate | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ContactSalesValues>({
      resolver: zodResolver(contactSalesSchema), mode:'onChange',
      defaultValues: {
        name: user ? `${user.firstName} ${user.lastName}` : '',
        company: user?.companyName ?? '',
        email: user?.email ?? '',
        message: '',
      },
    });

  async function submitSales(v: ContactSalesValues) {
    await delay(900);
    void v;
    setSalesOpen(false);
    reset();
    push({ type:'success', title:'Request sent!', description:'Our sales team will contact you shortly.' });
  }

  function confirmRemove() {
    if (!toRemove || !user) return;
    remove(toRemove.id);
    removeDemand(toRemove.id, user.id);
    push({ type: 'info', title: 'Removed from shortlist', description: `${toRemove.name} removed.` });
    setToRemove(null);
  }

  const avgRate = count ? Math.round(items.reduce((s,c)=>s+c.ratePerHour,0)/count) : 0;

  return (
    <>
      <Topbar onMenu={openMenu} />
      <main className="page">
        <PageTransition>
          <button onClick={() => navigate('/client')} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-secondary">
            <FiArrowLeft size={14}/> Back to talent pool
          </button>

          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-secondary">Your shortlist</h1>
            <p className="mt-1 text-sm text-slate-500">{count} {count === 1 ? 'profile' : 'profiles'} selected</p>
          </div>

          {count === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-24 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary">
                <FiShoppingCart size={28}/>
              </span>
              <p className="mt-4 font-display text-lg font-bold text-secondary">Your shortlist is empty</p>
              <p className="mt-1 text-sm text-slate-500">Browse the pool and shortlist profiles you want.</p>
              <Button className="mt-5" onClick={() => navigate('/client')}>Browse talent</Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-3">
                <AnimatePresence>
                  {items.map(c => (
                    <motion.div key={c.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, x:-20 }} className="card flex items-center gap-4 p-4">
                      <CandidateAvatar gender={c.gender} id={c.id} size="sm" className="ring-2 ring-white shadow-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-secondary truncate">{c.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <TechBadge>{c.technology}</TechBadge>
                          <span className="inline-flex items-center gap-1"><FiBriefcase size={12}/>{c.experience} yrs</span>
                        </div>
                      </div>
                      <p className="font-semibold text-secondary shrink-0">{formatRate(c.ratePerHour)}</p>
                      <button onClick={() => setToRemove(c)} aria-label={`Remove ${c.name}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-danger/10 hover:text-danger transition">
                        <FiTrash2 size={16}/>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary sidebar */}
              <div>
                <div className="card p-6">
                  <h2 className="font-display font-bold text-secondary mb-4">Summary</h2>
                  <dl className="space-y-2.5 text-sm">
                    {[['Profiles', count],['Avg. rate', formatRate(avgRate)]].map(([l,v]) => (
                      <div key={String(l)} className="flex justify-between">
                        <dt className="text-slate-500">{l}</dt>
                        <dd className="font-semibold text-secondary">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Button fullWidth size="lg" className="mt-5" onClick={() => setSalesOpen(true)}>
                    <FiSend size={14}/> Contact sales
                  </Button>
                  <button onClick={() => { if (user) clearUserDemand(user.id); clear(); }} className="mt-3 w-full text-center text-sm text-slate-400 hover:text-danger">
                    Clear shortlist
                  </button>
                </div>
              </div>
            </div>
          )}
        </PageTransition>
      </main>

      {/* Contact Sales modal — one instance */}
      <Modal open={salesOpen} onClose={() => setSalesOpen(false)} title="Contact sales"
        description="Tell us about your hiring need and we'll be in touch.">
        <form onSubmit={handleSubmit(submitSales)} className="space-y-4" noValidate>
          <Input label="Name"    error={errors.name?.message}    {...register('name')} />
          <Input label="Company" error={errors.company?.message} {...register('company')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <div>
            <label className="label">Message</label>
            <textarea rows={3} placeholder={`I'd like to discuss ${count} shortlisted profile${count!==1?'s':''}…`}
              className="field resize-none" {...register('message')} />
            {errors.message && <p className="mt-1 text-xs font-medium text-danger">{errors.message.message}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" fullWidth onClick={() => setSalesOpen(false)}>Cancel</Button>
            <Button type="submit" fullWidth loading={isSubmitting}>{isSubmitting?'Sending…':'Submit request'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!toRemove} title="Remove from shortlist?"
        message={`${toRemove?.name||'This profile'} will be removed.`}
        confirmLabel="Remove" onConfirm={confirmRemove} onCancel={() => setToRemove(null)} />
    </>
  );
}
