'use client';

import { useState } from 'react';
import {
  MOCK_USERS,
  MOCK_COURSES,
  MOCK_COHORTS,
  MOCK_AGENT_CONFIGS,
  MOCK_MODERATION_ITEMS,
  MOCK_ANALYTICS,
  MOCK_INSTRUCTOR_PERFORMANCE,
  MOCK_AUDIT_LOG,
  MOCK_PROGRAMS,
} from '@/lib/mock-data';
import type {
  User, UserRole, Course, CourseStatus,
  AgentConfig, AgentId, AutonomyLevel, ModerationItem, ModerationAction,
  InstructorPerformance, Cohort,
} from '@/lib/types';

// ─── Icon helpers (inline SVGs — no icon lib, per design direction) ─────────

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 7a3 3 0 100-6 3 3 0 000 6zM1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1z" fill="currentColor" />
    <path d="M13 1a2.5 2.5 0 11-1.5 4.5M14.5 12c.5-.8.5-1.7.5-2 0-1.2-.8-2.6-2-3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconGradCap = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2L1 5.5l7 3.5 7-3.5L8 2z" fill="currentColor" />
    <path d="M3 7v4c0 1.1 2.2 2 5 2s5-.9 5-2V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M13 5.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 2h5a3 3 0 013 3v9H2V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M14 2H9a3 3 0 00-3 3v9h8V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="8" width="3" height="6" rx="1" fill="currentColor" />
    <rect x="6.5" y="4" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="12" y="1" width="3" height="13" rx="1" fill="currentColor" />
  </svg>
);

const IconBot = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="6" cy="9" r="1" fill="currentColor" />
    <circle cx="10" cy="9" r="1" fill="currentColor" />
    <path d="M8 5V2M6 2h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 1v9M5 7l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconFlag = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 1v14M3 2h9l-2 4 2 4H3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Nav items ───────────────────────────────────────────────────────────────

type Section =
  | 'users'
  | 'tutors'
  | 'courses'
  | 'analytics'
  | 'agents'
  | 'reports'
  | 'moderation';

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'users',      label: 'User management',    icon: <IconUsers /> },
  { id: 'tutors',     label: 'Tutor management',   icon: <IconGradCap /> },
  { id: 'courses',    label: 'Course approval',    icon: <IconBook /> },
  { id: 'analytics',  label: 'Analytics',          icon: <IconBarChart /> },
  { id: 'agents',     label: 'AI agents',          icon: <IconBot /> },
  { id: 'reports',    label: 'Reporting',          icon: <IconDownload /> },
  { id: 'moderation', label: 'Moderation queue',   icon: <IconFlag /> },
];

// ─── Shared small components ──────────────────────────────────────────────────

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: '1.8rem' }}>
      <p style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim)', margin: '0 0 .4rem' }}>
        {eyebrow}
      </p>
      <h2 style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-.03em', lineHeight: 1.05, margin: 0, color: 'var(--chalk)' }}>
        {title}
      </h2>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:     { label: 'active',     cls: 'pill-teal' },
    suspended:  { label: 'suspended',  cls: 'pill-amber' },
    draft:      { label: 'draft',      cls: 'pill-dim' },
    in_review:  { label: 'in review',  cls: 'pill-amber' },
    published:  { label: 'published',  cls: 'pill-teal' },
    rejected:   { label: 'rejected',   cls: 'pill-amber' },
    pending:    { label: 'pending',    cls: 'pill-amber' },
    resolved:   { label: 'resolved',   cls: 'pill-dim' },
    enabled:    { label: 'enabled',    cls: 'pill-teal' },
    disabled:   { label: 'disabled',   cls: 'pill-dim' },
    autonomous: { label: 'autonomous', cls: 'pill-teal' },
    suggest_only:{ label: 'suggest only', cls: 'pill-amber' },
  };
  const cfg = map[status] ?? { label: status, cls: 'pill-dim' };
  return <span className={`pill ${cfg.cls}`}>{cfg.label}</span>;
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid var(--line)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
        {children}
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '.7rem 1rem',
      textAlign: 'left',
      fontFamily: 'var(--font-ibm-plex-mono, monospace)',
      fontSize: '.62rem',
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      color: 'var(--dim)',
      borderBottom: '1px solid var(--line)',
      background: 'var(--ink-2)',
      fontWeight: 400,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  );
}

function Td({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  return (
    <td style={{
      padding: '.75rem 1rem',
      borderBottom: '1px solid var(--line)',
      color: warn ? 'var(--mark)' : 'var(--chalk)',
      verticalAlign: 'middle',
    }}>
      {children}
    </td>
  );
}

function Tr({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <tr style={{
      background: 'var(--ink-2)',
      transition: 'background .15s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-3)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-2)')}
    >
      {children}
    </tr>
  );
}

function ActionBtn({
  children,
  onClick,
  variant = 'ghost',
  id,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'ghost' | 'danger' | 'solid';
  id?: string;
}) {
  const cls = variant === 'danger' ? 'btn btn-sm btn-danger' : variant === 'solid' ? 'btn btn-sm btn-solid' : 'btn btn-sm';
  return (
    <button id={id} className={cls} onClick={onClick} style={{ marginRight: '.35rem' }}>
      {children}
    </button>
  );
}

function Modal({
  open, title, onClose, children,
}: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(16,20,28,.8)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      role="dialog" aria-modal="true" aria-label={title}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: '18px',
          padding: '2rem', width: '100%', maxWidth: '480px', position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
          <h3 style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 600, fontSize: '1.05rem', margin: 0, letterSpacing: '-.01em', color: 'var(--chalk)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: '1.1rem', cursor: 'pointer', padding: '.25rem', lineHeight: 1 }}
            aria-label="Close modal"
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '.4rem' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ id, value, onChange, placeholder, type = 'text' }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', background: 'var(--ink-3)', border: '1px solid var(--line)',
        borderRadius: '8px', color: 'var(--chalk)', fontFamily: 'var(--font-ibm-plex-sans, sans-serif)',
        fontSize: '.9rem', padding: '.6rem .8rem', outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}

