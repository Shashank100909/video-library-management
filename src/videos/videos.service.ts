import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { BorrowStatus } from '@prisma/client';
import {PaginationDto} from '../common/dto/pagination.dto'

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async create(createVideoDto: CreateVideoDto) {
    const existing = await this.prisma.video.findFirst({
      where: { title: createVideoDto.title },
    });

    if (existing) {
      throw new BadRequestException('Title already exists');
    }

    const video = await this.prisma.video.create({
      data: {
        ...createVideoDto,
        availableCopies: createVideoDto.totalCopies,
      },
    });

    return {
      message: 'Video added successfully',
      id: video.id,
    };
  }

  async findAll(query: PaginationDto) {
    const {page = 1, limit =10, order = 'desc'} = query 
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        skip,
        take: limit,
        orderBy: { id: order },
      }),
      this.prisma.video.count(),
    ]);

    return { total, page, limit, data };
  }

  async deleteVideo(videoId: number) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.deletedAt) {
      throw new BadRequestException('Video already deleted');
    }

    const activeBorrow = await this.prisma.borrow.findFirst({
      where: {
        videoId: videoId,
        status: BorrowStatus.BORROWED,
      },
    });

    if (activeBorrow) {
      throw new BadRequestException(
        'Cannot delete video. It is currently borrowed.',
      );
    }

    await this.prisma.video.update({
      where: { id: videoId },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Video deleted successfully',
      videoId: video.id,
    };
  }

  async updateVideo(videoId: number, dto: UpdateVideoDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    let totalCopies = video.totalCopies;
    let availableCopies = video.availableCopies;

    if (dto.totalCopies !== undefined) {
      const borrowedCount = video.totalCopies - video.availableCopies;

      if (dto.totalCopies < borrowedCount) {
        throw new BadRequestException(
          'Total copies cannot be less than currently borrowed copies',
        );
      }

      totalCopies = dto.totalCopies;
      availableCopies = dto.totalCopies - borrowedCount;
    }

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: {
        title: dto.title ?? video.title,
        description: dto.description ?? video.description,
        totalCopies,
        availableCopies,
      },
    });

    return {
      message: 'Video updated successfully',
      id: updated.id,
    };
  }

  async recordPlay(userId: number, videoId: number) {
    return this.prisma.$transaction(async (tx) => {
      const video = await tx.video.findUnique({
        where: { id: videoId },
      });
  
      if (!video) {
        throw new NotFoundException('Video not found');
      }
  
      
      await tx.video.update({
        where: { id: videoId },
        data: {
          playCount: {
            increment: 1,
          },
        },
      });
  
      await tx.videoPlayHistory.create({
        data: {
          userId,
          videoId,
        },
      });
  
      return { message: 'Play recorded successfully' };
    });
  }

  async saveProgress(
    userId: number,
    videoId: number,
    lastWatchedSecond: number,
  ) {
    
    if (lastWatchedSecond < 0) {
      throw new BadRequestException('Invalid timestamp');
    }
  
    await this.prisma.userVideoProgress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        lastWatchedSecond,
      },
      create: {
        userId,
        videoId,
        lastWatchedSecond,
      },
    });
  
    return { message: 'Progress saved successfully' };
  }

  async getProgress(userId: number, videoId: number) {
    const progress = await this.prisma.userVideoProgress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });
  
    return {
      lastWatchedSecond: progress?.lastWatchedSecond ?? 0,
    };
  }
}