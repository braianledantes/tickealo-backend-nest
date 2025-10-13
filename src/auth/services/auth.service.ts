import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { EmailVerificationPayload } from '../interfaces/email-verification-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(user: User) {
    const { id, username, roles } = user;
    const payload = {
      sub: id,
      username,
      roles: roles.map((role) => role.name),
    };

    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
    };
  }

  /**
   * Generates a JWT token for email verification.
   * @param user - The user to generate a verification token for.
   * @returns A verification token.
   */
  async generateEmailVerificationToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // Token expires in 24 hours
    return this.jwtService.signAsync(payload, { expiresIn: '24h' });
  }

  /**
   * Verifies an email verification token.
   * @param token - The JWT token to verify.
   * @returns The decoded payload if valid.
   */
  async verifyEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationPayload> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token);

      if (!payload || typeof payload !== 'object') {
        throw new BadRequestException('Invalid token type');
      }

      return payload as EmailVerificationPayload;
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }
}
