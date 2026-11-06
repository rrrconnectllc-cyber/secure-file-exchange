'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { readSession } from '@/lib/auth';
import type { TeamMember } from '@/lib/types';
import { Alert, Badge, Button, Input, Select } from '@/components';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/Table';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

export function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<TeamMember[]>('/api/v1/team');
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentEmail(readSession()?.user.email ?? null);
    void load();
  }, [load]);

  const sendInvite = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setInviting(true);
    try {
      const result = await api<{ message?: string; memberId?: string }>('/api/v1/team/invite', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
      const link = result.memberId ? `${window.location.origin}/accept-invite?memberId=${result.memberId}` : null;
      setInviteLink(link);
      setNotice(link ? `${result.message || `Invite recorded for ${email}.`} No email is sent. Share the link below.` : result.message || `Invite sent to ${email}.`);
      setEmail('');
      setRole('member');
      setInviteOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the invite');
    } finally {
      setInviting(false);
    }
  };

  const changeRole = async (member: TeamMember, nextRole: string) => {
    setError(null);
    try {
      await api(`/api/v1/team/${member.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      });
      setMembers((current) => current.map((item) => (item.id === member.id ? { ...item, role: nextRole } : item)));
      setNotice(`${member.name} is now ${nextRole}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the role');
    }
  };

  const removeMember = async () => {
    if (!pendingRemove) return;
    setRemoving(true);
    setError(null);
    try {
      await api(`/api/v1/team/${pendingRemove.id}`, { method: 'DELETE' });
      setNotice(`${pendingRemove.name} was removed.`);
      setPendingRemove(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this member');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="sfx-title text-3xl">Team & client access ({loading ? '…' : members.length})</h1>
          <p className="sfx-muted mt-2">People at the firm, and invitations for anyone who still needs to join.</p>
        </div>
        <Button onClick={() => setInviteOpen((open) => !open)}>Invite Member</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {notice && (
        <Alert variant="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {inviteLink && (
        <div className="sfx-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-all font-mono text-xs text-navy">{inviteLink}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(inviteLink);
              setNotice('Invitation link copied.');
            }}
          >
            Copy link
          </Button>
        </div>
      )}

      {inviteOpen && (
        <form
          className="sfx-panel grid gap-4 p-5 md:grid-cols-[1fr_180px_auto] md:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            void sendInvite();
          }}
        >
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="person@firm.com"
            required
          />
          <Select
            label="Role"
            name="role"
            value={role}
            options={roleOptions}
            onChange={(event) => setRole(event.target.value)}
          />
          <Button type="submit" isLoading={inviting}>
            Send Invite
          </Button>
        </form>
      )}

      {loading ? (
        <Spinner label="Loading team" />
      ) : members.length === 0 ? (
        <EmptyState
          title="No teammates yet"
          description="Invite an admin or a member. They will need an account before they can sign in."
          action={<Button onClick={() => setInviteOpen(true)}>Invite Member</Button>}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Joined</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => {
              const isSelf = member.email === currentEmail;
              const isOwner = member.role === 'owner';
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-navy">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {isOwner ? (
                      <Badge>Owner</Badge>
                    ) : (
                      <select
                        aria-label={`Role for ${member.name}`}
                        className="form-input py-1.5"
                        value={member.role}
                        onChange={(event) => void changeRole(member, event.target.value)}
                      >
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </TableCell>
                  <TableCell>{member.joinedDate}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'pending' ? 'warning' : 'success'}>
                      {member.status === 'pending' ? 'Pending' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-3">
                      {member.status === 'pending' && (
                        <button
                          type="button"
                          className="text-sm font-medium text-cerulean hover:text-navy"
                          onClick={() => {
                            const link = `${window.location.origin}/accept-invite?memberId=${member.id}`;
                            setInviteLink(link);
                            void navigator.clipboard.writeText(link);
                            setNotice('Invitation link copied.');
                          }}
                        >
                          Copy link
                        </button>
                      )}
                      {isOwner || isSelf ? (
                        <span className="sfx-muted text-sm">{isSelf ? 'You' : 'Owner'}</span>
                      ) : (
                        <button
                          type="button"
                          className="text-sm font-medium text-danger-600 hover:text-danger-700"
                          onClick={() => setPendingRemove(member)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <div className="sfx-panel px-5 py-4 text-sm">
        <p className="font-medium text-navy">Roles</p>
        <ul className="sfx-muted mt-2 space-y-1">
          <li>Owner — created the organization and cannot be removed here.</li>
          <li>Admin — can manage people and settings.</li>
          <li>Member — can work with the organization&apos;s files.</li>
        </ul>
      </div>

      <Modal
        open={pendingRemove !== null}
        title="Remove this member?"
        onClose={() => setPendingRemove(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingRemove(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => void removeMember()} isLoading={removing}>Remove</Button>
          </>
        }
      >
        <p>
          {pendingRemove?.name} ({pendingRemove?.email}) will lose access to this organization.
        </p>
      </Modal>
    </div>
  );
}