function Select({ id, value, onChange, children }: {
  id: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', background: 'var(--ink-3)', border: '1px solid var(--line)',
        borderRadius: '8px', color: 'var(--chalk)', fontFamily: 'var(--font-ibm-plex-sans, sans-serif)',
        fontSize: '.9rem', padding: '.6rem .8rem', outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
      }}
    >
      {children}
    </select>
  );
}

function Textarea({ id, value, onChange, placeholder, rows = 3 }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', background: 'var(--ink-3)', border: '1px solid var(--line)',
        borderRadius: '8px', color: 'var(--chalk)', fontFamily: 'var(--font-ibm-plex-sans, sans-serif)',
        fontSize: '.9rem', padding: '.6rem .8rem', outline: 'none', boxSizing: 'border-box',
        resize: 'vertical',
      }}
    />
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 200,
      background: 'var(--ink-2)', border: '1px solid var(--signal)',
      borderRadius: '10px', padding: '.75rem 1rem',
      fontFamily: 'var(--font-ibm-plex-sans, sans-serif)', fontSize: '.88rem',
      color: 'var(--chalk)', display: 'flex', alignItems: 'center', gap: '.5rem',
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
    }}>
      <span style={{ color: 'var(--signal)', display: 'flex' }}><IconCheck /></span>
      {message}
      <button onClick={onClose} style={{ marginLeft: '.5rem', background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer' }}>✕</button>
    </div>
  );
}

// ─── §8.1 User Management ─────────────────────────────────────────────────────

