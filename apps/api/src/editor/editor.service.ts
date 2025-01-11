import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EditorService {
    constructor(private prisma: PrismaService) {}

    private tempFilesDirectory: string = './tempFiles';

    async getFiles(workspaceId: number) {
        if (!workspaceId) {
            return {};
        }

        //converts id to Int from String
        const id =
            typeof workspaceId === 'string'
                ? parseInt(workspaceId, 10)
                : workspaceId;

        const files = await this.prisma.file.findMany({
            where: { workspaceId: id },
        });

        return files;
    }

    async getFileContent(fileId: string) {
        const tempFilePath = path.join(
            this.tempFilesDirectory,
            `${fileId}.txt`
        );

        // Get all files in the directory
        const tempFiles = fs.readdirSync(this.tempFilesDirectory);

        // Variable to store file content
        let fileContent = null;

        // Iterate through the files
        tempFiles.forEach(async (file) => {
            if (file.startsWith(fileId)) {
                const filePath = path.join(this.tempFilesDirectory, file);

                try {
                    // Read file content if the file matches the fileId
                    if (fs.existsSync(filePath)) {
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        console.log(`File content for ${fileId}:`, fileContent);

                        const data = await this.prisma.codeSnippet.findFirst({
                            where: { fileId: parseInt(fileId) },
                        });

                        console.log('return statement', {
                            id: data.id,
                            fileId: parseInt(fileId, 10),
                            userId: data.userId,
                            lineNo: data.lineNo,
                            code: fileContent,
                            language: data.language,
                            createdAt: data.createdAt,
                        });

                        return {
                            id: data.id,
                            fileId: fileId,
                            userId: data.userId,
                            lineNo: data.lineNo,
                            code: fileContent,
                            language: data.language,
                            createdAt: data.createdAt,
                        };
                    }
                } catch (err) {
                    console.error(`Error reading file ${filePath}:`, err);
                }
            }
        });

        return this.prisma.codeSnippet.findMany({
            where: { fileId: parseInt(fileId) },
            orderBy: {
                lineNo: 'asc',
            },
        });
    }

    async makeNewFile(userId: number, createFileDto: CreateFileDto) {
        console.log(createFileDto);
        const createFile = await this.prisma.file.create({
            data: {
                workspaceId: parseInt(createFileDto.workspaceId, 10),
                userId: userId,
                filename: createFileDto.filename,
                type: createFileDto.type,
                parentFolder: createFileDto.parentFolder,
            },
        });

        return createFile;
    }
}
