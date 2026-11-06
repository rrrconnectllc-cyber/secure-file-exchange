import type { Metadata } from 'next';
import { TeamManager } from './TeamManager';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Invite teammates and manage roles.',
};

export default function TeamPage() {
  return <TeamManager />;
}
