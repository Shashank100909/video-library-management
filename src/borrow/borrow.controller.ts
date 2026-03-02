import { Controller, UseGuards, Post, Param, Req, ParseIntPipe, Get, Delete } from '@nestjs/common';
import BorrowService from './borrow.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('borrow')
export class BorrowController {
    constructor(private readonly BorrowService: BorrowService) { }

    @UseGuards(JwtAuthGuard)
    @Post(':videoId')
    borrow(
        @Param('videoId', ParseIntPipe) videoId: number,
        @Req() req,
    ) {
        return this.BorrowService.borrowVideo(req.user.userId, videoId);
    }

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    getBorrowList() {
        return this.BorrowService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post('return/:borrowId')
    returnVideo(
        @Param('borrowId', ParseIntPipe) borrowId: number,
        @Req() req,
    ) {
        console.log('Full req.user:', req.user);
        return this.BorrowService.returnVideo(req.user.userId , borrowId);
    }

}
