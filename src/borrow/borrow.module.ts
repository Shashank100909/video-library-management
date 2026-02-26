import { Module } from '@nestjs/common';
import  BorrowService  from './borrow.service';
import { BorrowController } from './borrow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrow } from './borrow.entity';
import { Video} from '../videos/video.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Borrow, Video])],
  providers: [BorrowService],
  controllers: [BorrowController]
})
export class BorrowModule {}
