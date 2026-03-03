import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/dto/pagination.dto'
import {redisClient} from '../redis/redis.provider'

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService,
  ) {}

  private async clearUsersCache() {
    const keys = await redisClient.keys('users:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {

    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    await this.clearUsersCache();
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, order = 'desc' } = query
    const cacheKey = `users:${page}:${limit}:${order}`;
    const cached = await redisClient.get(cacheKey);
    console.log('Cached value:', cached);
    if (cached) {
      console.log('Fetching from Redis');
      return JSON.parse(cached);
    }
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { id: order },
        select: userSelect,
      }),
      this.prisma.user.count(),
    ]);

    const result = { total, page, limit, data };

    await redisClient.set(cacheKey, JSON.stringify(result), {EX: 60});

    console.log('Fetching from Database');

    return result;
  }
}