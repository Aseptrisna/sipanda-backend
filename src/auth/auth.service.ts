import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { UserDocument } from '../users/schemas/user.schema';

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  refId: string | null;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Email atau password salah');
    }

    return user;
  }

  async login(user: UserDocument) {
    return this.issueTokens(user);
  }

  async refresh(refreshTokenRaw: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(refreshTokenRaw, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token tidak valid atau kedaluwarsa',
      );
    }

    const stored = await this.refreshTokenModel.findOne({
      jti: payload.jti,
      revoked: false,
    });

    if (!stored || stored.expires_at.getTime() < Date.now()) {
      throw new UnauthorizedException(
        'Refresh token tidak valid atau kedaluwarsa',
      );
    }

    const tokenMatches = await bcrypt.compare(
      refreshTokenRaw,
      stored.token_hash,
    );

    if (!tokenMatches) {
      throw new UnauthorizedException(
        'Refresh token tidak valid atau kedaluwarsa',
      );
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User tidak ditemukan atau nonaktif');
    }

    stored.revoked = true;
    await stored.save();

    return this.issueTokens(user);
  }

  async logout(refreshTokenRaw: string) {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshTokenRaw,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
      await this.refreshTokenModel.updateOne(
        { jti: payload.jti },
        { revoked: true },
      );
    } catch {
      // Token sudah tidak valid — tidak perlu error, logout tetap dianggap berhasil
    }
  }

  private async issueTokens(user: UserDocument) {
    const accessPayload: AccessTokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      refId: user.ref_id ? user.ref_id.toString() : null,
    };

    const accessToken = this.jwtService.sign(
      accessPayload as unknown as Record<string, unknown>,
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_ACCESS_EXPIRES_IN',
        ) as never,
      },
    );

    const jti = randomUUID();
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    const refreshToken = this.jwtService.sign(
      { sub: user._id.toString(), jti } as unknown as Record<string, unknown>,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn as never,
      },
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await this.refreshTokenModel.create({
      user_id: user._id,
      jti,
      token_hash: tokenHash,
      expires_at: new Date(
        Date.now() + this.parseExpiresInMs(refreshExpiresIn),
      ),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id.toString(),
        nama: user.nama,
        email: user.email,
        role: user.role,
        ref_id: user.ref_id ? user.ref_id.toString() : null,
      },
    };
  }

  private parseExpiresInMs(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return value * (unitMs[match[2]] ?? 86_400_000);
  }
}
