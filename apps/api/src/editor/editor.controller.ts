import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { jwtGuard } from 'src/auth/guard';
import { EditorService } from './editor.service';
import { CreateFileDto } from './dto';
import { GetUser } from 'src/auth/decorator';

@UseGuards(jwtGuard)
@Controller('editor')
export class EditorController {
    constructor(private editorService: EditorService) {}

    @Get('files/:workspaceId')
    getFiles(@Param('workspaceId') workspaceId: number) {
        return this.editorService.getFiles(workspaceId);
    }

    @Get('code/:fileId')
    async getFileContent(@Param('fileId') fileId: string) {
        const fileContent = await this.editorService.getFileContent(fileId);
        if (!fileContent) {
            throw new NotFoundException(`File with id ${fileId} not found`);
        }
        return fileContent;
    }

    @Post('make-file')
    makeNewFile(
        @GetUser('id') userId: number,
        @Body() createFileDto: CreateFileDto
    ) {
        return this.editorService.makeNewFile(userId, createFileDto);
    }
}
