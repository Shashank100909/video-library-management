import { Module } from '@nestjs/common';
import  {BorrowService}  from './borrow.service';
import { BorrowController } from './borrow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [],
  providers: [BorrowService],
  controllers: [BorrowController]
})
export class BorrowModule {}
