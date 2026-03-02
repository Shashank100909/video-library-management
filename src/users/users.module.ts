import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRole } from '@prisma/client';
import { PrismaModule } from '../prisma/prisma.module';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // 👈 add this back
    PrismaModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}