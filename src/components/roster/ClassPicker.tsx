import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateClass, useDeleteClass } from '@/hooks/useRoster';

// Shared by Group Mate Maker and Seating Chart Maker — one roster, two tools.
export function ClassPicker({
  classes, loading, activeClassId, onSelect,
}: {
  classes: { id: string; name: string; grade: string | null }[];
  loading: boolean;
  activeClassId: string | null;
  onSelect: (id: string) => void;
}) {
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const [newName, setNewName] = useState('');

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createClass.mutate({ name }, { onSuccess: (c) => { onSelect(c.id); setNewName(''); } });
  }

  return (
    <Card>
      <h2 className="font-display text-display-md text-ink mb-4 rule-ornament">Your classes</h2>
      {loading ? (
        <div className="h-9 w-64 bg-rule/50 rounded animate-pulse mt-4" />
      ) : (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {classes.map((c) => (
            <div key={c.id} className="flex items-center">
              <button
                onClick={() => onSelect(c.id)}
                className={[
                  'px-4 py-2 rounded-l-md border text-sm font-sans font-medium transition-colors duration-150',
                  activeClassId === c.id
                    ? 'bg-terracotta text-paper border-terracotta'
                    : 'bg-paper text-ink-soft border-rule hover:border-ink-faint hover:text-ink',
                ].join(' ')}
              >
                {c.name}
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${c.name}" and its whole roster? This can't be undone.`)) {
                    deleteClass.mutate(c.id);
                  }
                }}
                aria-label={`Delete ${c.name}`}
                className={[
                  'px-2 py-2 rounded-r-md border border-l-0 transition-colors duration-150',
                  activeClassId === c.id
                    ? 'bg-terracotta/90 text-paper/80 border-terracotta hover:text-paper'
                    : 'bg-paper text-ink-faint border-rule hover:text-terracotta',
                ].join(' ')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 ml-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              placeholder={classes.length === 0 ? 'e.g. Period 3 — Math' : 'New class name'}
              className="w-48"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreate}
              disabled={!newName.trim() || createClass.isPending}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add class
            </Button>
          </div>
        </div>
      )}
      {classes.length === 0 && !loading && (
        <p className="font-sans text-sm text-ink-faint mt-4">
          Create your first class to get started — then add students below.
        </p>
      )}
    </Card>
  );
}
