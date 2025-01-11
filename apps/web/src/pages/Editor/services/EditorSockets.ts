// // src/components/useEditorLogic.ts
// import { useEffect, useState } from 'react';
// import { Socket } from 'socket.io-client';

// type CursorPosition = { userId: string; position: { lineNumber: number; column: number } };
// type TypingUser = { userId: string; isTyping: boolean };

// export const useEditorLogic = () => {
//   const [editorValue, setEditorValue] = useState<string>('');   // Content of the editor
//   const [cursorPositions, setCursorPositions] = useState<CursorPosition[]>([]);  // Cursor positions
//   const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);  // Typing users
//   const socket: any = io('http://localhost:3000');  // WebSocket connection to the server

//   // Handle editor content change
//   const handleEditorChange = (value: string | undefined) => {
//     if (value !== undefined) {
//       setEditorValue(value);
//       socket.emit('editorChange', { value });
//     }
//   };

//   // Handle cursor position change
//   const handleCursorChange = (event: any) => {
//     const position = event.position;
//     const userId = socket.id;
//     socket.emit('cursorChange', { position, userId });
//   };

//   // Handle typing event
//   const handleTyping = () => {
//     const userId = socket.id;
//     socket.emit('typing', { userId });
//   };

//   useEffect(() => {
//     // Listen for changes from other users
//     socket.on('editorChange', (data: { value: string }) => {
//       setEditorValue(data.value);
//     });

//     // Listen for cursor position changes from other users
//     socket.on('cursorChange', (data: { userId: string; position: { lineNumber: number; column: number } }) => {
//       setCursorPositions((prev) => {
//         const existing = prev.find((cursor) => cursor.userId === data.userId);
//         if (existing) {
//           existing.position = data.position;
//         } else {
//           prev.push({ userId: data.userId, position: data.position });
//         }
//         return [...prev];
//       });
//     });

//     // Listen for typing events from other users
//     socket.on('typing', (data: { userId: string }) => {
//       setTypingUsers((prev) => {
//         const existingUser = prev.find((user) => user.userId === data.userId);
//         if (existingUser) {
//           existingUser.isTyping = true;
//         } else {
//           prev.push({ userId: data.userId, isTyping: true });
//         }
//         return [...prev];
//       });
//     });

//     // Clean up on unmount
//     return () => {
//       socket.off('editorChange');
//       socket.off('cursorChange');
//       socket.off('typing');
//     };
//   }, []);

//   return {
//     editorValue,
//     cursorPositions,
//     typingUsers,
//     handleEditorChange,
//     handleCursorChange,
//     handleTyping,
//   };
// };
