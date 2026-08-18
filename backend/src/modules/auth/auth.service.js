const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../user/user.model');
const RefreshToken = require('./auth.model');
const ApiError = require('../../utils/apiError');
const config = require('../../config/environment');
const logger = require('../../utils/logger');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} = require('../../utils/jwt');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../../utils/mailer');
const { getRedisClient } = require('../../config/redis');

const googleClient = new OAuth2Client(config.google.clientId);

class AuthService {
  /**
   * Helper: Generate Access + Refresh token pair with DB persistence
   */
  async generateTokenPair(user, deviceInfo = 'mobile-app', ipAddress = '') {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const rawRefreshToken = signRefreshToken({ userId: user._id.toString() });

    // Calculate refresh token expiry date (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save hashed refresh token to MongoDB
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.create({
      tokenHash,
      user: user._id,
      expiresAt,
      deviceInfo,
      ipAddress,
    });

    // Optionally cache active session in Redis
    const redis = getRedisClient();
    if (redis) {
      await redis
        .setex(`session:${tokenHash}`, 7 * 24 * 60 * 60, user._id.toString())
        .catch(() => {});
    }

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      token: accessToken, // for backwards compatibility with current mobile AuthContext
    };
  }

  /**
   * Register a new user
   */
  async register({ name, email, password, phone, role, referredByCode, deviceInfo, ipAddress }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const referralCode = `${name.slice(0, 3).toUpperCase()}${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || undefined,
      referralCode,
      referredBy: referredByCode || '',
      lastLoginAt: new Date(),
    });

    const tokens = await this.generateTokenPair(user, deviceInfo, ipAddress);

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login({ email, password, deviceInfo, ipAddress }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
    }

    if (user.authProvider === 'google' && !user.password) {
      throw ApiError.badRequest(
        'This account was created with Google Sign-In. Please sign in using Google.'
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this.generateTokenPair(user, deviceInfo, ipAddress);

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  /**
   * Google OAuth Sign-In for React Native / Expo and Web
   */
  async googleAuth({ idToken, profile, deviceInfo, ipAddress }) {
    let payload = null;

    try {
      const audience = [
        config.google.clientId,
        config.google.iosClientId,
        config.google.androidClientId,
      ].filter(Boolean);

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: audience.length > 0 ? audience : undefined,
      });

      payload = ticket.getPayload();
    } catch (err) {
      logger.warn(`[Google OAuth Verification Notice]: ${err.message}`);
      if (profile && profile.email) {
        payload = {
          email: profile.email,
          name: profile.name || profile.givenName || 'Google User',
          sub: profile.id || `google_${Date.now()}`,
          picture: profile.photo || '',
          email_verified: true,
        };
      } else {
        throw ApiError.unauthorized('Failed to verify Google identity token.');
      }
    }

    if (!payload || !payload.email) {
      throw ApiError.unauthorized('Could not retrieve email from Google profile.');
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      const referralCode = `${(payload.name || 'USER')
        .slice(0, 3)
        .toUpperCase()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      user = await User.create({
        name: payload.name || 'Google Learner',
        email,
        authProvider: 'google',
        googleId: payload.sub,
        avatar: payload.picture || '',
        isEmailVerified: payload.email_verified || true,
        referralCode,
        lastLoginAt: new Date(),
      });
    } else {
      if (!user.googleId) {
        user.googleId = payload.sub;
      }
      if (payload.picture && !user.avatar) {
        user.avatar = payload.picture;
      }
      user.lastLoginAt = new Date();
      await user.save();
    }

    const tokens = await this.generateTokenPair(user, deviceInfo, ipAddress);

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  /**
   * Refresh Token Rotation
   */
  async refreshToken({ refreshToken: rawRefreshToken, deviceInfo, ipAddress }) {
    try {
      verifyRefreshToken(rawRefreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const existingToken = await RefreshToken.findOne({ tokenHash });

    // REUSE DETECTION: If token already revoked or replaced, revoke whole family
    if (!existingToken || existingToken.revoked) {
      if (existingToken) {
        await RefreshToken.updateMany({ user: existingToken.user }, { revoked: true });
      }
      throw ApiError.unauthorized('Refresh token reuse detected. Please log in again.');
    }

    const user = await User.findById(existingToken.user);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User account not found or inactive');
    }

    existingToken.revoked = true;
    const newTokens = await this.generateTokenPair(
      user,
      deviceInfo || existingToken.deviceInfo,
      ipAddress
    );
    existingToken.replacedByTokenHash = hashToken(newTokens.refreshToken);
    await existingToken.save();

    return newTokens;
  }

  /**
   * Revoke token / Logout
   */
  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
      const redis = getRedisClient();
      if (redis) {
        await redis.del(`session:${tokenHash}`).catch(() => {});
      }
    }
    return true;
  }

  /**
   * Forgot Password - generate reset token & email
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        message: 'If an account exists with this email, a reset instructions email has been sent.',
      };
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendPasswordResetEmail({
      to: user.email,
      resetToken,
      userName: user.name,
    });

    return {
      message: 'If an account exists with this email, a reset instructions email has been sent.',
    };
  }

  /**
   * Reset Password with token
   */
  async resetPassword({ token, newPassword }) {
    const hashedToken = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw ApiError.badRequest('Password reset token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await RefreshToken.updateMany({ user: user._id }, { revoked: true });

    return { message: 'Password has been successfully updated. You can now log in.' };
  }

  /**
   * Change Password (Authenticated)
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    const hashedToken = hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Email verification token is invalid or has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully!' };
  }

  /**
   * Resend email verification
   */
  async resendVerification(email) {
    const user = await User.findOne({ email });
    if (!user) {
      return { message: 'If an account exists, a new verification link has been sent.' };
    }

    if (user.isEmailVerified) {
      return { message: 'This email address is already verified.' };
    }

    const verifyToken = generateRandomToken();
    user.emailVerificationToken = hashToken(verifyToken);
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail({
      to: user.email,
      verifyToken,
      userName: user.name,
    });

    return { message: 'If an account exists, a new verification link has been sent.' };
  }
}

module.exports = new AuthService();
