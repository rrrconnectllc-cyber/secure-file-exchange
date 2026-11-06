import { Router, Request, Response } from 'express';
import { userService } from '../services/UserService';
import { validateEmail, validatePassword } from '../utils/auth';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user and create their organization
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, organizationName } = req.body;

    // Validate inputs
    if (!email || !password || !organizationName) {
      res.status(400).json({
        error: 'Invalid input',
        fields: ['email', 'password', 'organizationName'],
      });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email address' });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.errors[0] });
      return;
    }

    const result = await userService.register({
      email,
      password,
      organizationName,
    });

    res.status(201).json({
      userId: result.userId,
      organizationId: result.organizationId,
      email: result.email,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

/**
 * POST /api/v1/auth/login
 * Authenticate user and create session
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const result = await userService.login({ email, password });

    // TODO: Create session cookie/token
    // For now, return user and organizations

    res.status(200).json({
      userId: result.userId,
      email: result.email,
      mfaEnabled: result.mfaEnabled,
      organizations: result.organizations,
      message: 'Login successful',
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/logout
 * End user session
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
    // TODO: Clear session cookie/token
    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/password-reset-request
 * Request password reset email
 */
router.post('/password-reset-request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email address' });
      return;
    }

    // TODO: Generate reset token and send email
    // For now, just acknowledge the request (don't reveal if email exists)

    res.status(200).json({
      message: 'If an account exists with this email, you will receive a password reset link',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

/**
 * POST /api/v1/auth/password-reset
 * Reset password with token
 */
router.post('/password-reset', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password required' });
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.errors[0] });
      return;
    }

    // TODO: Verify token, find user, reset password

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/verify-email
 * Verify email address
 */
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      res.status(400).json({ error: 'User ID and token required' });
      return;
    }

    const result = await userService.verifyEmail(userId, token);

    res.status(200).json({
      email: result.email,
      verified: result.verified,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
