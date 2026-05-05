import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get(':userId')
  @UseGuards(OptionalSupabaseAuthGuard)
  getPublicProfile(@Param('userId') userId: string) {
    return this.profiles.getPublicProfile(userId);
  }
}
