import { useState } from 'react';
import CustomPrompt from './CustomPrompt';

interface Props {
    socket: any;
    userId: string | null;
}

function Sidebar({ socket, userId }: Props) {
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    const handleCreateWorkspaceClick = () => {
        setIsPromptOpen(true);
    };

    const handlePromptSubmit = (input1: string, input2: string) => {
        console.log('Submitted data:', { input1, input2 });

        if (socket) {
            socket.emit('createWorkspace', { userId: userId, name: input1, description: input2 });
            console.log('Create workspace request sent via socket:', { name: input1 });
        }
    };

    return (
        <div className='dashboard-sidebar'>
            <h2>Dashboard</h2>
            <button onClick={handleCreateWorkspaceClick}>Create Workspace</button>
            <button>Delete Workspace</button>

            <CustomPrompt isOpen={isPromptOpen} onClose={() => setIsPromptOpen(false)} onSubmit={handlePromptSubmit}>
                {'Enter Workspace name'}
            </CustomPrompt>
        </div>
    );
}

export default Sidebar;