function UserManagement() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [modal, setModal] = useState<'create' | 'suspend' | 'bulkinvite' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [toast, setToast] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' as UserRole });
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkRole, setBulkRole] = useState<UserRole>('student');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const filtered = users.filter(u => {
    const q = filter.toLowerCase();
    return (
      (roleFilter === 'all' || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  });

  const suspend = () => {
    if (!selectedUser || !suspensionReason.trim()) return;
    setUsers(prev => prev.map(u =>
      u.id === selectedUser.id
        ? { ...u, status: 'suspended', suspendedAt: new Date().toISOString(), suspendedBy: 'admin-1', suspensionReason }
        : u
    ));
    setModal(null);
    setSuspensionReason('');
    showToast(`${selectedUser.name} suspended. Session revoked.`);
  };

  const reinstate = (user: User) => {
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, status: 'active', suspendedAt: undefined, suspendedBy: undefined, suspensionReason: undefined } : u
    ));
    showToast(`${user.name} reinstated.`);
  };

  const createUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    const u: User = {
      id: `u-new-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      joinedAt: new Date().toISOString().slice(0, 10),
      cohortIds: [],
    };
    setUsers(prev => [u, ...prev]);
    setNewUser({ name: '', email: '', role: 'student' });
    setModal(null);
    showToast(`${u.name} created.`);
  };

  const bulkInvite = () => {
    const emails = bulkEmails.split(/[\n,]+/).map(e => e.trim()).filter(Boolean);
    const newUsers: User[] = emails.map((email, i) => ({
      id: `u-bulk-${Date.now()}-${i}`,
      name: email.split('@')[0],
      email,
      role: bulkRole,
      status: 'active',
      joinedAt: new Date().toISOString().slice(0, 10),
      cohortIds: [],
    }));
    setUsers(prev => [...newUsers, ...prev]);
    setBulkEmails('');
    setModal(null);
    showToast(`${newUsers.length} users invited.`);
  };

  return (
    <div>
      <SectionHeader eyebrow="§ 8.1" title="User management" />

      {/* toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1.2rem', alignItems: 'center' }}>
        <input
          id="user-search"
          placeholder="Search by name or email…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--chalk)', fontFamily: 'var(--font-ibm-plex-sans, sans-serif)', fontSize: '.9rem', padding: '.55rem .8rem', outline: 'none', width: '260px' }}
        />
        <select
          id="user-role-filter"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
          style={{ background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--chalk)', fontFamily: 'var(--font-ibm-plex-sans, sans-serif)', fontSize: '.9rem', padding: '.55rem .8rem', outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
          <ActionBtn id="btn-bulk-invite" onClick={() => setModal('bulkinvite')}>Bulk invite</ActionBtn>
          <ActionBtn id="btn-create-user" onClick={() => setModal('create')} variant="solid">Add user</ActionBtn>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Joined</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user, i) => (
            <Tr key={user.id} last={i === filtered.length - 1}>
              <Td>
                <div style={{ fontWeight: 500 }}>{user.name}</div>
                {user.githubUsername && (
                  <div style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.62rem', color: 'var(--dim)', letterSpacing: '.04em' }}>
                    @{user.githubUsername}
                  </div>
                )}
              </Td>
              <Td>{user.email}</Td>
              <Td><StatusPill status={user.role} /></Td>
              <Td><StatusPill status={user.status} /></Td>
              <Td>
                <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', color: 'var(--dim)' }}>
                  {user.joinedAt.slice(0, 10)}
                </span>
              </Td>
              <Td>
                {user.status === 'active' ? (
                  <ActionBtn
                    id={`btn-suspend-${user.id}`}
                    variant="danger"
                    onClick={() => { setSelectedUser(user); setModal('suspend'); }}
                  >
                    Suspend
                  </ActionBtn>
                ) : (
                  <ActionBtn id={`btn-reinstate-${user.id}`} onClick={() => reinstate(user)}>
                    Reinstate
                  </ActionBtn>
                )}
                <ActionBtn id={`btn-edit-role-${user.id}`} onClick={() => {
                  const newRole = user.role === 'student' ? 'instructor' : user.role === 'instructor' ? 'admin' : 'student';
                  setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                  showToast(`${user.name}'s role changed to ${newRole}. Takes effect on next request.`);
                }}>
                  Change role
                </ActionBtn>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <p style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.65rem', color: 'var(--dim)', marginTop: '.8rem', letterSpacing: '.04em' }}>
        {filtered.length} of {users.length} users
      </p>

      {/* Suspend modal */}
      <Modal open={modal === 'suspend'} title={`Suspend ${selectedUser?.name}`} onClose={() => setModal(null)}>
        <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginTop: 0 }}>
          Suspending immediately revokes their session. A suspended student cannot submit.
          {selectedUser?.cohortIds.length ? ` Any in-flight reviews will be reassigned.` : ''} This action is logged.
        </p>
        <FormRow label="Reason (required)">
          <Textarea id="suspension-reason" value={suspensionReason} onChange={setSuspensionReason} placeholder="e.g. Academic integrity violation" />
        </FormRow>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <ActionBtn onClick={() => setModal(null)}>Cancel</ActionBtn>
          <ActionBtn id="btn-confirm-suspend" variant="danger" onClick={suspend}>Confirm suspension</ActionBtn>
        </div>
      </Modal>

      {/* Create user modal */}
      <Modal open={modal === 'create'} title="Add user" onClose={() => setModal(null)}>
        <FormRow label="Full name">
          <Input id="new-user-name" value={newUser.name} onChange={v => setNewUser(p => ({ ...p, name: v }))} placeholder="Adaeze O." />
        </FormRow>
        <FormRow label="Email">
          <Input id="new-user-email" type="email" value={newUser.email} onChange={v => setNewUser(p => ({ ...p, email: v }))} placeholder="adaeze@mgs.io" />
        </FormRow>
        <FormRow label="Role">
          <Select id="new-user-role" value={newUser.role} onChange={v => setNewUser(p => ({ ...p, role: v as UserRole }))}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </Select>
        </FormRow>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <ActionBtn onClick={() => setModal(null)}>Cancel</ActionBtn>
          <ActionBtn id="btn-confirm-create" variant="solid" onClick={createUser}>Create user</ActionBtn>
        </div>
      </Modal>

      {/* Bulk invite modal */}
      <Modal open={modal === 'bulkinvite'} title="Bulk invite" onClose={() => setModal(null)}>
        <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginTop: 0 }}>
          Paste one email per line, or comma-separated. Each will receive an invite link scoped to their assigned cohort.
        </p>
        <FormRow label="Email addresses">
          <Textarea id="bulk-emails" value={bulkEmails} onChange={setBulkEmails} placeholder={"ada@mgs.io\nmarcus@mgs.io\npriya@mgs.io"} rows={5} />
        </FormRow>
        <FormRow label="Role">
          <Select id="bulk-role" value={bulkRole} onChange={v => setBulkRole(v as UserRole)}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </Select>
        </FormRow>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <ActionBtn onClick={() => setModal(null)}>Cancel</ActionBtn>
          <ActionBtn id="btn-confirm-bulk" variant="solid" onClick={bulkInvite}>Send invites</ActionBtn>
        </div>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// ─── §8.2 Tutor Management ────────────────────────────────────────────────────

