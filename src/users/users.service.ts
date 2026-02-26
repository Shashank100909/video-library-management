import { Injectable, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {

    const existing = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      
      if (existing) {
        throw new BadRequestException('Email already exists');
      }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepository.save({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return {
        id: user.id,
        name: user.name,
        email :user.email,
        role : user.role,
    };
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findAll( page: number, limit: number, order: 'ASC' | 'DESC',) {
    const skip = (page -1) * limit;

    const [data, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: {
        id: order,
      }
    });
      return {total, page, limit, data,};
  }
}

