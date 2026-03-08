import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button, Textarea, Input, Select, Modal, Badge, SearchBar, EmptyState, SectionHeader, Avatar } from '../../components/ui';

const CATEGORIES = ['maintenance', 'event', 'policy', 'safety', 'general'];
const CAT_COLOR = { maintenance: 'warn', event: 'primary', policy: 'info', safety: 'danger', general: 'default' };

function timeAgo(dt) {
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(dt).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export default function Communication() {
  const { user } = useAuth();
  const { announcements, forum, dispatch, toast } = useApp();
  const [activeTab, setActiveTab] = useState('announcements');
  const [search, setSearch] = useState('');
  const [annModal, setAnnModal] = useState(false);
  const [postModal, setPostModal] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', body: '', category: 'general', priority: 'medium' });
  const [postForm, setPostForm] = useState({ title: '', body: '', tags: '' });
  const [replyText, setReplyText] = useState({});
  const [expandedPost, setExpandedPost] = useState(null);

  const setAnn = (k) => (e) => setAnnForm(f => ({ ...f, [k]: e.target.value }));
  const setPost = (k) => (e) => setPostForm(f => ({ ...f, [k]: e.target.value }));

  const filteredAnn = announcements.filter(a =>
    search ? a.title.toLowerCase().includes(search.toLowerCase()) : true
  ).sort((a, b) => b.pinned - a.pinned);

  const filteredForum = forum.filter(p =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  const handleAddAnn = () => {
    if (!annForm.title || !annForm.body) return;
    dispatch({ type: 'ADD_ANNOUNCEMENT', payload: { id: `an${Date.now()}`, ...annForm, postedBy: user.name, postedAt: new Date().toISOString(), pinned: false, views: 0 } });
    toast('Announcement posted');
    setAnnModal(false);
    setAnnForm({ title: '', body: '', category: 'general', priority: 'medium' });
  };

  const handleAddPost = () => {
    if (!postForm.title || !postForm.body) return;
    dispatch({
      type: 'ADD_POST',
      payload: {
        id: `fp${Date.now()}`, title: postForm.title, body: postForm.body,
        postedBy: user.name, postedByUnit: user.unit, postedAt: new Date().toISOString(),
        likes: 0, replies: [],
        tags: postForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
    });
    toast('Post created');
    setPostModal(false);
    setPostForm({ title: '', body: '', tags: '' });
  };

  const handleReply = (postId) => {
    const text = replyText[postId];
    if (!text?.trim()) return;
    dispatch({
      type: 'ADD_REPLY',
      payload: { postId, reply: { id: `r${Date.now()}`, text, by: user.name, unit: user.unit, at: new Date().toISOString() } }
    });
    setReplyText(r => ({ ...r, [postId]: '' }));
    toast('Reply posted');
  };

  const handlePin = (a) => {
    dispatch({ type: 'UPDATE_ANNOUNCEMENT', payload: { id: a.id, pinned: !a.pinned } });
    toast(a.pinned ? 'Unpinned' : 'Announcement pinned');
  };

  const handleDelete = (a) => {
    dispatch({ type: 'DELETE_ANNOUNCEMENT', payload: a.id });
    toast('Announcement deleted');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionHeader
        title="Communication"
        subtitle="Announcements, community forum, and society events"
        actions={
          <div className="flex gap-2">
            {user.role === 'management' && activeTab === 'announcements' && (
              <Button onClick={() => setAnnModal(true)} size="sm" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>
                New Announcement
              </Button>
            )}
            {activeTab === 'forum' && (
              <Button onClick={() => setPostModal(true)} size="sm" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>
                New Post
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-3 border-b border-bg-border">
        {[
          { id: 'announcements', label: '📢 Announcements', count: announcements.length },
          { id: 'forum', label: '💬 Forum', count: forum.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-display font-semibold border-b-2 transition-all -mb-px ${activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-accent-muted text-accent' : 'bg-bg-card text-ink-faint'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder={`Search ${activeTab}...`} />

      {/* Announcements */}
      {activeTab === 'announcements' && (
        <div className="flex flex-col gap-4">
          {filteredAnn.length === 0 ? (
            <EmptyState
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/></svg>}
              title="No announcements"
              subtitle="Management will post updates here"
            />
          ) : (
            filteredAnn.map(a => (
              <div key={a.id} className={`bg-bg-card border rounded-xl p-5 transition-colors ${a.pinned ? 'border-warn/30' : 'border-bg-border'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.pinned && <span className="text-warn text-sm">📌</span>}
                      <Badge variant={CAT_COLOR[a.category] || 'default'} size="xs">{a.category}</Badge>
                      {a.priority === 'high' && <Badge variant="danger" size="xs">High Priority</Badge>}
                    </div>
                    <h3 className="font-display font-bold text-base text-ink mt-2">{a.title}</h3>
                    <p className="text-sm text-ink-muted mt-2 leading-relaxed">{a.body}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-ink-faint">
                      <span>{a.postedBy}</span>
                      <span>·</span>
                      <span>{timeAgo(a.postedAt)}</span>
                      <span>·</span>
                      <span>{a.views} views</span>
                    </div>
                  </div>
                  {user.role === 'management' && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handlePin(a)} className={`p-2 rounded-lg text-xs transition-colors ${a.pinned ? 'bg-warn/10 text-warn' : 'text-ink-faint hover:text-warn hover:bg-warn/10'}`} title={a.pinned ? 'Unpin' : 'Pin'}>
                        📌
                      </button>
                      <button onClick={() => handleDelete(a)} className="p-2 rounded-lg text-ink-faint hover:text-danger hover:bg-danger/10 transition-colors" title="Delete">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Forum */}
      {activeTab === 'forum' && (
        <div className="flex flex-col gap-4">
          {filteredForum.length === 0 ? (
            <EmptyState
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              title="No forum posts"
              subtitle="Start a community discussion"
              action={<Button size="sm" onClick={() => setPostModal(true)}>Create Post</Button>}
            />
          ) : (
            filteredForum.map(p => (
              <div key={p.id} className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={p.postedBy} size="sm" color="primary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-ink">{p.postedBy}</p>
                        <span className="text-ink-faint text-xs">{p.postedByUnit}</span>
                        <span className="text-ink-faint text-xs">·</span>
                        <span className="text-xs text-ink-faint">{timeAgo(p.postedAt)}</span>
                      </div>
                      <h3 className="font-display font-semibold text-sm text-ink mt-1.5">{p.title}</h3>
                      <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">{p.body}</p>
                      {p.tags?.length > 0 && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {p.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-ink-faint bg-bg-surface border border-bg-border px-2 py-0.5 rounded-full">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-bg-border">
                    <button onClick={() => dispatch({ type: 'TOGGLE_LIKE', payload: p.id })} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                      {p.likes}
                    </button>
                    <button onClick={() => setExpandedPost(expandedPost === p.id ? null : p.id)} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {p.replies.length} {p.replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {expandedPost === p.id && (
                  <div className="border-t border-bg-border bg-bg-surface">
                    {p.replies.map(r => (
                      <div key={r.id} className="flex items-start gap-3 px-5 py-3 border-b border-bg-border/50 last:border-0">
                        <Avatar name={r.by} size="xs" color="primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-ink">{r.by}</span>
                            <span className="text-[10px] text-ink-faint">{r.unit}</span>
                            <span className="text-[10px] text-ink-faint">{timeAgo(r.at)}</span>
                          </div>
                          <p className="text-xs text-ink-muted mt-0.5">{r.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 px-5 py-3">
                      <Avatar name={user.name} size="xs" />
                      <input
                        value={replyText[p.id] || ''}
                        onChange={e => setReplyText(r => ({ ...r, [p.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply(p.id)}
                        placeholder="Write a reply..."
                        className="flex-1 bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-xs text-ink placeholder-ink-faint outline-none focus:border-accent/50"
                      />
                      <Button size="xs" onClick={() => handleReply(p.id)}>Reply</Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Announcement Modal */}
      <Modal open={annModal} onClose={() => setAnnModal(false)} title="Post Announcement">
        <div className="flex flex-col gap-4">
          <Input label="Title" value={annForm.title} onChange={setAnn('title')} placeholder="Brief, descriptive title" />
          <Textarea label="Content" value={annForm.body} onChange={setAnn('body')} placeholder="Detailed announcement..." rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={annForm.category} onChange={setAnn('category')}>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>
            <Select label="Priority" value={annForm.priority} onChange={setAnn('priority')}>
              {['low', 'medium', 'high'].map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </Select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setAnnModal(false)}>Cancel</Button>
            <Button onClick={handleAddAnn}>Post Announcement</Button>
          </div>
        </div>
      </Modal>

      {/* New Post Modal */}
      <Modal open={postModal} onClose={() => setPostModal(false)} title="Create Forum Post">
        <div className="flex flex-col gap-4">
          <Input label="Title" value={postForm.title} onChange={setPost('title')} placeholder="What's on your mind?" />
          <Textarea label="Details" value={postForm.body} onChange={setPost('body')} placeholder="Share more context..." rows={3} />
          <Input label="Tags (comma-separated)" value={postForm.tags} onChange={setPost('tags')} placeholder="safety, event, recommendation" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setPostModal(false)}>Cancel</Button>
            <Button onClick={handleAddPost}>Post</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
