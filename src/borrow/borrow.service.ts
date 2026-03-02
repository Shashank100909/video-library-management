import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { BorrowStatus } from '@prisma/client';
  
  @Injectable()
  export class BorrowService {
    constructor(private prisma: PrismaService) {}
  
    async borrowVideo(userId: number, videoId: number) {
      return this.prisma.$transaction(async (tx) => {
        const video = await tx.video.findUnique({
          where: { id: videoId },
        });
  
        if (!video) {
          throw new NotFoundException('Video not found');
        }
  
        if (video.availableCopies <= 0) {
          throw new BadRequestException('No copies available');
        }
  
        const existingBorrow = await tx.borrow.findFirst({
          where: {
            userId,
            videoId,
            status: BorrowStatus.BORROWED,
          },
        });
  
        if (existingBorrow) {
          throw new BadRequestException(
            'You have already borrowed this video',
          );
        }
  
        await tx.video.update({
          where: { id: videoId },
          data: {
            availableCopies: video.availableCopies - 1,
            borrowCount: video.borrowCount + 1,
          },
        });
  
        return tx.borrow.create({
          data: {
            userId,
            videoId,
            status: BorrowStatus.BORROWED,
          },
        });
      });
    }
  
    async returnVideo(userId: number, borrowId: number) {
      return this.prisma.$transaction(async (tx) => {
        const borrow = await tx.borrow.findUnique({
          where: { id: borrowId },
        });
  
        if (!borrow) {
          throw new NotFoundException('Borrow record not found');
        }
  
        if (borrow.status !== BorrowStatus.BORROWED) {
          throw new BadRequestException('Video already returned');
        }
  
        if (borrow.userId !== userId) {
          throw new BadRequestException(
            'You can only return your own borrowed videos',
          );
        }
  
        const video = await tx.video.findUnique({
          where: { id: borrow.videoId },
        });
  
        if (!video) {
          throw new NotFoundException('Video not found');
        }
  
        await tx.video.update({
          where: { id: video.id },
          data: {
            availableCopies: video.availableCopies + 1,
          },
        });
  
        return tx.borrow.update({
          where: { id: borrowId },
          data: {
            status: BorrowStatus.RETURNED,
            returnedAt: new Date(),
          },
        });
      });
    }
  
    async findAll() {
      return this.prisma.borrow.findMany({
        include: {
          user: true,
          video: true,
        },
      });
    }
  }