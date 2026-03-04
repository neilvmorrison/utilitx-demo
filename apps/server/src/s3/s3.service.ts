import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    console.log(
      process.env.AWS_PROFILE,
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
    );
    this.bucket = process.env.AWS_S3_BUCKET!;
    this.client = new S3Client({
      region: process.env.AWS_S3_REGION ?? 'us-east-2',
    });
  }

  async getPresignedUploadUrl(
    s3Key: string,
    contentType: string,
    expiresInSeconds = 300,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async getPresignedDownloadUrl(
    s3Key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
  }
}
