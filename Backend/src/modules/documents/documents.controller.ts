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
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  ListDocumentsQueryDto,
  UpdateDocumentDto,
  UploadUrlDto,
} from './documents.dto';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List documents in the org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListDocumentsQueryDto) {
    return this.documents.list(user, query);
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Get a signed URL to upload a file (needs storage configured)' })
  uploadUrl(@CurrentUser() user: AuthUser, @Body() dto: UploadUrlDto) {
    return this.documents.createUploadTarget(user, dto.filename);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single document' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.documents.get(user, id);
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get a signed URL to download/view the file' })
  downloadUrl(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.documents.getDownloadUrl(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a document' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDocumentDto) {
    return this.documents.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documents.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.documents.remove(user, id);
  }
}
