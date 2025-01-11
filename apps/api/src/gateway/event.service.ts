// import { Injectable } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class eventService {
//     constructor(private prisma: PrismaService) {}

//     async createWorkspace(dto) {
//         return this.prisma.workspace.create({
//             data: { name: dto.name, description: dto.description },
//         });
//     }

//     async getWorkspace(workspaceId: number) {
//         return this.prisma.workspace.findUnique({
//             where: { id: workspaceId },
//         });
//     }

//     async checkWorkspaceMembers(workspaceId: number, userId: number) {
//         return this.prisma.workspaceMember.findUnique({
//             where: {
//                 WorkspaceMemberId: { workspaceId: workspaceId, userId: userId },
//             },
//         });
//     }

//     async addUserToWorkspace(workspaceId: number, userId: number) {
//         const checkUser = await this.prisma.workspaceMember.findFirst({
//             where: { workspaceId: workspaceId, userId: userId },
//         });
//         if (checkUser) {
//             return undefined;
//         }
//         return this.prisma.workspaceMember.create({
//             data: { workspaceId: workspaceId, userId: userId },
//         });
//     }

//     async removeUserFromWorkspace(workspaceId: number, userId: number) {
//         return this.prisma.workspaceMember.delete({
//             where: {
//                 WorkspaceMemberId: { workspaceId: workspaceId, userId: userId },
//             },
//         });
//     }

//     async createFile(fileName: string, workspaceId: number, userId: number) {
//         const fileExists = await this.prisma.file.findFirst({
//             where: { filename: fileName, workspaceId: workspaceId },
//         });
//         if (fileExists) {
//             return undefined;
//         }

//         return this.prisma.file.create({
//             data: {
//                 filename: fileName,
//                 workspaceId: workspaceId,
//                 userId: userId,
//             },
//         });
//     }

//     // async sendMessage(roomId: number, userId: number, content: string) {
//     //     return this.prisma.message.create({
//     //         data: { roomId, userId, content },
//     //     });
//     // }

//     // async getMessages(roomId: number) {
//     //     return this.prisma.message.findMany({
//     //         where: { roomId },
//     //         include: { user: true },
//     //         orderBy: { createdAt: 'asc' },
//     //     });
//     // }
// }
