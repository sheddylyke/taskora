import { useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Priority, Task, TaskDraft, TaskFormErrors } from '../types';
import { PRIORITY_META, TASK_DESCRIPTION_MAX, TASK_TITLE_MAX, validateTaskForm } from '../utils/helpers';
import Modal from './Modal';

interface TaskFormModalProps {
  /** Pass a task to edit it, or `null`/`undefined` to create a new task. */
  task: Task | null;
  onSubmit: (draft: TaskDraft) => void;
  onCancel: () => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

/** Create or edit a task with client-side validation. */
export default function TaskFormModal({ task, onSubmit, onCancel }: TaskFormModalProps) {
  const isEditing = task !== null;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  const titleId = 'task-form-title';
  const titleErrorId = 'task-form-title-error';
  const descriptionErrorId = 'task-form-description-error';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft: TaskDraft = { title, description, priority };
    const validationErrors = validateTaskForm(draft);

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.title) document.getElementById('task-title-input')?.focus();
      return;
    }

    onSubmit({ ...draft, title: title.trim(), description: description.trim() });
  }

  return (
    <Modal onClose={onCancel} titleId={titleId} panelClassName="max-w-lg" initialFocusRef={titleInputRef}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit task' : 'Create a new task'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Update the details of your task.' : 'What would you like to get done?'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close task form"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Title */}
          <div>
            <label htmlFor="task-title-input" className="mb-1.5 block text-sm font-medium text-slate-700">
              Title <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="task-title-input"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              maxLength={TASK_TITLE_MAX}
              placeholder="e.g. Finish the HNG stage 1 submission"
              aria-required="true"
              aria-invalid={errors.title ? 'true' : 'false'}
              aria-describedby={errors.title ? titleErrorId : undefined}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 ${
                errors.title
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/30'
              }`}
            />
            <div className="mt-1 flex items-start justify-between gap-3">
              {errors.title ? (
                <p id={titleErrorId} role="alert" className="text-xs font-medium text-rose-600">
                  {errors.title}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs tabular-nums text-slate-500">
                {title.length}/{TASK_TITLE_MAX}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description-input"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description{' '}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="task-description-input"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              maxLength={TASK_DESCRIPTION_MAX}
              rows={3}
              placeholder="Add more details about this task..."
              aria-invalid={errors.description ? 'true' : 'false'}
              aria-describedby={errors.description ? descriptionErrorId : undefined}
              className={`w-full resize-y rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 ${
                errors.description
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/30'
              }`}
            />
            <div className="mt-1 flex items-start justify-between gap-3">
              {errors.description ? (
                <p id={descriptionErrorId} role="alert" className="text-xs font-medium text-rose-600">
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs tabular-nums text-slate-500">
                {description.length}/{TASK_DESCRIPTION_MAX}
              </span>
            </div>
          </div>

          {/* Priority */}
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-slate-700">Priority</legend>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((level) => {
                const meta = PRIORITY_META[level];
                const isSelected = priority === level;
                return (
                  <label
                    key={level}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-600 has-[:focus-visible]:ring-offset-2 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="task-priority"
                      value={level}
                      checked={isSelected}
                      onChange={() => setPriority(level)}
                      className="sr-only"
                    />
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                    {meta.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition-colors hover:bg-indigo-500 active:bg-indigo-700"
          >
            {isEditing ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
