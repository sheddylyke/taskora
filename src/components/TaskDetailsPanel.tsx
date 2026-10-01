import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CalendarDays, Check, FileText, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Note, Task } from '../types';
import { NOTE_MAX, PRIORITY_META, formatDate, validateNote } from '../utils/helpers';

interface TaskDetailsPanelProps {
  task: Task;
  onClose: () => void;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddNote: (taskId: string, content: string) => void;
  onUpdateNote: (taskId: string, noteId: string, content: string) => void;
  onDeleteNote: (task: Task, note: Note) => void;
}

/**
 * Right-hand drawer showing the selected task's details and its notes.
 * Notes can be added, edited, and deleted right here.
 */
export default function TaskDetailsPanel({
  task,
  onClose,
  onToggle,
  onEdit,
  onDelete,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: TaskDetailsPanelProps) {
  const [noteDraft, setNoteDraft] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteDraft, setEditingNoteDraft] = useState('');
  const [editNoteError, setEditNoteError] = useState<string | null>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close on Escape and lock background scroll while the drawer is open.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // When a dialog is stacked on top, that dialog owns Escape.
      if (document.querySelector('[role="dialog"]')) return;
      onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const priority = PRIORITY_META[task.priority];

  function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateNote(noteDraft);
    setNoteError(error);
    if (error) return;
    onAddNote(task.id, noteDraft);
    setNoteDraft('');
    setNoteError(null);
  }

  function startEditingNote(note: Note) {
    setEditingNoteId(note.id);
    setEditingNoteDraft(note.content);
    setEditNoteError(null);
  }

  function cancelEditingNote() {
    setEditingNoteId(null);
    setEditingNoteDraft('');
    setEditNoteError(null);
  }

  function handleUpdateNote(event: FormEvent<HTMLFormElement>, noteId: string) {
    event.preventDefault();
    const error = validateNote(editingNoteDraft);
    setEditNoteError(error);
    if (error) return;
    onUpdateNote(task.id, noteId, editingNoteDraft);
    cancelEditingNote();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-slide-up lg:w-[440px]"
        aria-label={`Details for ${task.title}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${priority.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} aria-hidden="true" />
              {priority.label} priority
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                task.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {task.completed ? 'Completed' : 'Active'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close task details"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">
          <h2
            className={`text-xl font-bold break-words ${
              task.completed ? 'text-slate-500 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h2>

          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Created {formatDate(task.createdAt)}
          </p>

          {task.description ? (
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
              {task.description}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-slate-500">No description provided.</p>
          )}

          {/* Task actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onToggle(task.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                task.completed
                  ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
              }`}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {task.completed ? 'Mark as active' : 'Mark as complete'}
            </button>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>

          {/* Notes */}
          <section className="mt-7" aria-labelledby="notes-heading">
            <h3 id="notes-heading" className="text-sm font-bold text-slate-900">
              Notes
              <span className="ml-1.5 font-normal text-slate-400">({task.notes.length})</span>
            </h3>

            {/* Add note form */}
            <form onSubmit={handleAddNote} noValidate className="mt-3">
              <label htmlFor="new-note-input" className="sr-only">
                Write a new note
              </label>
              <textarea
                id="new-note-input"
                value={noteDraft}
                onChange={(event) => {
                  setNoteDraft(event.target.value);
                  if (noteError) setNoteError(null);
                }}
                rows={2}
                maxLength={NOTE_MAX}
                placeholder="Write a note for this task..."
                aria-invalid={noteError ? 'true' : 'false'}
                aria-describedby={noteError ? 'new-note-error' : undefined}
                className={`w-full resize-y rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 ${
                  noteError
                    ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/30'
                    : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/30'
                }`}
              />
              {noteError && (
                <p id="new-note-error" role="alert" className="mt-1 text-xs font-medium text-rose-600">
                  {noteError}
                </p>
              )}
              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add note
              </button>
            </form>

            {/* Notes list */}
            {task.notes.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                <FileText className="mx-auto h-6 w-6 text-slate-300" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-slate-500">No notes yet</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Jot down ideas, links, or reminders for this task.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {task.notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
                  >
                    {editingNoteId === note.id ? (
                      <form onSubmit={(event) => handleUpdateNote(event, note.id)} noValidate>
                        <label htmlFor={`edit-note-${note.id}`} className="sr-only">
                          Edit note
                        </label>
                        <textarea
                          id={`edit-note-${note.id}`}
                          value={editingNoteDraft}
                          onChange={(event) => {
                            setEditingNoteDraft(event.target.value);
                            if (editNoteError) setEditNoteError(null);
                          }}
                          rows={3}
                          maxLength={NOTE_MAX}
                          aria-invalid={editNoteError ? 'true' : 'false'}
                          className={`w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 ${
                            editNoteError
                              ? 'border-rose-400 focus:ring-rose-500/30'
                              : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/30'
                          }`}
                        />
                        {editNoteError && (
                          <p role="alert" className="mt-1 text-xs font-medium text-rose-600">
                            {editNoteError}
                          </p>
                        )}
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditingNote}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                          >
                            Save note
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap text-slate-700">{note.content}</p>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500">
                            {note.updatedAt === note.createdAt
                              ? `Added ${formatDate(note.createdAt)}`
                              : `Edited ${formatDate(note.updatedAt)}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditingNote(note)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-indigo-600"
                              aria-label={`Edit note: ${note.content.slice(0, 30)}`}
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteNote(task, note)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-rose-600"
                              aria-label={`Delete note: ${note.content.slice(0, 30)}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}
