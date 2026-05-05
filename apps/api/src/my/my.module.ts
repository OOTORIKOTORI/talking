import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MyController } from './my.controller'
import { ProfilesModule } from '../profiles/profiles.module'

@Module({
  imports: [ProfilesModule],
  controllers: [MyController],
  providers: [PrismaService],
})
export class MyModule {}
