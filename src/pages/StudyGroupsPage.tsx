import React, { useState } from 'react';
import {
  Users,
  Plus,
  Share2,
  Lock,
  Unlock,
  CheckCircle2,
  BookOpen,
  FileText,
  HelpCircle,
  Layers,
  ArrowRight,
  UserPlus,
  Shield,
  Trash2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StudyGroupItem, SharedStudyItem } from '../types';

export const StudyGroupsPage: React.FC = () => {
  const { user, summaries, quizzes, flashcardDecks } = useStudy();

  const [groups, setGroups] = useState<StudyGroupItem[]>(() => {
    const saved = localStorage.getItem('studykit_study_groups');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'group-1',
        name: 'Molecular Biology Honors Squad',
        description: 'Collaborative revision notes, cellular bioenergetics summaries, and mock exam practice.',
        subject: 'Biology',
        inviteCode: 'BIO-2026',
        createdBy: user?.uid || 'user-demo',
        members: [
          { uid: user?.uid || 'user-demo', displayName: user?.displayName || 'Student', email: user?.email || 'student@studykit.edu', role: 'creator', canEdit: true, joinedAt: new Date().toISOString() },
          { uid: 'member-2', displayName: 'Dr. Sarah Jenkins', email: 's.jenkins@university.edu', role: 'collaborator', canEdit: true, joinedAt: new Date().toISOString() },
          { uid: 'member-3', displayName: 'Alex Rivera', email: 'arivera@student.edu', role: 'viewer', canEdit: false, joinedAt: new Date().toISOString() },
        ],
        sharedItems: [
          { id: 'sh-1', type: 'summary', title: 'Cellular Bioenergetics & Photosynthesis Master Revision Notes', data: summaries[0] || {}, sharedBy: 'Dr. Sarah Jenkins', sharedAt: new Date().toISOString() },
          { id: 'sh-2', type: 'quiz', title: 'Photosynthesis Advanced Assessment', data: quizzes[0] || {}, sharedBy: user?.displayName || 'Student', sharedAt: new Date().toISOString() },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('General Studies');

  // Join Code State
  const [joinCode, setJoinCode] = useState('');

  // Share Item State
  const [shareItemType, setShareItemType] = useState<'summary' | 'quiz' | 'flashcard_deck'>('summary');
  const [selectedItemId, setSelectedItemId] = useState('');

  const saveGroups = (updated: StudyGroupItem[]) => {
    setGroups(updated);
    localStorage.setItem('studykit_study_groups', JSON.stringify(updated));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: StudyGroupItem = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      description: newGroupDesc,
      subject: newGroupSubject,
      inviteCode: `SK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdBy: user?.uid || 'user-demo',
      members: [
        {
          uid: user?.uid || 'user-demo',
          displayName: user?.displayName || 'Student',
          email: user?.email || 'student@studykit.edu',
          role: 'creator',
          canEdit: true,
          joinedAt: new Date().toISOString(),
        },
      ],
      sharedItems: [],
      createdAt: new Date().toISOString(),
    };

    saveGroups([newGroup, ...groups]);
    setActiveGroupId(newGroup.id);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setMessage('Study group created successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const target = groups.find((g) => g.inviteCode.toUpperCase() === joinCode.trim().toUpperCase());
    if (!target) {
      setMessage('Invalid invite code. Please check with your study group leader.');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (target.members.some((m) => m.uid === (user?.uid || 'user-demo'))) {
      setMessage('You are already a member of this study group.');
      setTimeout(() => setMessage(null), 3000);
      setShowJoinModal(false);
      return;
    }

    const updatedMembers = [
      ...target.members,
      {
        uid: user?.uid || 'user-demo',
        displayName: user?.displayName || 'Student',
        email: user?.email || 'student@studykit.edu',
        role: 'collaborator' as const,
        canEdit: false, // Default to view-only until creator grants edit
        joinedAt: new Date().toISOString(),
      },
    ];

    const updatedGroups = groups.map((g) => (g.id === target.id ? { ...g, members: updatedMembers } : g));
    saveGroups(updatedGroups);
    setActiveGroupId(target.id);
    setShowJoinModal(false);
    setJoinCode('');
    setMessage(`Successfully joined ${target.name}!`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleTogglePermission = (groupId: string, memberUid: string, canEdit: boolean) => {
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        const updatedMembers = g.members.map((m) => (m.uid === memberUid ? { ...m, canEdit, role: canEdit ? ('collaborator' as const) : ('viewer' as const) } : m));
        return { ...g, members: updatedMembers };
      }
      return g;
    });
    saveGroups(updated);
    setMessage('Member permission updated successfully.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleShareItem = (e: React.FormEvent) => {
    e.preventDefault();
    const group = groups.find((g) => g.id === activeGroupId);
    if (!group) return;

    let title = '';
    let itemData: any = null;

    if (shareItemType === 'summary') {
      const sum = summaries.find((s) => s.id === selectedItemId);
      if (!sum) return;
      title = sum.title;
      itemData = sum;
    } else if (shareItemType === 'quiz') {
      const qz = quizzes.find((q) => q.id === selectedItemId);
      if (!qz) return;
      title = qz.title;
      itemData = qz;
    } else {
      const dk = flashcardDecks.find((d) => d.id === selectedItemId);
      if (!dk) return;
      title = dk.title;
      itemData = dk;
    }

    const newItem: SharedStudyItem = {
      id: `item-${Date.now()}`,
      type: shareItemType,
      title,
      data: itemData,
      sharedBy: user?.displayName || 'Student',
      sharedAt: new Date().toISOString(),
    };

    const updated = groups.map((g) => (g.id === group.id ? { ...g, sharedItems: [newItem, ...g.sharedItems] } : g));
    saveGroups(updated);
    setShowShareModal(false);
    setMessage('Item shared with study group successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const isCreator = activeGroup?.createdBy === (user?.uid || 'user-demo');
  const currentMember = activeGroup?.members.find((m) => m.uid === (user?.uid || 'user-demo'));
  const userCanEdit = isCreator || currentMember?.canEdit;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in bg-[#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1C1C1C]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-1 font-['Clash_Display']">
            <Users className="w-4 h-4 text-[#FDE047]" />
            <span>Collaborative Learning</span>
          </div>
          <h1 className="text-3xl font-semibold text-white font-['Clash_Display']">Study Groups & Shared Hub</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Create academic groups, share revision summaries, quizzes, and flashcards with role permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2.5 bg-[#141414] hover:bg-[#1C1C1C] text-white border border-[#262626] font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-[#D97706]" />
            <span>Join Group</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-[#D97706]/20 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Group</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Group Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGroupId(g.id)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeGroupId === g.id
                ? 'bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white border-transparent shadow-md'
                : 'bg-[#0A0A0A] border-[#1C1C1C] text-neutral-400 hover:text-white'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {activeGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content: Shared Items */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
                <div>
                  <h2 className="text-xl font-semibold text-white font-['Clash_Display']">{activeGroup.name}</h2>
                  <p className="text-xs text-neutral-400 mt-1">{activeGroup.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono px-3 py-1 bg-[#141414] border border-[#262626] rounded-lg text-[#FDE047]">
                    Invite Code: {activeGroup.inviteCode}
                  </span>
                  {userCanEdit && (
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-3.5 py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Study Material</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-[#D97706] font-semibold font-['Clash_Display']">
                  Shared Summaries, Quizzes & Decks ({activeGroup.sharedItems.length})
                </h3>

                {activeGroup.sharedItems.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 text-xs">
                    No study materials shared in this group yet. Click 'Share Study Material' above to contribute!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeGroup.sharedItems.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl bg-[#050505] border border-[#1C1C1C] hover:border-[#D97706]/40 transition-all space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#141414] text-[#FDE047] uppercase tracking-wider border border-[#262626]">
                              {item.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-neutral-500">By {item.sharedBy}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-white font-['Clash_Display']">{item.title}</h4>
                        </div>
                        <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-xs text-neutral-400">
                          <span>Shared {new Date(item.sharedAt).toLocaleDateString()}</span>
                          <span className="text-[#D97706] font-medium flex items-center gap-1">
                            <span>Access Active</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Members & Permissions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white font-['Clash_Display'] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D97706]" />
                  <span>Group Members ({activeGroup.members.length})</span>
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400">
                {isCreator ? 'You are the group creator. You can toggle edit permissions for members below.' : 'Members with collaborative permissions can contribute study materials.'}
              </p>

              <div className="space-y-3 pt-2">
                {activeGroup.members.map((m) => (
                  <div key={m.uid} className="p-3 rounded-xl bg-[#050505] border border-[#1C1C1C] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">{m.displayName}</span>
                      <span className="text-[10px] text-neutral-500 block">{m.email}</span>
                      <span className="text-[9px] text-[#FDE047] uppercase font-mono mt-0.5 block">{m.role}</span>
                    </div>

                    {isCreator && m.role !== 'creator' ? (
                      <button
                        onClick={() => handleTogglePermission(activeGroup.id, m.uid, !m.canEdit)}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          m.canEdit ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-[#141414] border-[#262626] text-neutral-400'
                        }`}
                      >
                        {m.canEdit ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-neutral-400" />}
                        <span>{m.canEdit ? 'Can Edit' : 'View Only'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {m.canEdit ? 'Collaborator' : 'Viewer'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white font-['Clash_Display']">Create Study Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Organic Chemistry Study Circle"
                  className="w-full bg-[#050505] border border-[#222222] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newGroupSubject}
                  onChange={(e) => setNewGroupSubject(e.target.value)}
                  placeholder="e.g. Chemistry"
                  className="w-full bg-[#050505] border border-[#222222] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="What is the focus of this study group?"
                  className="w-full bg-[#050505] border border-[#222222] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#141414] text-neutral-300 text-xs font-semibold rounded-lg hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white font-['Clash_Display']">Join Study Group</h3>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Invite Code</label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. BIO-2026 or SK-AB34X2"
                  className="w-full bg-[#050505] border border-[#222222] rounded-lg p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 bg-[#141414] text-neutral-300 text-xs font-semibold rounded-lg hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Material Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white font-['Clash_Display']">Share Study Material</h3>
            <form onSubmit={handleShareItem} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Material Type</label>
                <select
                  value={shareItemType}
                  onChange={(e) => {
                    setShareItemType(e.target.value as any);
                    setSelectedItemId('');
                  }}
                  className="w-full bg-[#050505] border border-[#222222] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D97706]"
                >
                  <option value="summary">Summary Notes</option>
                  <option value="quiz">Interactive Quiz</option>
                  <option value="flashcard_deck">Flashcard Deck</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Select Item from Library</label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-[#050505] border border-[#222222] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D97706]"
                >
                  <option value="">-- Choose item to share --</option>
                  {shareItemType === 'summary' &&
                    summaries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  {shareItemType === 'quiz' &&
                    quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  {shareItemType === 'flashcard_deck' &&
                    flashcardDecks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-[#141414] text-neutral-300 text-xs font-semibold rounded-lg hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Share to Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
