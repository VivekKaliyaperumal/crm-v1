import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { UsersService } from './users.service';
import { InviteUserDto, UpdateUserDto } from './users.dto';

@ApiTags('team')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List organization members with their roles (admin)' })
  list(@CurrentUser() user: AuthUser) {
    return this.users.list(user);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new member by email (admin; needs service-role key)' })
  invite(@CurrentUser() user: AuthUser, @Body() dto: InviteUserDto) {
    return this.users.invite(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a member's roles and/or active status (admin)" })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(user, id, dto);
  }
}
