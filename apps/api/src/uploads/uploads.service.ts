import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

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
    
    this.bucket = this.configService.get<string>('S3_BUCKET', 'uploads');

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async getSignedPutUrl(request: SignedUrlRequest) {
    // 拡張子を取得（なければ空文字列）
    const ext = request.filename.includes('.') 
      ? request.filename.split('.').pop() 
      : '';
    
    // YYYYMMDD 形式の日付
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    
    // ASCII安全なランダムID
    const randomId = nanoid(16);
    
    // キー生成: uploads/YYYYMMDD/randomId.ext
    const key = ext 
      ? `uploads/${datePrefix}/${randomId}.${ext}`
      : `uploads/${datePrefix}/${randomId}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: request.contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    });

    return {
      url,
      method: 'PUT',
      key,
    };
  }
}
