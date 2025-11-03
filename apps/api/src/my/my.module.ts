import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MyController } from './my.controller'

@Module({
  controllers: [MyController],
  providers: [PrismaService],
})
export class MyModule {}
