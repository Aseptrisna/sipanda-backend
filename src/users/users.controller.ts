import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

function toProfileDto(user: {
  _id: unknown;
  nama: string;
  email: string;
  role: string;
  ref_id: unknown;
}) {
  return {
    id: String(user._id),
    nama: user.nama,
    email: user.email,
    role: user.role,
    ref_id: user.ref_id ? String(user.ref_id) : null,
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.usersService.findById(currentUser.userId);
    return user ? toProfileDto(user) : null;
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      currentUser.userId,
      dto,
    );
    return toProfileDto(user);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(currentUser.userId, dto);
  }
}
