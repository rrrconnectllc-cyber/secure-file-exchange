import type { Metadata } from 'next';
import { SignatureManager } from './SignatureManager';

export const metadata: Metadata = {
  title: 'Signature requests',
  description: 'Ask a client to accept a document.',
};

export default function SignaturePage() {
  return <SignatureManager />;
}
