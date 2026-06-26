import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { Modal } from '@/shared/components/ui/Modal';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Input, PasswordInput } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/store/toast';
import { createRecruiterSchema, type CreateRecruiterValues } from '@/lib/validation';
import { getGlobalRegistry, pushToRegistry, updateInRegistry, removeFromRegistry } from '@/store/auth';
import { delay } from '@/lib/utils';
import type { User } from '@/types';

export function AdminRecruiters() {
  const { openMenu } = useShell();
  const { push }     = useToast();

  // Read live from global registry, initialised with seed recruiters
  const [recruiters, setRecruiters] = useState<User[]>(() =>
    getGlobalRegistry().filter(u => u.role === 'recruiter')
  );
  const [search, setSearch]   = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<User | null>(null);
  const [toDelete, setToDelete]   = useState<User | null>(null);
  const [deleting, setDeleting]   = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<CreateRecruiterValues>({ resolver: zodResolver(createRecruiterSchema), mode: 'onChange' });

  function openCreate() { reset(); setEditing(null); setModalOpen(true); }
  function openEdit(r: User) {
    setEditing(r);
    setValue('firstName', r.firstName); setValue('lastName', r.lastName);
    setValue('email', r.email);         setValue('companyName', r.companyName);
    setValue('designation', r.designation); setValue('phone', r.phone);
    setValue('password', r.password);
    setModalOpen(true);
  }

  async function onSubmit(v: CreateRecruiterValues) {
    await delay(700);
    if (editing) {
      // Update in both local state and global registry
      const updated: User = { ...editing, ...v };
      updateInRegistry(editing.id, v);
      setRecruiters(p => p.map(r => r.id === editing.id ? updated : r));
      push({ type: 'success', title: 'Recruiter updated', description: `${v.firstName} ${v.lastName} updated.` });
    } else {
      // Check for duplicate email across ALL users in registry
      if (getGlobalRegistry().some(u => u.email.toLowerCase() === v.email.toLowerCase())) {
        push({ type: 'error', title: 'Email exists', description: 'This email is already in use.' });
        return;
      }
      const newR: User = {
        id: `rec-${Math.random().toString(36).slice(2, 7)}`,
        role: 'recruiter',
        ...v,
      };
      // ── Push into global auth registry so recruiter can LOGIN immediately ──
      pushToRegistry(newR);
      setRecruiters(p => [newR, ...p]);
      push({ type: 'success', title: 'Recruiter created', description: `${v.firstName} ${v.lastName} can now log in as a recruiter.` });
    }
    setModalOpen(false); reset(); setEditing(null);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await delay(600);
    removeFromRegistry(toDelete.id);
    setRecruiters(p => p.filter(r => r.id !== toDelete.id));
    setDeleting(false);
    push({ type: 'success', title: 'Recruiter removed', description: `${toDelete.firstName} ${toDelete.lastName} deleted.` });
    setToDelete(null);
  }

  const filtered = recruiters.filter(r => {
    const q = search.toLowerCase();
    return !q || r.firstName.toLowerCase().includes(q) || r.lastName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) || r.companyName.toLowerCase().includes(q);
  });

  return (
    <>
      <Topbar onMenu={openMenu}
        actions={<Button size="sm" onClick={openCreate}><FiPlus size={14}/>Add recruiter</Button>} />
      <main className="page">
        <PageTransition>
          <div className="mb-5">
            <h1 className="font-display text-2xl font-bold text-secondary">Recruiter management</h1>
            <p className="mt-1 text-sm text-slate-500">{recruiters.length} recruiters on the platform</p>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="relative max-w-md">
              <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search recruiters…" className="field pl-9 pr-8"/>
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><FiX size={13}/></button>}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-20 text-center">
              <p className="font-display text-lg font-bold text-secondary">No recruiters found</p>
              <Button className="mt-4" onClick={openCreate}><FiPlus size={14}/>Add recruiter</Button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                    {['Recruiter','Company','Designation','Phone','Actions'].map(h =>
                      <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-50 text-sm font-bold text-primary shrink-0">
                            {r.firstName[0]}{r.lastName[0]}
                          </span>
                          <div>
                            <p className="font-medium text-secondary">{r.firstName} {r.lastName}</p>
                            <p className="text-xs text-slate-400">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{r.companyName}</td>
                      <td className="px-5 py-3 text-slate-600">{r.designation}</td>
                      <td className="px-5 py-3 text-slate-600">{r.phone}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(r)} title="Edit"
                            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary transition">
                            <FiEdit2 size={15}/>
                          </button>
                          <button onClick={() => setToDelete(r)} title="Delete"
                            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-danger/10 hover:text-danger transition">
                            <FiTrash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageTransition>
      </main>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); setEditing(null); }}
        title={editing ? 'Edit recruiter' : 'Create recruiter'}
        description={editing ? 'Update recruiter details.' : 'New recruiter will be able to log in immediately with these credentials.'}
        size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name"  error={errors.lastName?.message}  {...register('lastName')} />
          </div>
          <Input label="Work email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Company"    error={errors.companyName?.message} {...register('companyName')} />
          <Input label="Designation" error={errors.designation?.message} {...register('designation')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <PasswordInput label="Password" error={errors.password?.message} {...register('password')} />
          {!editing && (
            <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
              💡 The recruiter can log in at <span className="font-semibold text-secondary">/login</span> using these credentials with the <span className="font-semibold text-secondary">Recruiter</span> role.
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" fullWidth onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" fullWidth loading={isSubmitting}>{isSubmitting ? 'Saving…' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Delete recruiter?"
        message={`${toDelete?.firstName || ''} ${toDelete?.lastName || ''} will be permanently removed and can no longer log in.`}
        confirmLabel="Delete" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  );
}