function TutorManagement() {
  const [instructors, setInstructors] = useState<InstructorPerformance[]>(MOCK_INSTRUCTOR_PERFORMANCE);
  const [cohorts] = useState<Cohort[]>(MOCK_COHORTS);
  const [modal, setModal] = useState<'reassign' | null>(null);
  const [selected, setSelected] = useState<InstructorPerformance | null>(null);
  const [newCohortId, setNewCohortId] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const reassign = () => {
    if (!selected || !newCohortId) return;
    const cohort = cohorts.find(c => c.id === newCohortId);
    if (!cohort) return;
    setInstructors(prev => prev.map(i =>
      i.instructorId === selected.instructorId
        ? { ...i, assignedCohorts: [...i.assignedCohorts.filter(c => c.id !== newCohortId), { id: cohort.id, name: cohort.name }] }
        : i
    ));
    setModal(null);
    showToast(`${selected.instructorName} assigned to ${cohort.name}. Cohort history preserved.`);
  };

  return (
    <div>
      <SectionHeader eyebrow="§ 8.2" title="Tutor management" />

      <Table>
        <thead>
          <tr>
            <Th>Instructor</Th>
            <Th>Cohorts run</Th>
            <Th>Avg time to review</Th>
            <Th>Assigned cohorts</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {instructors.map(inst => (
            <Tr key={inst.instructorId}>
              <Td><span style={{ fontWeight: 500 }}>{inst.instructorName}</span></Td>
              <Td>
                <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.72rem' }}>
                  {inst.cohortsRun}
                </span>
              </Td>
              <Td>
                <span style={{
                  fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.72rem',
                  color: inst.avgTimeToReviewHours > 24 ? 'var(--mark)' : 'var(--signal)',
                }}>
                  {inst.avgTimeToReviewHours}h avg
                </span>
              </Td>
              <Td>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                  {inst.assignedCohorts.map(c => (
                    <span key={c.id} className="pill pill-dim">{c.name}</span>
                  ))}
                </div>
              </Td>
              <Td>
                <ActionBtn
                  id={`btn-reassign-${inst.instructorId}`}
                  onClick={() => { setSelected(inst); setNewCohortId(''); setModal('reassign'); }}
                >
                  Assign to cohort
                </ActionBtn>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Modal open={modal === 'reassign'} title={`Assign ${selected?.instructorName} to cohort`} onClose={() => setModal(null)}>
        <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginTop: 0 }}>
          Reassigning to a cohort preserves all existing cohort history for that cohort.
        </p>
        <FormRow label="Cohort">
          <Select id="reassign-cohort" value={newCohortId} onChange={setNewCohortId}>
            <option value="">Select cohort…</option>
            {cohorts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormRow>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <ActionBtn onClick={() => setModal(null)}>Cancel</ActionBtn>
          <ActionBtn id="btn-confirm-reassign" variant="solid" onClick={reassign}>Assign</ActionBtn>
        </div>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// ─── §8.3 Course Approval ────────────────────────────────────────────────────

function CourseApproval() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null);
  const [selected, setSelected] = useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const approve = () => {
    if (!selected) return;
    setCourses(prev => prev.map(c =>
      c.id === selected.id
        ? { ...c, status: 'published', reviewedAt: new Date().toISOString(), reviewedBy: 'admin-1', publishedAt: new Date().toISOString() }
        : c
    ));
    setModal(null);
    showToast(`"${selected.title}" published. Instructor notified.`);
  };

  const reject = () => {
    if (!selected || !rejectionReason.trim()) return;
    setCourses(prev => prev.map(c =>
      c.id === selected.id
        ? { ...c, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: 'admin-1', rejectionReason }
        : c
    ));
    setModal(null);
    setRejectionReason('');
    showToast(`"${selected.title}" rejected. Reason sent to ${selected.instructorName}.`);
  };

  const statusOrder: CourseStatus[] = ['in_review', 'draft', 'published', 'rejected'];
  const sorted = [...courses].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

  return (
    <div>
      <SectionHeader eyebrow="§ 8.3" title="Course approval" />
      <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginBottom: '1.5rem', marginTop: 0 }}>
        Courses in <span style={{ color: 'var(--mark)' }}>in review</span> are waiting on a decision. A course cannot reach Published without an approval record.
      </p>

      <Table>
        <thead>
          <tr>
            <Th>Course</Th>
            <Th>Program</Th>
            <Th>Instructor</Th>
            <Th>Status</Th>
            <Th>Submitted</Th>
            <Th>Lessons</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(course => (
            <Tr key={course.id}>
              <Td>
                <div style={{ fontWeight: 500 }}>{course.title}</div>
                {course.rejectionReason && (
                  <div style={{ fontSize: '.78rem', color: 'var(--mark)', marginTop: '.2rem', maxWidth: '260px' }}>
                    ↳ {course.rejectionReason}
                  </div>
                )}
              </Td>
              <Td>{course.programName}</Td>
              <Td>{course.instructorName}</Td>
              <Td><StatusPill status={course.status} /></Td>
              <Td>
                <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', color: 'var(--dim)' }}>
                  {course.submittedAt?.slice(0, 10) ?? '—'}
                </span>
              </Td>
              <Td>
                <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.72rem' }}>
                  {course.lessonCount}
                </span>
              </Td>
              <Td>
                {course.status === 'in_review' && (
                  <>
                    <ActionBtn id={`btn-approve-${course.id}`} variant="solid" onClick={() => { setSelected(course); setModal('approve'); }}>
                      Approve
                    </ActionBtn>
                    <ActionBtn id={`btn-reject-${course.id}`} variant="danger" onClick={() => { setSelected(course); setModal('reject'); }}>
                      Reject
                    </ActionBtn>
                  </>
                )}
                {course.status === 'rejected' && (
                  <ActionBtn id={`btn-rereview-${course.id}`} onClick={() => { setSelected(course); setModal('approve'); }}>
                    Approve anyway
                  </ActionBtn>
                )}
                {(course.status === 'published' || course.status === 'draft') && (
                  <span style={{ color: 'var(--dim)', fontSize: '.82rem' }}>—</span>
                )}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Modal open={modal === 'approve'} title={`Approve "${selected?.title}"?`} onClose={() => setModal(null)}>
        <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginTop: 0 }}>
          This will publish the course and make it visible to enrolled students. The approval will be recorded in the audit log.
        </p>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
          <ActionBtn onClick={() => setModal(null)}>Cancel</ActionBtn>
          <ActionBtn id="btn-confirm-approve" variant="solid" onClick={approve}>Publish course</ActionBtn>
        </div>
      </Modal>

      <Modal open={modal === 'reject'} title={`Reject "${selected?.title}"`} onClose={() => setModal(null)}>
        <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginTop: 0 }}>
          The instructor will see your reason. They can revise and resubmit.
        </p>
        <FormRow label="Rejection reason (required)">
          <Textarea id="rejection-reason" value={rejectionReason} onChange={setRejectionReason} placeholder="e.g. Lesson 3 references deprecated API. Please update before resubmitting." />
        </FormRow>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <ActionBtn onClick={() => setModal(null)}>Cancel</ActionBtn>
          <ActionBtn id="btn-confirm-reject" variant="danger" onClick={reject}>Send rejection</ActionBtn>
        </div>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// ─── §8.4 Platform Analytics ──────────────────────────────────────────────────

