const { z } = require('zod');
const { ROLES } = require('../../constants/roles');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please provide a valid email address').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional().default(''),
    role: z.enum(Object.values(ROLES)).optional(),
    referredByCode: z.string().optional().default(''),
    deviceInfo: z.string().optional().default('mobile-app'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email or identifier is required').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
    deviceInfo: z.string().optional().default('mobile-app'),
  }),
});

const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID token is required'),
    profile: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        photo: z.string().optional(),
        givenName: z.string().optional(),
        familyName: z.string().optional(),
      })
      .optional(),
    deviceInfo: z.string().optional().default('mobile-app'),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
    deviceInfo: z.string().optional(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required').toLowerCase(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required').toLowerCase(),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
};
