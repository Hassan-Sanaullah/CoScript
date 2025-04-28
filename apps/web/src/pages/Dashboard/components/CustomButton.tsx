import { useState } from 'react';
import CustomPrompt from './CustomPrompt';
import CustomPrompt2 from './CustomPrompt2';

interface Props {
    socket: any;
    userId: string | null;
}

function CustomButton({ socket, userId }: Props) {
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [isJoinWorkspace, setIsJoinWorkspace] = useState(false); // State to determine whether it's for creating or joining workspace

    // Handle button click to show either create or join workspace prompt
    const handleWorkspaceClick = (isJoin: boolean) => {
        setIsJoinWorkspace(isJoin);
        setIsPromptOpen(true); // Open prompt after setting state
    };

    // Handle workspace creation prompt submission
    const handleCreatePromptSubmit = (workspaceName: string, workspaceDescription: string) => {
        console.log('Submitted data for create workspace:', { workspaceName, workspaceDescription });

        if (socket) {
            socket.emit('createWorkspace', { userId: userId, name: workspaceName, description: workspaceDescription });
            console.log('Create workspace request sent via socket:', { workspaceName });
        }
    };

    // Handle join workspace prompt submission
    const handleJoinPromptSubmit = (workspaceId: string) => {
        console.log('Submitted data for join workspace:', { workspaceId });

        if (socket) {
            socket.emit('addMemberWorkspace', { userId: userId, workspaceId });
            console.log('Join workspace request sent via socket:', { workspaceId });
        }
    };

    return (
        <>
            <button className='create-workspace-button' onClick={() => handleWorkspaceClick(false)}>
                Create Workspace
            </button>
            <button className='create-workspace-button' onClick={() => handleWorkspaceClick(true)}>
                Join Workspace
            </button>

            {/* Show CustomPrompt for creating a workspace */}
            {isJoinWorkspace === false && (
                <CustomPrompt
                    isOpen={isPromptOpen}
                    onClose={() => setIsPromptOpen(false)}
                    onSubmit={handleCreatePromptSubmit}
                >
                    {'Enter Workspace name and description'}
                </CustomPrompt>
            )}

            {/* Show CustomPrompt2 for joining a workspace */}
            {isJoinWorkspace === true && (
                <CustomPrompt2
                    isOpen={isPromptOpen}
                    onClose={() => setIsPromptOpen(false)}
                    onSubmit={handleJoinPromptSubmit}
                >
                    {'Enter Invite Code'}
                </CustomPrompt2>
            )}
        </>
    );
}

export default CustomButton;
