import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { Borrow } from '../borrow/borrow.entity';

@Module({
  imports: [],
  providers: [VideosService],
  controllers: [VideosController]
})
export class VideosModule { }
