import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

export class SignedUrlRequestDto {
  filename: string;
  contentType: string;
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('signed-url')
  @UseGuards(SupabaseAuthGuard)
  async getSignedUrl(@Body() dto: SignedUrlRequestDto) {
    return this.uploadsService.getSignedPutUrl(dto);
  }

  @Get('signed-get')
  async getSignedGetUrl(
    @Query('key') key: string,
    @Query('ttl') ttl?: string,
  ) {
    const ttlSec = ttl ? parseInt(ttl, 10) : 900; // Default 15 min
    const url = await this.uploadsService.getSignedGetUrl(key, ttlSec);
    return { url };
  }
}
