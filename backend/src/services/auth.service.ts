import { User, IUser } from '../modules/auth/user.model';
import { Patient } from '../modules/auth/patient.model';
import { Doctor } from '../modules/auth/doctor.model';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { writeAuditLog } from '../middleware/audit.middleware';
import { AppError } from '../middleware/error.middleware';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { logger } from '../utils/logger';

interface AuthResult {
  user: Omit<IUser, 'passwordHash' | 'refreshTokens'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new patient or doctor
   */
  async register(input: RegisterInput, ipAddress: string): Promise<AuthResult> {
    // Check for existing user first
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    // Create user document (no session — Atlas M0 does not support transactions)
    const user = new User({
      email: input.email,
      passwordHash: input.password,
      role: input.role,
    });
    await user.save();

    try {
      // Create role-specific profile
      if (input.role === 'PATIENT') {
        if (!input.dateOfBirth || !input.gender) {
          throw new AppError('Date of birth and gender are required for patients.', 400);
        }
        await Patient.create({
          userId: user._id,
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: new Date(input.dateOfBirth),
          gender: input.gender,
          phone: input.phone || '',
        });
      } else if (input.role === 'DOCTOR') {
        if (!input.specialization || !input.licenseNumber) {
          throw new AppError('Specialization and license number are required for doctors.', 400);
        }
        await Doctor.create({
          userId: user._id,
          firstName: input.firstName,
          lastName: input.lastName,
          specialization: input.specialization,
          licenseNumber: input.licenseNumber,
          phone: input.phone || '',
        });
      }

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      user.refreshTokens = [tokens.refreshToken];
      user.lastLoginAt = new Date();
      await user.save();

      // Audit log (best-effort — never blocks registration)
      await writeAuditLog({
        userId: user._id.toString(),
        userEmail: user.email,
        role: user.role,
        action: 'USER_REGISTER',
        ipAddress,
        success: true,
        resource: 'User',
        resourceId: user._id.toString(),
      });

      logger.info(`New user registered: ${user.email} (${user.role})`);

      return {
        user: user.toJSON() as Omit<IUser, 'passwordHash' | 'refreshTokens'>,
        ...tokens,
      };
    } catch (error) {
      // Manual rollback: delete the user if profile creation or token save failed
      await User.deleteOne({ _id: user._id }).catch((e) =>
        logger.error('Rollback failed — orphaned user doc', { id: user._id, error: e }),
      );
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  async login(input: LoginInput, ipAddress: string): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email })
      .select('+passwordHash +refreshTokens')
      .exec();

    if (!user) {
      await writeAuditLog({
        userEmail: input.email,
        action: 'FAILED_LOGIN',
        ipAddress,
        success: false,
        errorMessage: 'User not found',
      });
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const isPasswordValid = await user.comparePassword(input.password);

    if (!isPasswordValid) {
      await writeAuditLog({
        userId: user._id.toString(),
        userEmail: user.email,
        role: user.role,
        action: 'FAILED_LOGIN',
        ipAddress,
        success: false,
        errorMessage: 'Invalid password',
      });
      throw new AppError('Invalid email or password.', 401);
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Rotate refresh tokens (keep max 5 active sessions)
    const MAX_SESSIONS = 5;
    user.refreshTokens = [tokens.refreshToken, ...(user.refreshTokens || [])].slice(
      0,
      MAX_SESSIONS,
    );
    user.lastLoginAt = new Date();
    await user.save();

    await writeAuditLog({
      userId: user._id.toString(),
      userEmail: user.email,
      role: user.role,
      action: 'USER_LOGIN',
      ipAddress,
      success: true,
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: user.toJSON() as Omit<IUser, 'passwordHash' | 'refreshTokens'>,
      ...tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    refreshToken: string,
    ipAddress: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token. Please login again.', 401);
    }

    const user = await User.findById(payload.userId)
      .select('+refreshTokens')
      .exec();

    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      throw new AppError('Refresh token revoked. Please login again.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account deactivated.', 403);
    }

    // Rotate: remove old, add new
    const newTokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.refreshTokens = user.refreshTokens
      .filter((t) => t !== refreshToken)
      .concat(newTokens.refreshToken)
      .slice(0, 5);

    await user.save();

    return newTokens;
  }

  /**
   * Logout — revoke refresh token
   */
  async logout(userId: string, refreshToken: string, ipAddress: string): Promise<void> {
    const user = await User.findById(userId).select('+refreshTokens').exec();

    if (user) {
      user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
      await user.save();

      await writeAuditLog({
        userId,
        userEmail: user.email,
        role: user.role,
        action: 'USER_LOGOUT',
        ipAddress,
        success: true,
      });
    }
  }

  /**
   * Get user profile with role-specific data
   */
  async getProfile(userId: string) {
    const user = await User.findById(userId).exec();
    if (!user) throw new AppError('User not found.', 404);

    let profile = null;

    if (user.role === 'PATIENT') {
      profile = await Patient.findOne({ userId }).exec();
    } else if (user.role === 'DOCTOR') {
      profile = await Doctor.findOne({ userId }).exec();
    }

    return { user: user.toJSON(), profile };
  }

  /**
   * Update doctor profile
   */
  async updateDoctorProfile(userId: string, data: any) {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    const allowedFields = ['bio', 'specialization', 'qualifications', 'yearsOfExperience', 'consultationDurationMinutes', 'isAcceptingAppointments'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        (doctor as any)[field] = data[field];
      }
    }

    await doctor.save();
    return doctor;
  }
}

export const authService = new AuthService();
