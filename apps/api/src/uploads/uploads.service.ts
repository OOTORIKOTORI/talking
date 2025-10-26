import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface SignedUrlRequest {
  filename: string;
  contentType: string;
}

@Injectable()
export class UploadsService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY');
    const forcePathStyle = this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true';
    
    this.bucket = this.configService.get<string>('S3_BUCKET', 'uploads');

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });
  }

  async getSignedPutUrl(request: SignedUrlRequest) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const key = `uploads/${timestamp}-${randomString}-${request.filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: request.contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return {
      url,
      method: 'PUT',
      key,
    };
  }
}
