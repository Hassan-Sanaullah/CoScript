import { useEffect, useState } from 'react';
import MenuItem from './MenuItem';
import CustomPrompt from './CustomPrompt';

interface Props {
    workspaceFiles: any[];
    currentFile: string;
    fetchFilesList: any;
    workspaceId: string | undefined;
    socket: any; // Receive socket connection from EditorPage
}

function MenuBar({ workspaceFiles, currentFile, fetchFilesList, workspaceId, socket }: Props) {
    const [menuAction, setMenuAction] = useState<string>('');
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    // For creating files and folders
    const handlePromptSubmit = (input: string) => {
        console.log('Submitted data:', { input });

        let parentFolder: string;
        if (workspaceFiles.find((file) => file.filename === currentFile)?.type === 'folder') {
            parentFolder = currentFile;
        } else {
            parentFolder = workspaceFiles.find((file) => file.filename === currentFile)?.parentFolder || '';
        }
        console.log('Parent folder  ', parentFolder);

        if (socket && workspaceId) {
            socket.emit('createFile', {
                workspaceId,
                filename: input,
                type: menuAction,
                parentFolder,
            });
            console.log('Create file/folder request sent via socket:', {
                workspaceId,
                filename: input,
                type: menuAction,
                parentFolder,
            });
        }
    };

    // Handle delete file/folder with confirmation
    const handleDeleteFile = () => {
        // Show browser confirmation popup
        const confirmDelete = window.confirm(`Are you sure you want to delete the file/folder "${currentFile}"?`);

        if (confirmDelete) {
            console.log('Delete file/folder request sent via socket:', {
                workspaceId,
                filename: currentFile,
            });

            if (socket && workspaceId) {
                socket.emit('deleteFile', {
                    workspaceId,
                    filename: currentFile,
                });
            }
        } else {
            console.log('Delete operation cancelled');
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('fileCreated', (newFile: any) => {
                console.log('New file/folder created:', newFile);
                fetchFilesList(); // Refresh file list after creation
            });

            return () => {
                socket.off('fileCreated');
            };
        }
    }, [socket, fetchFilesList]);

    return (
        <>
            <MenuItem
                onClick={() => {
                    setIsPromptOpen(true);
                    setMenuAction('file');
                }}
            >
                New File
            </MenuItem>
            <MenuItem
                onClick={() => {
                    setIsPromptOpen(true);
                    setMenuAction('folder');
                }}
            >
                New Folder
            </MenuItem>
            <MenuItem
                onClick={() => {
                    setMenuAction('delete');
                    handleDeleteFile();
                }}
            >
                Delete Folder
            </MenuItem>

            <CustomPrompt isOpen={isPromptOpen} onClose={() => setIsPromptOpen(false)} onSubmit={handlePromptSubmit}>
                {'Enter file name'}
            </CustomPrompt>
        </>
    );
}

export default MenuBar;
