// import {
//     WebSocketGateway,
//     WebSocketServer,
//     SubscribeMessage,
//     MessageBody,
//     ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { eventService } from './event.service';
// import { createWorkspaceDto } from './dto';

// @WebSocketGateway()
// export class EventsGateway {
//     constructor(private eventService: eventService) {}

//     @WebSocketServer()
//     server: Server;

//     @SubscribeMessage('createWorkspace')
//     async onCreateWorkspace(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() dto: createWorkspaceDto
//     ) {
//         const workspaceCreated = await this.eventService.createWorkspace(dto);

//         if (!workspaceCreated) {
//             client.emit('error', 'Unexpected issue during workspace creation');
//             return;
//         }
//         client.emit(
//             'createWorkspace',
//             `workspace ${workspaceCreated.name} created`
//         );
//         console.log(`workspace ${workspaceCreated.name} created`);
//         //the creator of workspace is unknown. will it cause any problems?
//     }

//     @SubscribeMessage('joinWorkspace')
//     async handleJoinWorkspace(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() joinCredentials: { workspaceId: number; userId: number }
//     ) {
//         if (joinCredentials) {
//             const checkCredentials =
//                 await this.eventService.checkWorkspaceMembers(
//                     joinCredentials.workspaceId,
//                     joinCredentials.userId
//                 );

//             if (!checkCredentials) {
//                 client.emit('error', 'Invalid workspace or user');
//                 return;
//             }
//             client.join(checkCredentials.userId.toString());
//             client.emit(
//                 'joinedRoom',
//                 `You have joined room: ${checkCredentials.userId}`
//             );
//             console.log(
//                 `Client ${client.id} with user id ${checkCredentials.userId} joined room: ${checkCredentials.userId}`
//             );
//         } else {
//             client.emit('error', 'Room name is required');
//         }
//     }

//     @SubscribeMessage('addUser')
//     async onAddUser(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() details: { workspaceId: number; userId: number }
//     ) {
//         const user = await this.eventService.addUserToWorkspace(
//             details.workspaceId,
//             details.userId
//         );
//         if (!user) {
//             client.emit('error', 'Unexpected issue, cannot add user');
//             return;
//         }
//         client.join(user.userId.toString());

//         this.server
//             .to(details.workspaceId.toString())
//             .emit(
//                 'addUser',
//                 `${user.userId} added to workspace ${details.workspaceId}`
//             );
//         console.log(`${user.userId} added to workspace ${details.workspaceId}`);
//     }

//     @SubscribeMessage('leaveRoom')
//     handleLeaveRoom(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() workspaceName: string
//     ): void {
//         if (workspaceName) {
//             client.leave(workspaceName);
//             client.emit('leftRoom', `You have left room: ${workspaceName}`);
//             console.log(`Client ${client.id} left room: ${workspaceName}`);
//         } else {
//             client.emit('error', 'Room name is required');
//         }
//     }

//     @SubscribeMessage('createFile')
//     async onCreateFile(
//         @ConnectedSocket() client: Socket,
//         @MessageBody()
//         details: { fileName: string; workspaceId: number; userId: number }
//     ) {
//         const file = await this.eventService.createFile(
//             details.fileName,
//             details.workspaceId,
//             details.userId
//         );
//         if (!file) {
//             client.emit('error', 'Unexpected issue, cannot create file');
//             return;
//         }
//         client.join(file.userId.toString());

//         this.server
//             .to(details.workspaceId.toString())
//             .emit(
//                 'createFile',
//                 `${file.id} added to workspace ${details.workspaceId}`
//             );
//         console.log(`${file.id} added to workspace ${details.workspaceId}`);
//     }

//     @SubscribeMessage('sendMessage')
//     handleMessage(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() message: { workspaceName: string; text: string }
//     ): void {
//         if (message.workspaceName && message.text) {
//             this.server.to(message.workspaceName).emit('message', message.text);
//             console.log(
//                 `Message sent to room ${message.workspaceName}: ${message.text}`
//             );
//         } else {
//             client.emit('error', 'Room name and message text are required');
//         }
//     }
// }

// /*
// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway()
// export class EventsGateway {
//   @WebSocketServer()
//   server: Server;

//   // Maintain a mapping of rooms to sets of client IDs
//   private roomClients = new Map<string, Set<string>>();

//   @SubscribeMessage('joinWorkspace')
//   handlejoinWorkspace(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() workspaceName: string
//   ): void {
//     if (workspaceName) {
//       // Join the room
//       client.join(workspaceName);

//       // Update room membership tracking
//       if (!this.roomClients.has(workspaceName)) {
//         this.roomClients.set(workspaceName, new Set());
//       }
//       this.roomClients.get(workspaceName)!.add(client.id);

//       client.emit('joinedRoom', `You have joined room: ${workspaceName}`);
//       console.log(`Client ${client.id} joined room: ${workspaceName}`);
//     } else {
//       client.emit('error', 'Room name is required');
//     }
//   }

//   @SubscribeMessage('leaveRoom')
//   handleLeaveRoom(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() workspaceName: string
//   ): void {
//     if (workspaceName) {
//       // Check if the client is in the room
//       const clientsInRoom = this.roomClients.get(workspaceName);
//       if (clientsInRoom && clientsInRoom.has(client.id)) {
//         // Leave the room
//         client.leave(workspaceName);

//         // Update room membership tracking
//         clientsInRoom.delete(client.id);
//         if (clientsInRoom.size === 0) {
//           this.roomClients.delete(workspaceName);
//         }

//         client.emit('leftRoom', `You have left room: ${workspaceName}`);
//         console.log(`Client ${client.id} left room: ${workspaceName}`);
//       } else {
//         client.emit('error', `You are not a member of room: ${workspaceName}`);
//       }
//     } else {
//       client.emit('error', 'Room name is required');
//     }
//   }

//   @SubscribeMessage('sendMessage')
//   handleMessage(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() message: { workspaceName: string; text: string }
//   ): void {
//     if (message.workspaceName && message.text) {
//       // Send message to the specified room
//       this.server.to(message.workspaceName).emit('message', message.text);
//       console.log(`Message sent to room ${message.workspaceName}: ${message.text}`);
//     } else {
//       client.emit('error', 'Room name and message text are required');
//     }
//   }
// }

// */
