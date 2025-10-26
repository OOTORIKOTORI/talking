import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UploadsService } from './uploads.service';

export class SignedUrlRequestDto {
  filename: string;
  contentType: string;
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('signed-url')
  async getSignedUrl(@Body() dto: SignedUrlRequestDto) {
    return this.uploadsService.getSignedPutUrl(dto);
  }

  @Get('signed-get')
  async getSignedGetUrl(
    @Query('key') key: string,
    @Query('ttl') ttl?: string,
  ) {
    const ttlSec = ttl ? parseInt(ttl, 10) : 300;
    const url = await this.uploadsService.getSignedGetUrl(key, ttlSec);
    return { url };
  }
}
