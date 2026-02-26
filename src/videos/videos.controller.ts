import { Controller, Post, Body, UseGuards, Get, Delete, Param, ParseIntPipe, Patch, Query, DefaultValuePipe } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('videos')
export class VideosController {
    constructor(private readonly videosService: VideosService) { }

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    addVideo(@Body() createVideoDto: CreateVideoDto) {
        return this.videosService.create(createVideoDto)
    }

    @Get()
    getAllMovies(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('order', new DefaultValuePipe('DESC')) order: 'ASC' | 'DESC',
    ) {
      return this.videosService.findAll(page, limit, order);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    deleteVideo(@Param('id', ParseIntPipe) id: number) {
        return this.videosService.deleteVideo(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    updateVideo(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateVideoDto: UpdateVideoDto,
    ) {
        return this.videosService.updateVideo(id, updateVideoDto);
    }
}