import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useShell } from '@/shared/components/layout/AppShell';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { CandidateCard } from '@/shared/components/ui/CandidateCard';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useResources } from '@/store/resources';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';
import { PAGE_SIZE } from '@/constants';
import type { Candidate } from '@/types';

export function RecruiterDashboard() {
  const navigate     = useNavigate();
  const { openMenu } = useShell();
  const { user }     = useAuth();
  const { byRecruiter, remove } = useResources();
  const { push }     = useToast();

  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [toDelete, setToDelete] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const mine = useMemo(() => (user ? byRecruiter(user.id) : []), [user, byRecruiter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mine;
    return mine.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.technology.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [mine, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safe       = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safe - 1) * PAGE_SIZE, safe * PAGE_SIZE);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await remove(toDelete.id);
    setDeleting(false);
    push({ type: 'success', title: 'Resource deleted', description: `${toDelete.name} removed.` });
    setToDelete(null);
  }

  return (
    <>
      <Topbar
        onMenu={openMenu}
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search resources…"
        actions={
          <Button size="sm" onClick={() => navigate('/recruiter/add')}>
            <FiPlus size={14} /> Add resource
          </Button>
        }
      />

      <main className="page">
        <PageTransition>
          <div className="mb-5">
            <h1 className="font-display text-2xl font-bold text-secondary">My resources</h1>
            <p className="mt-1 text-sm text-slate-500">
              {mine.length} candidate{mine.length !== 1 ? 's' : ''} from {user?.companyName}
            </p>
          </div>

          {pageItems.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-24 text-center">
              <p className="font-display text-lg font-bold text-secondary">
                {mine.length === 0 ? 'No resources yet' : 'No matches'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {mine.length === 0 ? 'Add your first candidate.' : 'Try a different search.'}
              </p>
              {mine.length === 0 && (
                <Button className="mt-5" onClick={() => navigate('/recruiter/add')}>
                  <FiPlus size={14} /> Add resource
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {pageItems.map((c, i) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  inCart={false}
                  onAdd={() => {}}
                  index={i}
                  recruiterView
                  onEdit={() => navigate(`/recruiter/edit/${c.id}`)}
                  onDelete={() => setToDelete(c)}
                />
              ))}
            </div>
          )}

          <Pagination
            page={safe}
            totalPages={totalPages}
            onPrev={() => setPage(p => p - 1)}
            onNext={() => setPage(p => p + 1)}
            onPage={setPage}
          />
        </PageTransition>
      </main>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete resource?"
        message={`${toDelete?.name || 'This resource'} will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
