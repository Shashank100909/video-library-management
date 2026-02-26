import { Injectable , NotFoundException,
    BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { Repository } from 'typeorm';
import { CreateVideoDto } from './dto/create-video.dto';
import { BorrowStatus } from '../borrow/borrow.entity';
import { Borrow } from '../borrow/borrow.entity';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        @InjectRepository(Borrow)
        private borrowRepository: Repository<Borrow>,
    ) { }

    async create(createVideoDto: CreateVideoDto) {

        const existing = await this.videoRepository.findOne({
            where: { title: createVideoDto.title },
        });

        if (existing) {
            throw new BadRequestException('Title already exists')
        }

        const video = await this.videoRepository.save({
            ...createVideoDto,
            availableCopies: createVideoDto.totalCopies,
        });

        return {
            message: "Video added successfully",
            id: video.id,
        };

    }
    async findAll( page: number, limit: number, order: 'ASC' | 'DESC',) {
      const skip = (page -1) * limit;

      const [data, total] = await this.videoRepository.findAndCount({
        skip,
        take: limit,
        order: {
          id: order,
        }
      });
        return {total, page, limit, data,};
    }

    async deleteVideo(videoId: number) {
        const video = await this.videoRepository.findOne({
          where: { id: videoId },
          withDeleted: true,
        });
      
        
        if (!video) {
          throw new NotFoundException('Video not found');
        }

        console.log('deletedAt value:', video.deletedAt);
        if(video.deletedAt) {
          throw new BadRequestException('Video already deleted');
        }
      
        const activeBorrow = await this.borrowRepository.findOne({
          where: {
            video: { id: videoId },
            status: BorrowStatus.BORROWED,
          },
        });
      
        if (activeBorrow) {
          throw new BadRequestException(
            'Cannot delete video. It is currently borrowed.',
          );
        }

        
        await this.videoRepository.softDelete(videoId);
      
        return { 
          message: 'Video deleted successfully',
          VideoId: video.id
        };
      }

      async updateVideo(videoId: number, dto: UpdateVideoDto) {
       
        const video = await this.videoRepository.findOne({
          where: { id: videoId },
        });
      
        if (!video) {
          throw new NotFoundException('Video not found');
        }
      
        
        if (dto.totalCopies !== undefined) {
          const borrowedCount =
            video.totalCopies - video.availableCopies;
      
          if (dto.totalCopies < borrowedCount) {
            throw new BadRequestException(
              'Total copies cannot be less than currently borrowed copies',
            );
          }
      
          video.availableCopies =
            dto.totalCopies - borrowedCount;
      
          video.totalCopies = dto.totalCopies;
        }
      
       
        if (dto.title !== undefined) {
          video.title = dto.title;
        }
      
        if (dto.description !== undefined) {
          video.description = dto.description;
        }
      
        
        await this.videoRepository.save(video);
      
        return {
          message: 'Video updated successfully',
          id: video.id,
        };
      }
}
