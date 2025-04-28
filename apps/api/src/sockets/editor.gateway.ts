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
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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
        new Map(); // Track user file associations  client.id -> { workspaceId, fileId }
    private usersInWorkspace: Map<string, Set<string>> = new Map(); // Map for storing usernames in a workspace
    // private tempFilesDirectory: string = './tempFiles';

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private jwt: JwtService
    ) {}
    private secret = this.config.get('JWT_SECRET');

    afterInit(server: Server) {
        this.server = server;
        // if (!fs.existsSync(this.tempFilesDirectory)) {
        //     fs.mkdirSync(this.tempFilesDirectory); // Create temp directory if it doesn't exist
        // }
    }

    async handleConnection(client: Socket) {
        let token = client.handshake.query.token; // Retrieve the token from the connection query

        if (Array.isArray(token)) {
            token = token[0]; // If it's an array, take the first element
        }

        if (!token) {
            console.log('No token provided, disconnecting');
            client.emit('unauthorized', { message: 'No token provided' });
            client.disconnect();
            return;
        }

        const jwtSecret = this.config.get<string>('JWT_SECRET'); // Get the JWT secret from environment

        try {
            const decoded = this.jwt.verify(token, { secret: jwtSecret }); // Verify the token using the secret from config

            // Optionally: Attach user info to the client object (client.data)
            client.data.user = decoded;

            console.log(
                `JWT Auth successful, Client connected with userId : ${decoded.sub}`
            );
            // You can now access user information (decoded.userId, etc.)
        } catch (err) {
            console.error('Invalid token', err);
            client.emit('unauthorized', { message: 'Invalid token' });
            client.disconnect();
        }
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

            // if (workspaceEmpty) {
            //     console.log(
            //         `No users left in workspace ${workspaceId}. Deleting temp files...`
            //     );
            //     this.deleteTempFiles(fileId); // Delete temp files for the workspace if no users remain
            // }
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

    // private deleteTempFiles(fileId: string) {
    //     // Get all files in the workspace
    //     const tempFiles = fs.readdirSync(this.tempFilesDirectory);

    //     // Delete files that belong to the given workspace
    //     tempFiles.forEach((file) => {
    //         if (file.startsWith(fileId)) {
    //             const filePath = path.join(this.tempFilesDirectory, file);
    //             try {
    //                 console.log(`Deleting temp file: ${filePath}`);
    //                 fs.unlinkSync(filePath);
    //                 console.log(`Deleted temp file: ${filePath}`);
    //             } catch (err) {
    //                 console.error(`Error deleting file ${filePath}:`, err);
    //             }

    //             console.log(`Deleted temp file: ${filePath}`);
    //         }
    //     });
    // }

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

    @SubscribeMessage('deleteFile')
    async handleDeleteFile(
        client: Socket,
        data: { workspaceId: string; filename: string }
    ) {
        const { workspaceId, filename } = data;

        try {
            // Find the file first using workspaceId and filename
            const file = await this.prisma.file.findFirst({
                where: {
                    workspaceId: parseInt(workspaceId),
                    filename: filename,
                },
            });

            if (!file) {
                client.emit('error', { message: 'File not found' });
                return;
            }

            // Now delete the file using its ID
            await this.prisma.file.delete({
                where: { id: file.id },
            });

            console.log(
                `File deleted: ${filename} in workspace ${workspaceId}`
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
            console.error('Error deleting file:', error);
            client.emit('error', { message: 'Failed to delete file' });
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

    /* *************************************** Dashboard ******************************************* */

    private async fetchUserInfo(userId, client: Socket) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: parseInt(userId, 10) },
                include: {
                    workspaces: {
                        select: {
                            role: true,
                            workspace: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    updatedAt: true,
                                },
                            },
                        },
                    },
                },
            });

            if (user) {
                console.log('User found:', user);
                delete user.passwordHash; // Remove sensitive information

                const workspaces = user.workspaces.map((workspace) => ({
                    id: workspace.workspace.id,
                    role: workspace.role,
                    name: workspace.workspace.name,
                    description: workspace.workspace.description,
                    updatedAt: workspace.workspace.updatedAt,
                }));

                console.log('workspaces sent to user');

                client.emit('userInfo', {
                    userId: user.id,
                    ...user,
                    workspaces,
                });
            } else {
                console.log('User not found for ID:', userId);
            }
        } catch (error) {
            console.log('Error fetching user info:', error);
            client.emit('error', 'Error fetching user info');
        }
    }

    @SubscribeMessage('requestUserInfo')
    async handleRequestUserInfo(
        client: Socket,
        data: {
            userId: string;
        }
    ) {
        console.log('Requesting user info:', data);
        const { userId } = data;

        try {
            this.fetchUserInfo(userId, client);
        } catch (error) {
            console.log('Error fetching user info:', error);
            client.emit('error', 'Error fetching user info');
        }
    }

    @SubscribeMessage('createWorkspace')
    async handleCreateWorkspace(
        client: Socket,
        data: { userId: string; name: string; description: string }
    ) {
        console.log('Creating workspace:', data);
        const { userId, name, description } = data;

        try {

            const workspaceExists = await this.prisma.workspace.findFirst({
                where: {
                  name: name,
                  members: {
                    some: {
                      userId: parseInt(userId,10),
                    },
                  },
                },
            });

            if(workspaceExists){
                throw new Error('Workspace already exists');
            }

            const newWorkspace = await this.prisma.workspace.create({
                data: {
                    name: name,
                    description: description,
                },
            });

            const addAdmin = await this.prisma.workspaceMember.create({
                data: {
                    workspaceId: newWorkspace.id,
                    userId: parseInt(userId, 10),
                    role: 'admin',
                },
            });

            console.log('New workspace created:', newWorkspace);
            this.fetchUserInfo(userId, client);
        } catch (error) {
            console.error('Error creating workspace:', error);
            client.emit('error', 'Failed to create workspace');
        }
    }

    @SubscribeMessage('editWorkspace')
    async handleeditWorkspace(
        client: Socket,
        data: {
            userId: string;
            workspaceId: string;
            name: string;
            description: string;
        }
    ) {
        console.log('Editing workspace:', data);
        const { userId, workspaceId, name, description } = data;

        try {
            const updateData: any = {};

            if (name) updateData.name = name;
            if (description) updateData.description = description;

            if (Object.keys(updateData).length) {
                const updatedWorkspace = await this.prisma.workspace.update({
                    where: { id: parseInt(workspaceId, 10) },
                    data: updateData,
                });

                console.log('Workspace edited:', updatedWorkspace);
                this.fetchUserInfo(userId, client);
            } else {
                client.emit('error', 'No valid fields to update');
            }
        } catch (error) {
            console.error('Error editing workspace:', error);
            client.emit('error', 'Failed to edit workspace');
        }
    }

    @SubscribeMessage('deleteWorkspace')
    async handleDeleteWorkspace(
        client: Socket,
        data: { userId: string; workspaceId: string }
    ) {
        console.log('Deleting workspace:', data);
        const { userId, workspaceId } = data;

        try {
            const deletedWorkspace = await this.prisma.workspace.delete({
                where: { id: parseInt(workspaceId, 10) },
            });

            console.log('Workspace Deleted:', deletedWorkspace);
            this.fetchUserInfo(userId, client);
        } catch (error) {
            console.error('Error deleting workspace:', error);
            client.emit('error', 'Failed to delete workspace');
        }
    }

    // remove member from workspace in database
    @SubscribeMessage('removeWorkspace')
    async handleRemoveWorkspace(
        client: Socket,
        data: { userId: string; workspaceId: string }
    ) {
        console.log('Removing member from workspace:', data);
        const { userId, workspaceId } = data;

        try {
            // Delete the workspace member using the correct composite key (workspaceId, userId)
            const deletedWorkspaceMember =
                await this.prisma.workspaceMember.delete({
                    where: {
                        WorkspaceMemberId: {
                            workspaceId: parseInt(workspaceId, 10),
                            userId: parseInt(userId, 10),
                        },
                    },
                });

            console.log('Workspace member Deleted:', deletedWorkspaceMember);
            this.fetchUserInfo(userId, client);
        } catch (error) {
            console.error('Error deleting workspace:', error);
            client.emit('error', 'Failed to delete workspace');
        }
    }

    // Add member to workspace in the database
