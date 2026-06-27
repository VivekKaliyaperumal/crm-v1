import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { permissionMatrix } from '../../permissions/catalog';

@ApiTags('permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Role × module permission matrix (admin only)' })
  matrix() {
    return permissionMatrix();
  }
}