function Analytics() {
  const a = MOCK_ANALYTICS;

  // Simple bar chart (no external library — inline SVG)
  const maxRate = Math.max(...a.completionTrend.map(t => t.rate));

  return (
    <div>
      <SectionHeader eyebrow="§ 8.4" title="Platform analytics" />
      <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginBottom: '1.8rem', marginTop: 0 }}>
        Cross-cohort view. Every number here traces back to the part that owns it — this dashboard aggregates, it does not invent its own source of truth.
      </p>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Active cohorts',      value: a.activeCohorts,       unit: '',  highlight: false },
          { label: 'Total learners',       value: a.totalLearners,        unit: '',  highlight: false },
          { label: 'Avg completion',       value: `${a.avgCompletionRate}%`, unit: '', highlight: a.avgCompletionRate < 70 },
          { label: 'AI actions this week', value: a.aiActionsThisWeek,   unit: '',  highlight: false },
          { label: 'Login success rate',   value: `${a.loginSuccessRate}%`, unit: '', highlight: a.loginSuccessRate < 95 },
          { label: 'Uptime',               value: `${a.uptimePercent}%`, unit: '',  highlight: a.uptimePercent < 99 },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ padding: '1rem 1.2rem' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>
              {kpi.label}
            </p>
            <p style={{ margin: '.3rem 0 0', fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: '2rem', letterSpacing: '-.04em', color: kpi.highlight ? 'var(--mark)' : 'var(--chalk)' }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Completion trend */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 1rem', fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>
          Completion trend — Cohort 07, week by week
        </p>
        <div
          role="img"
          aria-label={`Bar chart showing completion rates by week: ${a.completionTrend.map(t => `${t.week}: ${t.rate}%`).join(', ')}`}
          style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem', height: '80px' }}
        >
          {a.completionTrend.map(t => (
            <div key={t.week} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem', flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.58rem', color: 'var(--dim)' }}>
                {t.rate}%
              </span>
              <div style={{
                width: '100%',
                height: `${(t.rate / maxRate) * 60}px`,
                background: t.rate === Math.min(...a.completionTrend.map(x => x.rate)) ? 'rgba(232,165,75,.6)' : 'rgba(127,209,193,.55)',
                borderRadius: '3px 3px 0 0',
                transition: 'height .3s ease',
              }} />
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.58rem', color: 'var(--dim)', letterSpacing: '.04em' }}>
                {t.week}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cohorts by program */}
      <div className="card">
        <p style={{ margin: '0 0 .8rem', fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>
          Cohorts by program
        </p>
        {a.cohortsByProgram.map((p: { programName: string; count: number }) => (
          <div key={p.programName} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
            <span style={{ flex: 1, fontSize: '.9rem' }}>{p.programName}</span>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.72rem', color: 'var(--signal)' }}>
              {p.count} cohort{p.count !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── §8.5 AI Agent Configuration ─────────────────────────────────────────────

function AgentConfiguration() {
  const [agents, setAgents] = useState<AgentConfig[]>(MOCK_AGENT_CONFIGS);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const toggle = (agentId: AgentId) => {
    setAgents(prev => prev.map(a =>
      a.agentId === agentId
        ? { ...a, enabled: !a.enabled, updatedAt: new Date().toISOString() }
        : a
    ));
    const agent = agents.find(a => a.agentId === agentId);
    showToast(`${agent?.name} ${agent?.enabled ? 'disabled' : 'enabled'}. Takes effect on next request.`);
  };

  const setAutonomy = (agentId: AgentId, level: AutonomyLevel) => {
    setAgents(prev => prev.map(a =>
      a.agentId === agentId ? { ...a, autonomyLevel: level, updatedAt: new Date().toISOString() } : a
    ));
    showToast(`Manager autonomy set to "${level}". Visible to instructors on their dashboard.`);
  };

  return (
    <div>
      <SectionHeader eyebrow="§ 8.5" title="AI agent configuration" />
      <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginBottom: '1.5rem', marginTop: 0 }}>
        Toggling an agent off takes effect within one request cycle — no redeploy needed.
        The manager's autonomy level is visible on the instructor's dashboard for each course.
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {agents.map(agent => (
          <div
            key={agent.agentId}
            className="card"
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', padding: '1rem 1.3rem' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.25rem' }}>
                <span style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 600, fontSize: '.98rem', letterSpacing: '-.01em' }}>
                  {agent.name}
                </span>
                <StatusPill status={agent.enabled ? 'enabled' : 'disabled'} />
              </div>
              <p style={{ margin: 0, color: 'var(--dim)', fontSize: '.85rem' }}>{agent.description}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
              {agent.agentId === 'manager' && (
                <div style={{ display: 'flex', gap: '.3rem' }}>
                  <button
                    id="btn-autonomy-suggest"
                    className={`btn btn-sm ${agent.autonomyLevel === 'suggest_only' ? 'btn-solid' : ''}`}
                    onClick={() => setAutonomy('manager', 'suggest_only')}
                    style={agent.autonomyLevel === 'suggest_only' ? { background: 'rgba(127,209,193,.2)', color: 'var(--signal)', borderColor: 'var(--signal)' } : {}}
                  >
                    Suggest only
                  </button>
                  <button
                    id="btn-autonomy-auto"
                    className={`btn btn-sm ${agent.autonomyLevel === 'autonomous' ? 'btn-solid' : ''}`}
                    onClick={() => setAutonomy('manager', 'autonomous')}
                    style={agent.autonomyLevel === 'autonomous' ? { background: 'rgba(127,209,193,.2)', color: 'var(--signal)', borderColor: 'var(--signal)' } : {}}
                  >
                    Autonomous
                  </button>
                </div>
              )}

              {/* Toggle switch */}
              <button
                id={`btn-toggle-agent-${agent.agentId}`}
                onClick={() => toggle(agent.agentId)}
                aria-pressed={agent.enabled}
                aria-label={`${agent.enabled ? 'Disable' : 'Enable'} ${agent.name}`}
                style={{
                  width: '44px', height: '24px', borderRadius: '999px',
                  background: agent.enabled ? 'var(--signal)' : 'var(--ink-3)',
                  border: `1px solid ${agent.enabled ? 'var(--signal)' : 'var(--line)'}`,
                  cursor: 'pointer', position: 'relative', transition: 'background .2s, border-color .2s',
                  flexShrink: 0, padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: agent.enabled ? '23px' : '3px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: agent.enabled ? 'var(--ink)' : 'var(--dim)',
                  transition: 'left .2s', display: 'block',
                }} />
              </button>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid var(--line)', marginTop: '.2rem', paddingTop: '.4rem', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.6rem', color: '#5c6577', letterSpacing: '.04em' }}>
                last updated {new Date(agent.updatedAt).toLocaleDateString('en-GB')} by {agent.updatedBy}
              </span>
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// ─── §8.6 Reporting ───────────────────────────────────────────────────────────

function Reporting() {
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [scope, setScope] = useState<'cohort' | 'program'>('cohort');
  const [cohortId, setCohortId] = useState('c07');
  const [programId, setProgramId] = useState('p1');
  const [toast, setToast] = useState('');

  const download = () => {
    const ts = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '-');
    const name = scope === 'cohort'
      ? MOCK_COHORTS.find(c => c.id === cohortId)?.name ?? cohortId
      : MOCK_PROGRAMS.find(p => p.id === programId)?.name ?? programId;

    const csvRows: string[][] = [
      ['Name', 'Email', 'Role', 'Status', 'Cohort', 'Composite Score', 'Task Completion %', 'Certificate Issued'],
      ...MOCK_USERS.filter((u: User) => u.role === 'student' && u.cohortIds.includes(cohortId)).map((u: User): string[] => [
        u.name, u.email, u.role, u.status, cohortId,
        String(Math.floor(Math.random() * 80 + 20)),
        String(Math.floor(Math.random() * 100)),
        u.status === 'active' ? 'No (in progress)' : 'No (suspended)',
      ]),
    ];
    const csvContent = csvRows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');

    if (format === 'csv') {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `corridor-report-${name.replace(/\s+/g, '-').toLowerCase()}-${ts}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } else {
      // PDF — generate a simple text-based PDF via print
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<html><head><title>Corridor Report — ${name}</title><style>body{font-family:monospace;padding:2rem;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #ccc;padding:.4rem .6rem;font-size:12px;}</style></head><body>`);
      win.document.write(`<h2>Corridor — ${name}</h2>`);
      win.document.write(`<p>Generated: ${new Date().toLocaleString()}</p>`);
      win.document.write(`<table><thead><tr>${csvRows[0].map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`);
      csvRows.slice(1).forEach(row => {
        win.document.write(`<tr>${row.map(v => `<td>${v}</td>`).join('')}</tr>`);
      });
      win.document.write('</tbody></table></body></html>');
      win.document.close();
      win.print();
    }

    setToast(`${format.toUpperCase()} report downloaded. Reflects platform state at ${new Date().toLocaleTimeString()}.`);
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <div>
      <SectionHeader eyebrow="§ 8.6" title="Reporting" />
      <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginBottom: '1.8rem', marginTop: 0 }}>
        Exports are downloadable immediately — not emailed. Each export reflects the platform state at the moment it was requested.
      </p>

      <div className="card" style={{ maxWidth: '480px' }}>
        <FormRow label="Scope">
          <Select id="report-scope" value={scope} onChange={v => setScope(v as 'cohort' | 'program')}>
            <option value="cohort">Single cohort</option>
            <option value="program">Full program</option>
          </Select>
        </FormRow>

        {scope === 'cohort' ? (
          <FormRow label="Cohort">
            <Select id="report-cohort" value={cohortId} onChange={setCohortId}>
              {MOCK_COHORTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormRow>
        ) : (
          <FormRow label="Program">
            <Select id="report-program" value={programId} onChange={setProgramId}>
              {MOCK_PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FormRow>
        )}

        <FormRow label="Format">
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {(['csv', 'pdf'] as const).map(f => (
              <button
                key={f}
                id={`btn-format-${f}`}
                className="btn btn-sm"
                onClick={() => setFormat(f)}
                style={format === f ? { background: 'rgba(127,209,193,.15)', borderColor: 'var(--signal)', color: 'var(--signal)' } : {}}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </FormRow>

        <div style={{ marginTop: '.5rem' }}>
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.06em', color: 'var(--dim)', marginBottom: '.8rem', marginTop: 0 }}>
            Report includes: roster · per-learner contribution summary · task completion · certificates issued
          </p>
          <button id="btn-download-report" className="btn btn-solid" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }} onClick={download}>
            <IconDownload />
            Download {format.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Audit log preview */}
      <div style={{ marginTop: '2rem' }}>
        <p style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '.8rem' }}>
          Recent audit log
        </p>
        <Table>
          <thead>
            <tr>
              <Th>Action</Th>
              <Th>By</Th>
              <Th>Timestamp</Th>
              <Th>Detail</Th>
            </tr>
          </thead>
          <tbody>
            {MOCK_AUDIT_LOG.map(entry => (
              <Tr key={entry.id}>
                <Td>
                  <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.04em', color: 'var(--signal)' }}>
                    {entry.action}
                  </span>
                </Td>
                <Td>{entry.performedByName}</Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.65rem', color: 'var(--dim)' }}>
                    {new Date(entry.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </Td>
                <Td>{entry.detail}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// ─── §8.7 Content Moderation Queue ────────────────────────────────────────────

function ModerationQueue() {
  const [items, setItems] = useState<ModerationItem[]>(MOCK_MODERATION_ITEMS);
  const [modal, setModal] = useState<'action' | null>(null);
  const [selected, setSelected] = useState<ModerationItem | null>(null);
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const pendingItems = items.filter(i => i.status === 'pending');
  const resolvedItems = items.filter(i => i.status === 'resolved');

  const resolve = (action: ModerationAction) => {
    if (!selected) return;
    setItems(prev => prev.map(i =>
      i.id === selected.id
        ? { ...i, status: 'resolved', resolution: action, resolvedAt: new Date().toISOString(), resolvedBy: 'admin-1' }
        : i
    ));
    setModal(null);
    const msgs: Record<ModerationAction, string> = {
      dismiss: 'Item dismissed. No action taken. Decision logged.',
      remove: 'Content removed. Decision logged.',
      warn: 'User warned. Decision logged.',
      escalate: 'Escalated to suspension review. Decision logged.',
    };
    showToast(msgs[action]);
  };

  const ActionButtons = ({ item }: { item: ModerationItem }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
      {(['dismiss', 'remove', 'warn', 'escalate'] as ModerationAction[]).map(a => (
        <button
          key={a}
          id={`btn-mod-${a}-${item.id}`}
          className={`btn btn-sm ${a === 'escalate' ? 'btn-danger' : ''}`}
          style={a === 'remove' ? { borderColor: 'rgba(232,165,75,.4)', color: 'var(--mark)' } : {}}
          onClick={() => { setSelected(item); setPendingAction(a); setModal('action'); }}
        >
          {a.charAt(0).toUpperCase() + a.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <SectionHeader eyebrow="§ 8.7" title="Content moderation queue" />
      <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginBottom: '1.5rem', marginTop: 0 }}>
        Nothing auto-resolves. Every flagged item requires a human decision before it leaves this queue. Every decision is logged.
      </p>

      {/* Pending */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>
            Pending
          </p>
          {pendingItems.length > 0 && (
            <span className="pill pill-amber">{pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {pendingItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--dim)', fontSize: '.9rem' }}>
            Queue is clear.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingItems.map(item => (
              <div key={item.id} className="card">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'flex-start', marginBottom: '.8rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.3rem' }}>
                      <StatusPill status="pending" />
                      <span className="pill pill-dim">{item.type === 'discussion_post' ? 'discussion post' : 'ai-flagged submission'}</span>
                    </div>
                    <p style={{ margin: '0 0 .3rem', fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.62rem', letterSpacing: '.06em', color: 'var(--dim)', textTransform: 'uppercase' }}>
                      {item.contextLabel}
                    </p>
                    <p style={{ margin: '0 0 .6rem', fontWeight: 500, fontSize: '.88rem' }}>
                      {item.authorName} — <span style={{ color: 'var(--dim)', fontWeight: 400 }}>{item.flagReason}</span>
                    </p>
                    <blockquote style={{
                      margin: 0, padding: '.6rem .9rem',
                      background: 'var(--ink-3)', borderLeft: '3px solid var(--line)',
                      borderRadius: '0 6px 6px 0', fontSize: '.85rem', color: 'var(--dim)',
                      fontStyle: 'italic',
                    }}>
                      "{item.content}"
                    </blockquote>
                  </div>
                  <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.62rem', color: '#5c6577', flexShrink: 0 }}>
                    {new Date(item.flaggedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '.75rem' }}>
                  <ActionButtons item={item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolvedItems.length > 0 && (
        <div>
          <p style={{ margin: '0 0 .8rem', fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>
            Resolved
          </p>
          <Table>
            <thead>
              <tr>
                <Th>Item</Th>
                <Th>Author</Th>
                <Th>Decision</Th>
                <Th>Resolved by</Th>
                <Th>Resolved at</Th>
              </tr>
            </thead>
            <tbody>
              {resolvedItems.map(item => (
                <Tr key={item.id}>
                  <Td>
                    <div style={{ fontSize: '.82rem', color: 'var(--dim)' }}>{item.contextLabel}</div>
                    <div style={{ fontSize: '.8rem', color: '#5c6577', marginTop: '.15rem', fontStyle: 'italic' }}>
                      "{item.content.slice(0, 60)}{item.content.length > 60 ? '…' : ''}"
                    </div>
                  </Td>
                  <Td>{item.authorName}</Td>
                  <Td><StatusPill status={item.resolution ?? 'resolved'} /></Td>
                  <Td>{item.resolvedBy}</Td>
                  <Td>
                    <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.65rem', color: 'var(--dim)' }}>
                      {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Confirm modal */}
      <Modal
        open={modal === 'action'}
        title={`Confirm: ${pendingAction} item`}
        onClose={() => setModal(null)}
      >
        <p style={{ color: 'var(--dim)', fontSize: '.9rem', marginTop: 0 }}>
          {pendingAction === 'dismiss' && 'Mark this item as dismissed. No content will be removed. This decision is logged.'}
          {pendingAction === 'remove' && 'Remove this content from the platform. This decision is logged and cannot be auto-reversed.'}
          {pendingAction === 'warn' && 'Send a formal warning to the author. This decision is logged.'}
          {pendingAction === 'escalate' && 'Escalate this item to suspension review. The case will be flagged for the next admin action cycle.'}
        </p>
        <blockquote style={{
          margin: '0 0 1.2rem', padding: '.6rem .9rem',
          background: 'var(--ink-3)', borderLeft: '3px solid var(--mark)',
          borderRadius: '0 6px 6px 0', fontSize: '.85rem', color: 'var(--dim)', fontStyle: 'italic',
        }}>
          "{selected?.content}"
        </blockquote>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
          <ActionBtn onClick={() => setModal(null)}>Cancel</ActionBtn>
          <ActionBtn
            id={`btn-confirm-mod-${pendingAction}`}
            variant={pendingAction === 'escalate' || pendingAction === 'remove' ? 'danger' : 'solid'}
            onClick={() => pendingAction && resolve(pendingAction)}
          >
            Confirm {pendingAction}
          </ActionBtn>
        </div>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// ─── Admin sidebar nav ────────────────────────────────────────────────────────

function AdminNav({ active, onSelect }: { active: Section; onSelect: (s: Section) => void }) {
  return (
    <nav aria-label="Admin sections" style={{ position: 'sticky', top: '5rem' }}>
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.2rem' }}>
          <span aria-hidden="true" style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--chalk)' }}>
            Corridor
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--signal)' }}>
          Admin panel
        </span>
      </div>

      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          id={`nav-${item.id}`}
          onClick={() => onSelect(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '.7rem',
            width: '100%', textAlign: 'left', padding: '.6rem .8rem',
            background: active === item.id ? 'var(--ink-3)' : 'transparent',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            color: active === item.id ? 'var(--chalk)' : 'var(--dim)',
            fontFamily: 'var(--font-ibm-plex-sans, sans-serif)',
            fontSize: '.9rem', marginBottom: '.2rem',
            transition: 'background .15s ease, color .15s ease',
            outline: 'none',
          }}
          onMouseEnter={e => {
            if (active !== item.id) {
              e.currentTarget.style.background = 'rgba(42,51,70,.6)';
              e.currentTarget.style.color = 'var(--chalk)';
            }
          }}
          onMouseLeave={e => {
            if (active !== item.id) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--dim)';
            }
          }}
        >
          <span style={{ color: active === item.id ? 'var(--signal)' : 'currentColor', display: 'flex', flexShrink: 0 }}>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}

      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span className="pulse" aria-hidden="true" />
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.62rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--signal)' }}>
            Manager
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--dim)', lineHeight: 1.5 }}>
          Reopened <strong style={{ color: 'var(--chalk)' }}>3 tasks</strong> merged without review. Flagged <strong style={{ color: 'var(--mark)' }}>Team 4</strong> — 82% of commits from one member.
        </p>
        <span style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.6rem', color: '#5c6577' }}>06:12</span>
      </div>
    </nav>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [section, setSection] = useState<Section>('users');

  const SECTION_MAP: Record<Section, React.ReactNode> = {
    users:      <UserManagement />,
    tutors:     <TutorManagement />,
    courses:    <CourseApproval />,
    analytics:  <Analytics />,
    agents:     <AgentConfiguration />,
    reports:    <Reporting />,
    moderation: <ModerationQueue />,
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      {/* Fixed top bar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        padding: '.5rem 1.5rem',
        background: 'rgba(22,28,39,.85)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'var(--font-ibm-plex-mono, monospace)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>
          MGS Web3 Creatives · Corridor
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span style={{ fontFamily: 'var(--font-ibm-plex-sans, sans-serif)', fontSize: '.85rem', color: 'var(--dim)' }}>
            Admin User
          </span>
          <span className="pill pill-teal">admin</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', paddingTop: '3.5rem' }}>
        {/* Sidebar */}
        <aside style={{
          padding: '1.5rem 1rem',
          borderRight: '1px solid var(--line)',
          background: 'var(--ink-2)',
        }}>
          <AdminNav active={section} onSelect={setSection} />
        </aside>

        {/* Main content */}
        <main style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', overflowX: 'hidden' }}>
          <div style={{ maxWidth: '900px' }}>
            {SECTION_MAP[section]}
          </div>
        </main>
      </div>
    </div>
  );
}
