import React, { useState, useEffect } from 'react';
import { Mail, Send, Eye, Edit, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
// @ts-ignore
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const AdminEmailPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('studykit_email_draft');
    if (saved) {
      const { subject: s, body: b } = JSON.parse(saved);
      setSubject(s);
      setBody(b);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem('studykit_email_draft', JSON.stringify({ subject, body }));
  }, [subject, body]);

  useEffect(() => {
    const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSendMassEmail = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/mass-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null }),
      });
      
      if (response.ok) {
        await addDoc(collection(db, 'broadcasts'), {
          subject,
          scheduledAt: scheduledAt || null,
          status: scheduledAt ? 'Scheduled' : 'Sent',
          createdAt: serverTimestamp(),
        });
        localStorage.removeItem('studykit_email_draft'); // Clear draft on send
        setSubject('');
        setBody('');
        setScheduledAt('');
        alert(scheduledAt ? 'Mass email scheduled successfully.' : 'Mass email simulation triggered.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-[#000000] text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin: Send/Schedule Mass Email</h1>
        <button onClick={() => setPreviewMode(!previewMode)} className="flex items-center gap-2 px-3 py-1 bg-[#1A1A1A] rounded text-sm hover:bg-[#222]">
          {previewMode ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>
      
      <input type="text" placeholder="Subject" className="w-full p-3 bg-[#1A1A1A] rounded" value={subject} onChange={e => setSubject(e.target.value)} />
      <div className="space-y-1">
        <label className="text-xs text-neutral-400">Schedule sending (Optional)</label>
        <input type="datetime-local" className="w-full p-3 bg-[#1A1A1A] rounded" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
      </div>
      
      {previewMode ? (
        <div className="w-full p-4 bg-white text-black rounded h-96 overflow-auto" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <div className="h-96">
          <ReactQuill theme="snow" value={body} onChange={setBody} className="h-80 bg-white text-black rounded" />
        </div>
      )}

      <button onClick={handleSendMassEmail} disabled={sending} className="px-4 py-2 bg-blue-600 rounded flex items-center gap-2 disabled:bg-gray-600">
        <Send className="w-4 h-4" /> {sending ? 'Processing...' : (scheduledAt ? 'Schedule Broadcast' : 'Send to All Users')}
      </button>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Broadcast History</h2>
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
          {history.map(item => (
            <div key={item.id} className="p-4 border-b border-[#222] flex items-center justify-between">
              <div>
                <p className="font-semibold">{item.subject}</p>
                <p className="text-xs text-neutral-400">{item.scheduledAt ? `Scheduled: ${new Date(item.scheduledAt).toLocaleString()}` : 'Sent immediately'}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${item.status === 'Sent' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                {item.status === 'Sent' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
