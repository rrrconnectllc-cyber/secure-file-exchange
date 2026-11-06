import type { Metadata } from 'next';
import { SettingsManager } from './SettingsManager';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Organization defaults, security, and notifications.',
};

export default function SettingsPage() {
  return <SettingsManager />;
}
