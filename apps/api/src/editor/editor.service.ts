import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileDto } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class EditorService {
    constructor(private prisma: PrismaService) {}

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
            
        return this.prisma.codeSnippet.findMany({
            where: { fileId: parseInt(fileId) },
            orderBy: {
                lineNo: 'asc',
            },
        });
    }

    async getInviteLink(workspaceId: string) {
        // Convert workspaceId to a string and hash it using SHA-256
        const inviteCode = this.generateInviteCode(workspaceId);
   
        console.log(`Generated invite code for workspace ${workspaceId}: ${inviteCode}`);
        // Return the invite link containing the generated invite code
        return {
          inviteLink: `${inviteCode}`,
        };
      }
    
      private generateInviteCode(workspaceId: string): string {
        // Generate a hash using SHA-256, ensuring it's unique but consistent for the same workspaceId
        const hash = crypto.createHash('sha256');
        hash.update(workspaceId);
        const inviteCode = hash.digest('hex').substring(0, 8); // Use first 8 characters as the invite code
        return inviteCode;
      }

    // async makeNewFile(userId: number, createFileDto: CreateFileDto) {
    //     console.log(createFileDto);
    //     const createFile = await this.prisma.file.create({
    //         data: {
    //             workspaceId: parseInt(createFileDto.workspaceId, 10),
    //             userId: userId,
    //             filename: createFileDto.filename,
    //             type: createFileDto.type,
    //             parentFolder: createFileDto.parentFolder,
    //         },
    //     });

    //     return createFile;
    // }
}
