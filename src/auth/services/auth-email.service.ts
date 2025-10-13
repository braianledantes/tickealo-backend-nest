import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthEmailService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Sends an email verification to the user.
   * @param user - The user to send verification email to.
   */
  async sendEmailVerification(user: User): Promise<void> {
    const verificationToken =
      await this.authService.generateEmailVerificationToken(user);

    await this.mailService.sendEmailVerification(
      user.email,
      user.username,
      verificationToken,
    );
  }

  /**
   * Verifies a user's email using the verification token.
   * @param token - The JWT verification token.
   * @returns Success message.
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const payload = await this.authService.verifyEmailVerificationToken(token);

    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      return { message: 'Email already verified' };
    }

    // Mark email as verified
    await this.usersService.markEmailAsVerified(user.id);

    return { message: 'Email verified successfully' };
  }
}
