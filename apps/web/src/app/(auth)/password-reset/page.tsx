import { Card, CardBody, CardHeader, Button } from '@/components';

export default function PasswordResetPage() {
  return (
    <Card variant="outline">
      <CardHeader>
        <h1 className="text-2xl font-bold text-navy">Password reset is not available yet</h1>
        <p className="mt-1 text-sm text-secondary-600">
          This page does not send an email, and it does not change a password.
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm leading-6 text-ink">
          Use the password you created when you opened the firm. A person who was invited cannot sign in until they open the invite link and choose a password there.
        </p>
        <p className="text-sm leading-6 text-ink">
          If you still cannot sign in, email{' '}
          <a href="mailto:hello@securefileexchange.com" className="font-medium text-cerulean hover:text-navy">
            hello@securefileexchange.com
          </a>{' '}
          from the address on the account and name the firm.
        </p>
        <Button href="/login" variant="secondary" className="w-full">
          Back to sign in
        </Button>
      </CardBody>
    </Card>
  );
}
