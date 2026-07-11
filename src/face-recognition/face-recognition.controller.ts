import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { FaceRecognitionService } from './face-recognition.service';
import { UploadTrainingDto } from './dto/upload-training.dto';
import { TriggerTrainingDto } from './dto/trigger-training.dto';
import { TrainingCompleteWebhookDto } from './dto/training-complete-webhook.dto';
import { MatchAbsensiDto } from './dto/match-absensi.dto';
import { WebhookSecretGuard } from './guards/webhook-secret.guard';

@Controller('face-recognition')
export class FaceRecognitionController {
  constructor(
    private readonly faceRecognitionService: FaceRecognitionService,
  ) {}

  @Post('training/upload')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  uploadTraining(
    @Body() dto: UploadTrainingDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.faceRecognitionService.uploadTraining(dto, currentUser);
  }

  @Post('training/trigger')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  triggerTraining(@Body() dto: TriggerTrainingDto) {
    return this.faceRecognitionService.triggerTraining(dto);
  }

  @Get('training/status/:siswaId')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  getStatus(@Param('siswaId', ParseObjectIdPipe) siswaId: string) {
    return this.faceRecognitionService.getStatus(siswaId);
  }

  @Public()
  @UseGuards(WebhookSecretGuard)
  @Post('training-complete')
  handleWebhook(@Body() dto: TrainingCompleteWebhookDto) {
    return this.faceRecognitionService.handleTrainingCompleteWebhook(dto);
  }

  @Delete('training/:siswaId')
  @Roles(Role.SUPER_ADMIN)
  deleteTraining(@Param('siswaId', ParseObjectIdPipe) siswaId: string) {
    return this.faceRecognitionService.deleteTraining(siswaId);
  }

  @Post('absensi/match')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  matchAbsensi(@Body() dto: MatchAbsensiDto) {
    return this.faceRecognitionService.matchAbsensi(dto);
  }
}
