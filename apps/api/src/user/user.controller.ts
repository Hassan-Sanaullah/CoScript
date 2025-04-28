import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { jwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { EditUserDto } from './dto/edit-user.dto';

@UseGuards(jwtGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('info')
    getDashboardInfo(@GetUser('id') userId: number) {
        return this.userService.getDashboardInfo(userId);
    }

}
