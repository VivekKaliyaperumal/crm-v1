import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { QuotationsService } from './quotations.service';
import {
  CreateQuotationDto,
  ListQuotationsQueryDto,
  UpdateQuotationDto,
} from './quotations.dto';

@ApiTags('quotations')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotations: QuotationsService) {}

  @Get()
  @ApiOperation({ summary: 'List quotations in the org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListQuotationsQueryDto) {
    return this.quotations.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single quotation' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.quotations.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a quotation' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateQuotationDto) {
    return this.quotations.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quotation' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDto,
  ) {
    return this.quotations.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quotation' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.quotations.remove(user, id);
  }
}
