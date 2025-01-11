import * as fs from 'fs';
import * as path from 'path';
import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from './../prisma/prisma.service'; // Import Prisma service
import { GetUser } from 'src/auth/decorator';

@WebSocketGateway(3001, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: 'Content-Type,Authorization',
    },
})
export class EditorGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    private server: Server;
    private workspaces: Map<string, Map<string, Set<Socket>>> = new Map(); // Map workspaceId -> fileId -> Set of sockets
    private userFiles: Map<string, { workspaceId: string; fileId: string }> =
        new Map(); // Track user file associations
    private usersInWorkspace: Map<string, Set<string>> = new Map(); // Map for storing usernames in a worspace
    private tempFilesDirectory: string = './tempFiles';

    constructor(private prisma: PrismaService) {}

    afterInit(server: Server) {
        this.server = server;
        if (!fs.existsSync(this.tempFilesDirectory)) {
            fs.mkdirSync(this.tempFilesDirectory); // Create temp directory if it doesn't exist
        }
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        const userFile = this.userFiles.get(client.id);
        if (userFile) {
            const { workspaceId, fileId } = userFile;
            this.removeUserFromFile(client, workspaceId, fileId);
            this.userFiles.delete(client.id);
            const files = this.workspaces.get(workspaceId);
            const workspaceEmpty = Array.from(files?.values() || []).every(
                (fileSet) => fileSet.size === 0
            );

            if (workspaceEmpty) {
                console.log(
                    `No users left in workspace ${workspaceId}. Deleting temp files...`
                );
                this.deleteTempFiles(fileId); // Delete temp files for the workspace if no users remain
            }
        }
    }

    // For removing userId from workspace
    @SubscribeMessage('leaveWorkspace')
    async handleLeaveWorkspace(
        client: Socket,
        data: { workspaceId: string; userId: string }
    ) {
        console.log(`User leaving workspace:`, data);
        const { workspaceId, userId } = data;

        // Find the user in the database
        const user = await this.prisma.user.findFirst({
            where: { id: parseInt(userId, 10) },
        });

        if (user) {
            if (this.usersInWorkspace.has(workspaceId)) {
                // Get the Set of users for the given workspaceId
                const usersSet = this.usersInWorkspace.get(workspaceId);

                if (usersSet) {
                    // Remove the username from the Set
                    usersSet.delete(user.username);
                    console.log(`${user.username} removed from ${workspaceId}`);
                }
            }
        }
        const users = this.usersInWorkspace.get(workspaceId);
        this.server.to(workspaceId).emit('usersConnected', Array.from(users));
    }

    private removeUserFromFile(
        client: Socket,
        workspaceId: string,
        fileId: string
    ) {
        const files = this.workspaces.get(workspaceId);
        const clients = files?.get(fileId);

        clients?.delete(client);
        client.leave(`${workspaceId}-${fileId}`);

        if (clients?.size === 0) {
            files?.delete(fileId);
        }
        if (files?.size === 0) {
            this.workspaces.delete(workspaceId);
        }

        console.log(
            `${client.id} left file ${fileId} in workspace ${workspaceId}`
        );
    }

    private deleteTempFiles(fileId: string) {
        // Get all files in the workspace
        const tempFiles = fs.readdirSync(this.tempFilesDirectory);

        // Delete files that belong to the given workspace
        tempFiles.forEach((file) => {
            if (file.startsWith(fileId)) {
                const filePath = path.join(this.tempFilesDirectory, file);
                try {
                    console.log(`Deleting temp file: ${filePath}`);
                    fs.unlinkSync(filePath);
                    console.log(`Deleted temp file: ${filePath}`);
                } catch (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                }

                console.log(`Deleted temp file: ${filePath}`);
            }
        });
    }

    @SubscribeMessage('joinWorkspace')
    async handleJoinWorkspace(
        client: Socket,
        data: { workspaceId: string; userId: string }
    ) {
        const { workspaceId, userId } = data;
        if (!this.workspaces.has(workspaceId)) {
            this.workspaces.set(workspaceId, new Map());
        }
        console.log(`${client.id} joined workspace ${workspaceId}`);

        // Add the client to the workspace room
        client.join(workspaceId);

        //Add userId to workspace
        const user = await this.prisma.user.findFirst({
            where: { id: parseInt(userId, 10) },
        });
        if (!this.usersInWorkspace.has(workspaceId)) {
            this.usersInWorkspace.set(workspaceId, new Set());
        }
        this.usersInWorkspace.get(workspaceId)?.add(user.username);

        const users = this.usersInWorkspace.get(workspaceId);
        console.log(users);
        this.server.to(workspaceId).emit('usersConnected', Array.from(users));
    }

    @SubscribeMessage('switchFile')
    handleSwitchFile(
        client: Socket,
        data: { workspaceId: string; fileId: string }
    ) {
        const { workspaceId, fileId } = data;

        const currentFile = this.userFiles.get(client.id);
        if (currentFile) {
            this.removeUserFromFile(
                client,
                currentFile.workspaceId,
                currentFile.fileId
            );
        }

        const files = this.workspaces.get(workspaceId);
        if (!files?.has(fileId)) {
            files?.set(fileId, new Set());
        }

        files?.get(fileId)?.add(client);
        client.join(`${workspaceId}-${fileId}`);
        this.userFiles.set(client.id, { workspaceId, fileId });

        console.log(
            `${client.id} switched to file ${fileId} in workspace ${workspaceId}`
        );
    }

    @SubscribeMessage('sendChange')
    async handleCodeChange(
        client: Socket,
        data: {
            workspaceId: string;
            fileId: string;
            lineNo: string;
            code: string;
            language: string;
        }
    ) {
        console.log('Emitting change to WebSocket:', data);
        const { workspaceId, fileId, lineNo, code, language } = data;

        const lines = code.split('\n');
        const lineNumber = parseInt(lineNo, 10);

        // Ensure the line exists
        if (lineNumber > 0 && lineNumber <= lines.length) {
            const codeLine = lines[lineNumber - 1];

            // Does snipper already exist?
            const existingSnippet = await this.prisma.codeSnippet.findFirst({
                where: { fileId: parseInt(fileId, 10), lineNo: lineNumber },
            });

            if (existingSnippet) {
                // Update snippet
                await this.prisma.codeSnippet.update({
                    where: { id: existingSnippet.id },
                    data: { code: codeLine, language: language },
                });
                console.log(`Updated snippet on line ${lineNo}`);
            } else {
                // Create snippet
                await this.prisma.codeSnippet.create({
                    data: {
                        fileId: parseInt(fileId, 10),
                        userId: 1, // too much effort to fix this. do it later
                        lineNo: lineNumber,
                        code: codeLine,
                        language,
                    },
                });
                console.log(`Created new snippet on line ${lineNo}`);
            }

            const currentFile = this.userFiles.get(client.id);
            if (
                currentFile?.workspaceId === workspaceId &&
                currentFile?.fileId === fileId
            ) {
                client.to(`${workspaceId}-${fileId}`).emit('receiveChange', {
                    workspaceId,
                    fileId,
                    text: code,
                });

                console.log(
                    `Change received in workspace ${workspaceId}, file ${fileId}: ${code}`
                );
            } else {
                console.log(`Unauthorized change attempt by ${client.id}`);
            }
        } else {
            console.log(`No valid line found: ${lineNo}`);
        }
    }

    @SubscribeMessage('createFile')
    async handleCreateFile(
        client: Socket,
        data: {
            workspaceId: string;
            filename: string;
            type: string;
            parentFolder: string;
        }
    ) {
        const { workspaceId, filename, type, parentFolder } = data;

        try {
            const userId = 1; // Replace with actual user ID from JWT or session
            const newFile = await this.prisma.file.create({
                data: {
                    workspaceId: parseInt(workspaceId),
                    filename,
                    type,
                    parentFolder,
                    userId,
                },
            });

            console.log(
                `File created: ${newFile.filename} in workspace ${workspaceId}`
            );

            // Fetch the updated file list
            const updatedFiles = await this.prisma.file.findMany({
                where: { workspaceId: parseInt(workspaceId) },
            });

            // Broadcast the updated file list to the workspace
            const clientsInRoom = await this.server
                .in(workspaceId)
                .allSockets();
            console.log(
                `Clients in room ${workspaceId}:`,
                Array.from(clientsInRoom)
            );

            // Emit the updated files list to all clients in the room
            this.server.to(workspaceId).emit('filesList', updatedFiles);
        } catch (error) {
            console.error('Error creating file:', error);
            client.emit('error', { message: 'Failed to create file' });
        }
    }

    @SubscribeMessage('getFiles')
    async handleGetFiles(client: Socket, data: { workspaceId: string }) {
        const { workspaceId } = data;
        try {
            const files = await this.prisma.file.findMany({
                where: { workspaceId: parseInt(workspaceId) },
            });
            client.emit('filesList', files);
        } catch (error) {
            console.error('Error fetching files:', error);
            client.emit('error', { message: 'Failed to fetch files' });
        }
    }
}
