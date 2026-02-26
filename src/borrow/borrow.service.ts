import {
    Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Borrow } from './borrow.entity';
import { Video } from '../videos/video.entity';
import { BorrowStatus } from './borrow.entity';

@Injectable()
export default class BorrowService {
    constructor(
        @InjectRepository(Borrow) private borrowRepository: Repository<Borrow>,
        @InjectRepository(Video) private videoRepository: Repository<Video>,
        private dataSource: DataSource,
    ) { }

    async borrowVideo(userId: number, videoId: number) {
        return this.dataSource.transaction(async (manager) => {
            const video = await manager.findOne(Video, {
                where: { id: videoId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!video) {
                throw new NotFoundException('Video not found');
            }

            if (video.availableCopies <= 0) {
                throw new BadRequestException('No copies available');
            }

            const existingBorrow = await manager.findOne(Borrow, {
                where: {
                    user: { id: userId },
                    video: { id: videoId },
                    status: BorrowStatus.BORROWED,
                },
            });

            if (existingBorrow) {
                throw new BadRequestException('You have already borrowed this video');
            }
            video.availableCopies -= 1;
            await manager.save(video);

            const borrow = manager.create(Borrow, {
                user: { id: userId },
                video: { id: videoId },
                borrowedAt: new Date(),
                status: BorrowStatus.BORROWED,
            });
            return manager.save(borrow);
        });

    }
    async findAll() {
        return this.borrowRepository.find();
    }

    async returnVideo(userId: number, borrowId: number) {
        return this.dataSource.transaction(async (manager) => {
            const borrow = await manager.findOne(Borrow, {
                where: { id: borrowId },
            });

            if (!borrow) {
                throw new NotFoundException('Borrow record not found');
            }

            const video = await manager.findOne(Video, {
                where: { id: borrow.videoId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!video) {
                throw new NotFoundException('Video not found');
              }

            if (borrow.status !== BorrowStatus.BORROWED) {
                throw new BadRequestException('Video already returned');
            }

            console.log('JWT userId:', userId);
            console.log('Borrow userId:', borrow.userId);
            if (borrow.userId !== userId) {
                throw new BadRequestException('You can only return your own borrowed videos');
            }

            video.availableCopies += 1;
            await manager.save(video);


            borrow.status = BorrowStatus.RETURNED;
            borrow.returnedAt = new Date();

            return manager.save(borrow);
        });
    }
}