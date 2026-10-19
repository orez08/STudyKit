import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Trash2,
  Check,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  Layers,
  FileText,
  HelpCircle,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PlannerTask } from '../types';
import { apiClient } from '../lib/apiClient';

export const PlannerPage: React.FC = () => {
  const { plannerTasks, addPlannerTask, togglePlannerTask, deletePlannerTask } = useStudy();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'generator'>('daily');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Manual Task creation
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Biology');
  const [taskDueDate, setTaskDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [taskDuration, setTaskDuration] = useState(45);
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskAction, setTaskAction] = useState<
    'Summarise' | 'Revise Flashcards' | 'Practice Test' | 'Deep Reading'
  >('Deep Reading');

  // AI Timetable Generator
  const [genSubjects, setGenSubjects] = useState('Biology, Macroeconomics, Chemistry');
  const [genExams, setGenExams] = useState('Biology Midterm: Nov 15, Economics Finals: Dec 2');
  const [genHours, setGenHours] = useState(2);
  const [genDays, setGenDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [genGoals, setGenGoals] = useState('Master all definitions and score 85%+ on mock exams');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planSummary, setPlanSummary] = useState<string | null>(null);

  const subjects = Array.from(new Set(plannerTasks.map((t) => t.subject)));

  const filteredTasks = plannerTasks.filter((t) => {
    if (filterSubject !== 'all' && t.subject !== filterSubject) return false;
    return true;
  });

  const completedCount = plannerTasks.filter((t) => t.completed).length;
  const progressPercent =
    plannerTasks.length > 0 ? Math.round((completedCount / plannerTasks.length) * 100) : 0;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: PlannerTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      subject: taskSubject,
      dueDate: taskDueDate,
      durationMinutes: taskDuration,
      priority: taskPriority,
      actionType: taskAction,
      completed: false,
    };

    await addPlannerTask(newTask);
    setTaskTitle('');
    setShowTaskModal(false);
  };

  const handleGenerateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const data = await apiClient.post<{ success: boolean; data: { tasks: any[]; summary?: any } }>('/api/ai/planner', {
        subjects: genSubjects.split(',').map((s) => s.trim()),
        examDates: genExams.split(',').map((e) => e.trim()),
        dailyHours: genHours,
        preferredDays: genDays,
        goals: genGoals,
      });
      if (data.data?.tasks) {
        for (const t of data.data.tasks) {
          await addPlannerTask({
            id: `task-ai-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: t.title,
            subject: t.subject,
            dueDate: t.dueDate || new Date().toISOString().split('T')[0],
            durationMinutes: t.durationMinutes || 45,
            priority: t.priority || 'Medium',
            actionType: t.actionType || 'Deep Reading',
            tips: t.tips,
            completed: false,
          });
        }
        setPlanSummary(data.data.summary);
        setActiveTab('daily');
      }
    } catch (err: any) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Structured Revision Schedule</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Study Planner</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Organise deadlines, exams, and daily revision sessions for maximum consistency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className="px-3.5 py-2 bg-[#262626] hover:bg-[#303030] text-neutral-200 text-xs font-semibold rounded-xl border border-[#3A3A3A] flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F2C230]" />
            <span>AI Revision Generator</span>
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2 bg-[#F2C230] hover:bg-[#e0b127] text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2B2B2B]">
          <span className="text-[11px] text-neutral-400 block mb-1">Total Tasks Planned</span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            {plannerTasks.length}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2B2B2B]">
          <span className="text-[11px] text-neutral-400 block mb-1">Tasks Completed</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {completedCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2B2B2B]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-neutral-400">Completion Rate</span>
            <span className="text-xs font-mono font-bold text-[#F2C230]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#F2C230] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* VIEW: AI TIMETABLE GENERATOR */}
      {activeTab === 'generator' && (
        <div className="bg-[#1C1C1C] border border-[#2B2B2B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F2C230]" />
              <span>AI Personalized Revision Schedule Generator</span>
            </h2>
            <button
              onClick={() => setActiveTab('daily')}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Back to Task List
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Your Current Subjects (comma separated)
              </label>
              <input
                type="text"
                value={genSubjects}
                onChange={(e) => setGenSubjects(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Upcoming Exams / Target Dates
              </label>
              <input
                type="text"
                value={genExams}
                onChange={(e) => setGenExams(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Daily Study Time (Hours)
              </label>
              <select
                value={genHours}
                onChange={(e) => setGenHours(Number(e.target.value))}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value={1}>1 Hour per day</option>
                <option value={2}>2 Hours per day (Balanced)</option>
                <option value={3}>3 Hours per day</option>
                <option value={4}>4 Hours per day (Intensive)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Study Goal or Target Outcome
              </label>
              <input
                type="text"
                value={genGoals}
                onChange={(e) => setGenGoals(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateAIPlan}
              disabled={isGeneratingPlan}
              className="px-6 py-2.5 bg-[#F2C230] hover:bg-[#e0b127] text-black font-bold text-xs rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isGeneratingPlan ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isGeneratingPlan ? 'Synthesizing Schedule...' : 'Generate Schedule'}</span>
            </button>
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#1C1C1C] rounded-lg border border-[#2B2B2B]">
          <button
            onClick={() => setFilterSubject('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              filterSubject === 'all'
                ? 'bg-[#F2C230] text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filterSubject === sub
                  ? 'bg-[#F2C230] text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* TASK LIST */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  task.completed
                    ? 'bg-[#181818] border-[#262626] text-neutral-400'
                    : 'bg-[#1E1E1E] border-[#2E2E2E] hover:border-[#F2C230]/40 text-white'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => togglePlannerTask(task.id)}
                    className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                      task.completed
                        ? 'bg-[#F2C230] border-[#F2C230] text-black'
                        : 'border-neutral-500 hover:border-[#F2C230]'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        task.completed ? 'line-through text-neutral-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400">
                      <span className="font-semibold text-[#F2C230]">{task.subject}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {task.durationMinutes} mins
                      </span>
                      <span>·</span>
                      <span>Due: {task.dueDate}</span>
                      <span>·</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                          task.priority === 'High'
                            ? 'bg-red-950/60 text-red-300 border border-red-800'
                            : 'bg-[#292929] text-neutral-300'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>
                    {task.tips && (
                      <p className="text-[11px] text-neutral-400 italic pt-1">{task.tips}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deletePlannerTask(task.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-[#282828] rounded transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center rounded-xl bg-[#1C1C1C] text-neutral-400">
            No study tasks planned under this category. Add a task above or generate a revision
            schedule with AI.
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Add Study Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs text-neutral-300 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Revise Chapter 4 Calvin Cycle enzymes"
                  className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    placeholder="e.g. Biology"
                    className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2 text-xs text-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F2C230] text-black text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
