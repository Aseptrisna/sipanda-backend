import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class WebhookSecretGuard {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedSecret = request.headers['x-webhook-secret'];
    const expectedSecret = this.configService.getOrThrow<string>(
      'FACE_SERVICE_WEBHOOK_SECRET',
    );

    if (providedSecret !== expectedSecret) {
      throw new UnauthorizedException('Webhook secret tidak valid');
    }

    return true;
  }
}
