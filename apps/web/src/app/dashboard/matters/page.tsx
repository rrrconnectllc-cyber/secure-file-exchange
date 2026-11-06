import type { Metadata } from 'next';
import { MattersManager } from './MattersManager';

export const metadata: Metadata = {
  title: 'Matters',
  description: 'Cases and the documents filed on them.',
};

export default function MattersPage() {
  return <MattersManager />;
}
