'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Alert, Checkbox } from '@/components';
import { PasswordInput } from '@/components/Input';
import { api } from '@/lib/api';
import { safeRedirect, saveSession } from '@/lib/auth';
import type { AuthResponse } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    if (!formData.email) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email address';
    if (!formData.password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const result = await api<AuthResponse>(
        '/api/v1/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        },
        false
      );
      saveSession(result, formData.rememberMe);
      const redirect = safeRedirect(new URLSearchParams(window.location.search).get('redirect'));
      router.push(redirect);
      router.refresh();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="outline">
      <CardHeader>
        <h1 className="text-2xl font-bold text-navy">Welcome Back</h1>
        <p className="mt-1 text-sm text-secondary-600">Sign in to your organization&apos;s secure file exchange.</p>
      </CardHeader>
      <CardBody>
        {errors.submit && (
          <Alert variant="danger" className="mb-6">
            {errors.submit}
          </Alert>
        )}
        <form method="post" action="/login" onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <div className="flex items-center justify-between pt-2">
            <Checkbox
              id="remember"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              label="Remember me"
            />
            <Link href="/password-reset" className="text-sm text-cerulean hover:text-navy">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardBody>
      <CardFooter>
        <p className="text-center text-sm text-secondary-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-cerulean hover:text-navy">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
