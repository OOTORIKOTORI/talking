import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';

@Module({
  controllers: [ProfilesController],
  providers: [PrismaService, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
