'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Alert, Checkbox } from '@/components';
import { PasswordInput } from '@/components/Input';
import { api } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import type { AuthResponse } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Sign up | Secure File Exchange';
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!formData.organizationName.trim()) nextErrors.organizationName = 'Organization name is required';
    if (!formData.email) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email address';
    if (!formData.password) nextErrors.password = 'Password is required';
    else if (formData.password.length < 12) nextErrors.password = 'Password must be at least 12 characters';
    if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) nextErrors.agreeToTerms = 'You must agree to the terms and privacy policy';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const result = await api<AuthResponse>(
        '/api/v1/auth/signup',
        {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            organizationName: formData.organizationName.trim(),
          }),
        },
        false
      );
      saveSession(
        {
          ...result,
          organization: { ...result.organization, name: formData.organizationName.trim() },
        },
        true
      );
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Could not create the account' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="outline">
      <CardHeader>
        <h1 className="text-2xl font-bold text-navy">Get Started</h1>
        <p className="mt-1 text-sm text-secondary-600">Solo is free for one person and one matter. No credit card.</p>
        <p className="mt-2 text-sm text-secondary-600">
          After the account exists, follow the{' '}
          <Link href="/guide" className="font-medium text-cerulean hover:text-navy">
            setup guide
          </Link>
          . It is the same guide we send with a new firm.
        </p>
      </CardHeader>
      <CardBody>
        {errors.submit && (
          <Alert variant="danger" className="mb-6">
            {errors.submit}
          </Alert>
        )}
        <form method="post" action="/signup" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Organization name"
            id="organizationName"
            name="organizationName"
            autoComplete="organization"
            value={formData.organizationName}
            onChange={handleChange}
            error={errors.organizationName}
            placeholder="Your company"
            required
          />
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@company.com"
            required
          />
          <PasswordInput
            label="Password"
            id="password"
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            helperText="Minimum 12 characters"
            required
          />
          <PasswordInput
            label="Confirm password"
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
          <div className="pt-2">
            <Checkbox
              id="terms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              label={
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-cerulean hover:text-navy">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-cerulean hover:text-navy">
                    Privacy Policy
                  </Link>
                </span>
              }
            />
            {errors.agreeToTerms && <p className="form-error">{errors.agreeToTerms}</p>}
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </CardBody>
      <CardFooter>
        <p className="text-center text-sm text-secondary-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-cerulean hover:text-navy">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
