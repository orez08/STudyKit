import React, { useState, useEffect } from 'react';
import { Mail, Send, Eye, Edit, Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';

export const AdminEmailPage: React.FC = () => {
  const { showToast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientList, setRecipientList] = useState('All Active Students & Subscribers (1,240 recipients)');
  const [scheduledAt, setScheduledAt] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('studykit_email_draft');
    if (saved) {
      try {
        const { subject: s, body: b, recipients: r } = JSON.parse(saved);
        if (s) setSubject(s);
        if (b) setBody(b);
        if (r) setRecipientList(r);
      } catch (e) {
        // Ignore parse error
      }
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem('studykit_email_draft', JSON.stringify({ subject, body, recipients: recipientList }));
  }, [subject, body, recipientList]);

  useEffect(() => {
    const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const isFormValid = subject.trim().length > 0 && body.trim().length > 0 && recipientList.trim().length > 0;

  const handleSendMassEmail = async () => {
    if (!isFormValid) return;
    setSending(true);
    try {
      const response = await fetch('/api/mass-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          recipients: recipientList,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null
        }),
      });
      
      if (response.ok) {
        await addDoc(collection(db, 'broadcasts'), {
          subject,
          bodySnippet: body.slice(0, 100),
          recipients: recipientList,
          scheduledAt: scheduledAt || null,
          status: scheduledAt ? 'Scheduled' : 'Sent',
          createdAt: serverTimestamp(),
        });
        localStorage.removeItem('studykit_email_draft');
        setSubject('');
        setBody('');
        setRecipientList('All Active Students & Subscribers (1,240 recipients)');
        setScheduledAt('');
        showToast(
          scheduledAt ? 'Mass Email Scheduled' : 'Broadcast Email Sent',
          scheduledAt ? 'Mass email scheduled successfully.' : 'Mass email simulation triggered successfully.',
          'task',
          4000
        );
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-[#000000] text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin: Broadcast Mass Email</h1>
            <p className="text-sm text-neutral-400">Compose and broadcast announcements or study updates to users.</p>
          </div>
        </div>
        <button onClick={() => setPreviewMode(!previewMode)} className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-neutral-800 rounded-lg text-sm transition-colors">
          {previewMode ? <Edit className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
          {previewMode ? 'Edit Mode' : 'Preview Mode'}
        </button>
      </div>

      <div className="space-y-6 bg-[#0f0f10] border border-neutral-800/80 p-6 rounded-2xl shadow-xl">
        {/* Recipient List Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" /> Broadcast Email List / Target Audience *
          </label>
          <input
            type="text"
            placeholder="e.g. All Active Students, Premium Subscribers, or comma-separated emails"
            className="w-full p-3 bg-[#161618] border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
            value={recipientList}
            onChange={e => setRecipientList(e.target.value)}
          />
          {!recipientList.trim() && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Broadcast email list cannot be empty.
            </p>
          )}
        </div>

        {/* Subject Line Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400" /> Subject Line *
          </label>
          <input
            type="text"
            placeholder="Enter email subject..."
            className="w-full p-3 bg-[#161618] border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm font-medium"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          {!subject.trim() && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Subject line is required.
            </p>
          )}
        </div>

        {/* Schedule Optional */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Schedule Sending (Optional)
          </label>
          <input
            type="datetime-local"
            className="w-full p-3 bg-[#161618] border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
          />
        </div>

        {/* Email Body Editor / Preview */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Edit className="w-3.5 h-3.5 text-amber-400" /> Email Content / Body *
          </label>
          {previewMode ? (
            <div className="w-full p-5 bg-white text-neutral-900 rounded-xl min-h-[280px] max-h-[450px] overflow-auto shadow-inner border border-neutral-200 prose prose-sm">
              <div className="border-b pb-3 mb-3 text-xs text-neutral-500">
                <strong>To:</strong> {recipientList}<br />
                <strong>Subject:</strong> {subject || '(No Subject)'}
              </div>
              <div dangerouslySetInnerHTML={{ __html: body || '<p class="text-neutral-400 italic">No content provided.</p>' }} />
            </div>
          ) : (
            <textarea
              placeholder="Write your broadcast announcement here (HTML or plain text supported)..."
              className="w-full p-4 bg-[#161618] border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm min-h-[280px] font-mono leading-relaxed"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          )}
          {!body.trim() && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Email body content cannot be empty.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-neutral-400">
            {!isFormValid ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Please fill in the recipient list, subject, and body before sending.
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready to broadcast.
              </span>
            )}
          </div>
          <button
            onClick={handleSendMassEmail}
            disabled={!isFormValid || sending}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all ${
              !isFormValid || sending
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20'
            }`}
          >
            <Send className="w-4 h-4" />
            {sending ? 'Processing Broadcast...' : scheduledAt ? 'Schedule Broadcast' : 'Send to All Recipients'}
          </button>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-semibold tracking-tight">Broadcast History</h2>
        <div className="bg-[#0f0f10] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
          {history.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">No previous broadcasts found.</div>
          ) : (
            history.map(item => (
              <div key={item.id} className="p-4 border-b border-neutral-800/80 flex items-center justify-between hover:bg-[#141416] transition-colors">
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-white">{item.subject}</p>
                  <p className="text-xs text-neutral-400 flex items-center gap-2">
                    <span>Recipients: {item.recipients || 'All Users'}</span>
                    <span>•</span>
                    <span>{item.scheduledAt ? `Scheduled: ${new Date(item.scheduledAt).toLocaleString()}` : 'Sent immediately'}</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${
                  item.status === 'Sent'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {item.status === 'Sent' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
