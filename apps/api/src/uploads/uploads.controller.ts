import { Controller, Post, Body } from '@nestjs/common';
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
}
