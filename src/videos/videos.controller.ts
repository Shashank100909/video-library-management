import { Controller, Post, Body, UseGuards, Get, Delete, Param, ParseIntPipe, Patch, Query, DefaultValuePipe, Req } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto'
import { queryObjects } from 'v8';

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
    getAllMovies(@Query() query: PaginationDto) {
        return this.videosService.findAll(query);
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

    @UseGuards(JwtAuthGuard)
    @Post(':id/play')
    recordPlay(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        console.log(req.user);
        console.log('REQ USER:', req.user);
        return this.videosService.recordPlay(req.user.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/progress')
    saveProgress(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body('lastWatchedSecond', ParseIntPipe) lastWatchedSecond: number,
    ) {
        return this.videosService.saveProgress(
            req.user.userId,
            id,
            lastWatchedSecond,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/progress')
    getProgress(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.videosService.getProgress(
            req.user.userId,
            id,
        );
    }

    @Get('popular/all-time')
    async getAllTimePopular(@Query('limit') limit?: string) {
        const data = await this.videosService.getAllTimePopular(Number(limit) || 10);

        return {
            message: "All time popular videos fetched successfully",
            data,
        };
    }

    @Get('popular/last-30-days')
    async getPopularLast30Days(@Query() query: PaginationDto) {
        const data= await this.videosService.getPopularLast30Days(query);

        return {
            message: "Popular video in last 30 days fetched successfully",
            data,
        };
    }
}