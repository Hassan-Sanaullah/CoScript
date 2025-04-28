import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaSignOutAlt } from 'react-icons/fa'; // Import the "Leave" icon (Sign Out)
import CustomPrompt from './CustomPrompt';

interface Props {
    workspace: {
        id: number;
        name: string;
        description: string;
        updatedAt: string;
        role: string;
    };
    userId: number;
    socket: any;
}

function Workspaces({ workspace, userId, socket }: Props) {
    const { id, name, description, updatedAt, role } = workspace;
    const [timeAgo, setTimeAgo] = useState('');
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    useEffect(() => {
        const calculateTimeAgo = () => {
            // Parse the input date string and calculate the distance to now
            const distance = formatDistanceToNow(new Date(updatedAt), {
                addSuffix: true,
            });
            setTimeAgo(distance);
        };

        calculateTimeAgo();
        const intervalId = setInterval(calculateTimeAgo, 60000);

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [updatedAt]);

    const navigate = useNavigate();

    const handleWorkspaceClick = (workspaceId: number) => {
        navigate(`/editor/${workspaceId}/${userId}`);
    };

    const handleWorkspaceDelete = (workspaceId: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this workspace?');
        if (confirmDelete) {
            socket.emit('deleteWorkspace', { userId: userId, workspaceId: workspaceId });
            console.log('Deleting workspace:', workspaceId);
        }
    };

    const handleWorkspaceLeave = (workspaceId: number) => {
        const confirmLeave = window.confirm('Are you sure you want to leave this workspace?');
        if (confirmLeave) {
            socket.emit('removeWorkspace', { userId: userId, workspaceId: workspaceId });
            console.log('Leaving workspace:', workspaceId);
        }
    };

    const handleWorkspaceEdit = () => {
        setIsPromptOpen(true);
    };

    const handlePromptSubmit = (input1: string, input2: string) => {
        console.log('Submitted data:', { input1, input2 });

        if (socket) {
            socket.emit('editWorkspace', { userId: userId, workspaceId: id, name: input1, description: input2 });
            console.log('Edit workspace request sent via socket:', { name: input1 });
        }
    };

    return (
        <>
            <div className='project-card'>
                <div className='project-info' onClick={() => handleWorkspaceClick(id)}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{name}</div>
                    <div style={{ fontSize: '14px', overflow: 'hidden' }}>{description}</div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Last updated: {timeAgo}</div>
                </div>
                <div className='button-container'>
                    {role === 'admin' && (
                        <button className='workspace-buttons' onClick={() => handleWorkspaceEdit()}>
                            <FaEdit />
                        </button>
                    )}
                    {role === 'admin' ? (
                        <button className='workspace-buttons' onClick={() => handleWorkspaceDelete(id)}>
                            <FaTrash />
                        </button>
                    ) : (
                        <button className='workspace-buttons' onClick={() => handleWorkspaceLeave(id)}>
                            <FaSignOutAlt />
                        </button>
                    )}
                </div>
            </div>

            <CustomPrompt isOpen={isPromptOpen} onClose={() => setIsPromptOpen(false)} onSubmit={handlePromptSubmit}>
                {'Enter Workspace name'}
            </CustomPrompt>
        </>
    );
}

export default Workspaces;