@SubscribeMessage('addMemberWorkspace')
async handleAddMemberWorkspace(
    client: Socket,
    data: { userId: string; workspaceId: string }
) {
    console.log('Adding member to workspace:', data);
    const { userId, workspaceId } = data;

    // Ensure userId and workspaceId are valid integers
    const userIdInt = parseInt(userId, 10);
    const workspaceIdInt = parseInt(workspaceId, 10);

    if (isNaN(userIdInt) || isNaN(workspaceIdInt)) {
        client.emit('error', 'Invalid user ID or workspace ID');
        return;
    }

    try {
        // Check if workspace exists
        const workspaceExists = await this.prisma.workspace.findUnique({
            where: { id: workspaceIdInt },
        });

        if (!workspaceExists) {
            client.emit('error', 'Workspace not found');
            return;
        }

        // Check if user exists
        const userExists = await this.prisma.user.findUnique({
            where: { id: userIdInt },
        });

        if (!userExists) {
            client.emit('error', 'User not found');
            return;
        }

        // Add the workspace member using the correct composite key (workspaceId, userId)
        const workspaceMember = await this.prisma.workspaceMember.create({
            data: {
                userId: userIdInt,
                workspaceId: workspaceIdInt,
                role: 'member', // Default role as 'member'
            },
        });

        console.log('Workspace member added:', workspaceMember);

        // Optionally, you can send user info or workspace data back to the client
        this.fetchUserInfo(userId, client);

    } catch (error) {
        console.error('Error adding workspace member:', error);
        client.emit('error', 'Failed to add member to workspace');
    }
}
}
