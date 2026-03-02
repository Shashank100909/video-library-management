import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [VideosService],
  controllers: [VideosController]
})
export class VideosModule { }
