import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trophy } from 'lucide-react';

import { User, X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  currentStreak: number;
}

interface UserProfile {
  displayName: string;
  totalDocuments: number;
  totalSummaries: number;
  totalQuizzes: number;
  createdAt?: string;
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'publicStats'), orderBy('currentStreak', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as LeaderboardEntry[];
        setEntries(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleUserClick = async (uid: string) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            setSelectedUser(userSnap.data() as UserProfile);
        }
    } catch(err) {
        console.error('Error fetching profile:', err);
    }
  }

  return (
    <>
      <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Top 5 Streaks</h3>
        </div>
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <div key={entry.uid} className="flex items-center justify-between p-2 rounded-lg bg-[#141414]">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 rounded p-1 transition" onClick={() => handleUserClick(entry.uid)}>
                  <span className={`font-mono text-xs ${idx === 0 ? 'text-amber-400' : 'text-neutral-400'}`}>{idx + 1}.</span>
                  <span className="text-xs text-white">{entry.displayName}</span>
              </div>
              <span className="text-xs text-amber-500 font-bold">{entry.currentStreak} Days</span>
            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
            <div className="bg-[#0A0A0A] border border-[#1C1C1C] p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><User />{selectedUser.displayName}</h3>
                    <X className="cursor-pointer text-neutral-500 hover:text-white" onClick={() => setSelectedUser(null)} />
                </div>
                <div className="text-sm text-neutral-300 space-y-2">
                    <p>Total Tasks Completed: {selectedUser.totalDocuments + selectedUser.totalSummaries + selectedUser.totalQuizzes}</p>
                    <p>Joined Date: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
