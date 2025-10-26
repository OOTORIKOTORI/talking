import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { SearchProducer } from '../queues/search.producer';
import { ThumbnailProducer } from '../queues/thumbnail.producer';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, SearchProducer, ThumbnailProducer],
})
export class AssetsModule {}
