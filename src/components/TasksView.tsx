import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { Task } from '../types/database.types';
import {
  CheckSquare,
  Square,
  Clock,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  User
} from 'lucide-react';

type TaskFilterTab = 'Today' | 'This Week' | 'Overdue' | 'Completed' | 'All';

export const TasksView: React.FC = () => {
  const {
    tasks,
    leads,
    saveTask,
    deleteTask,
    refreshAll
  } = useValithOS();

  const [activeTab, setActiveTab] = useState<TaskFilterTab>('Today');
  const [showAddTask, setShowAddTask] = useState(false);

  // Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<any>('Follow-up');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<any>('Medium');
  const [taskLeadId, setTaskLeadId] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (d: Date) => {
    const start = getStartOfWeek(d);
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'Completed') return t.status === 'Done';
    if (t.status === 'Done') return false; // Hide completed in other tabs

    if (activeTab === 'Today') {
      return t.due_date === todayStr;
    }

    if (activeTab === 'This Week') {
      if (!t.due_date) return false;
      const tDate = new Date(t.due_date);
      const start = getStartOfWeek(new Date());
      const end = getEndOfWeek(new Date());
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return tDate >= start && tDate <= end;
    }

    if (activeTab === 'Overdue') {
      return t.due_date && t.due_date < todayStr;
    }

    return true; // All tab
  });

  // Mark Done Toggle
  const handleToggleDone = async (task: Task) => {
    const nextStatus = task.status === 'Done' ? 'Open' : 'Done';
    await saveTask({
      ...task,
      status: nextStatus as any
    });
    refreshAll();
  };

  // Snooze Action
  const handleSnooze = async (task: Task, days: number | 'monday') => {
    let nextDate = new Date();
    if (days === 'monday') {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() + (day === 0 ? 1 : 8 - day); // Next monday
      nextDate.setDate(diff);
    } else {
      nextDate.setDate(nextDate.getDate() + days);
    }

    const nextDateStr = nextDate.toISOString().split('T')[0];
    await saveTask({
      ...task,
      due_date: nextDateStr,
      status: 'Open' // Reset completed status if snoozing
    });
    refreshAll();
  };

  // Delete task
  const handleDelete = async (id: string) => {
    if (confirm('Delete this task permanently?')) {
      await deleteTask(id);
      refreshAll();
    }
  };

  // Submit Task
  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const lead = leads.find((l) => l.id === taskLeadId);

    await saveTask({
      lead_id: taskLeadId || undefined,
      organization_id: lead?.organization_id || undefined,
      title: taskTitle,
      description: taskDesc,
      task_type: taskType,
      due_date: taskDueDate || todayStr,
      priority: taskPriority,
      status: 'Open'
    });

    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
    setShowAddTask(false);
    refreshAll();
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Follow-up & Task Center</h1>
          <p className="text-xs text-typography-muted">Stay compliant on outreach loops and deliverables</p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
        >
          <Plus size={14} className="text-aurum" />
          <span>New Task</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-border space-x-6 text-xs uppercase tracking-wider font-bold">
        {(['Today', 'This Week', 'Overdue', 'Completed', 'All'] as TaskFilterTab[]).map((tab) => {
          const count = tasks.filter((t) => {
            if (tab === 'Completed') return t.status === 'Done';
            if (t.status === 'Done') return false;
            if (tab === 'Today') return t.due_date === todayStr;
            if (tab === 'Overdue') return t.due_date && t.due_date < todayStr;
            if (tab === 'This Week') {
              if (!t.due_date) return false;
              const tDate = new Date(t.due_date);
              const start = getStartOfWeek(new Date());
              const end = getEndOfWeek(new Date());
              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);
              return tDate >= start && tDate <= end;
            }
            return true;
          }).length;

          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 border-b-2 font-sans transition-all flex items-center space-x-2 ${
                isActive ? 'border-aurum text-typography' : 'border-transparent text-typography-muted'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-aurum-glow text-aurum-dark' : 'bg-background-soft text-typography-light'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TASK LIST */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card-premium py-12 text-center text-typography-light text-xs uppercase tracking-wider">
            All caught up! No tasks in this list.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const lead = leads.find((l) => l.id === task.lead_id);
            const isOverdue = task.due_date && task.due_date < todayStr && task.status !== 'Done';

            return (
              <div
                key={task.id}
                className="bg-background-card border border-border hover:border-aurum/40 p-4 rounded-lg shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                {/* Title & checkbox */}
                <div className="flex items-start space-x-3.5">
                  <button onClick={() => handleToggleDone(task)} className="text-typography-light hover:text-aurum mt-0.5">
                    {task.status === 'Done' ? (
                      <CheckSquare size={18} className="text-aurum" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                  <div className="space-y-1">
                    <span className={`text-xs font-bold leading-snug block ${task.status === 'Done' ? 'line-through text-typography-light' : 'text-typography'}`}>
                      {task.title}
                    </span>
                    {task.description && (
                      <p className="text-[10px] text-typography-muted leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1.5 items-center">
                      <span className="text-[8px] tracking-wider font-bold uppercase bg-background-soft text-typography-muted px-1.5 py-0.5 rounded">
                        {task.task_type}
                      </span>
                      {lead && (
                        <div className="flex items-center space-x-1 text-[9px] text-aurum font-semibold">
                          <User size={10} />
                          <span>{lead.lead_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Due Date & Snooze options */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {/* Due Date Indicator */}
                  <div className="flex items-center space-x-1.5">
                    {isOverdue ? (
                      <AlertTriangle size={13} className="text-red-500 animate-pulse" />
                    ) : (
                      <Calendar size={13} className="text-typography-light" />
                    )}
                    <span className={`font-semibold ${isOverdue ? 'text-red-500 font-bold' : 'text-typography-muted'}`}>
                      {task.due_date || 'No Date'}
                    </span>
                  </div>

                  {/* Snooze shortcuts */}
                  {task.status !== 'Done' && (
                    <div className="flex items-center bg-background-soft p-1 rounded space-x-1 text-[9px] uppercase tracking-wider font-bold text-typography-muted">
                      <span className="px-1.5 py-0.5 select-none">Snooze:</span>
                      <button
                        onClick={() => handleSnooze(task, 1)}
                        className="px-2 py-0.5 hover:bg-background-card rounded hover:text-aurum transition-all"
                      >
                        +1d
                      </button>
                      <button
                        onClick={() => handleSnooze(task, 3)}
                        className="px-2 py-0.5 hover:bg-background-card rounded hover:text-aurum transition-all"
                      >
                        +3d
                      </button>
                      <button
                        onClick={() => handleSnooze(task, 'monday')}
                        className="px-2 py-0.5 hover:bg-background-card rounded hover:text-aurum transition-all"
                      >
                        Mon
                      </button>
                    </div>
                  )}

                  {/* Delete Option */}
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 text-typography-light hover:text-red-500 rounded transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW TASK MODAL */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button onClick={() => setShowAddTask(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Add Task Record</h2>
            <form onSubmit={handleAddTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule MARCEM sync"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Link to Lead</label>
                  <select
                    value={taskLeadId}
                    onChange={(e) => setTaskLeadId(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="">-- No Link --</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.lead_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Follow-up">Follow-up</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Payment">Payment</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Admin">Admin</option>
                    <option value="Content">Content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Task Context</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Additional context on instructions..."
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
