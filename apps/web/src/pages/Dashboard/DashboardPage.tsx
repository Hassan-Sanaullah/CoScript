import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Workspaces from './components/Workspaces';
import './DashboardPage.css';
import socketIO from 'socket.io-client'; // Default import
import CustomButton from './components/CustomButton';

function DashboardPage() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    const [userInfo, setUserInfo] = useState<any | null>(null);
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const socket = useRef<any | null>(null); // for sending sockets as props
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        document.body.className = 'dashboard-page';
        return () => {
            document.body.className = '';
        };
    }, []);

    // Fetch user info from API
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`${apiUrl}/user/info`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;
                setUserInfo(data);
                setWorkspaces(
                    data.workspaces.map((workspace: any) => ({
                        id: workspace.id,
                        name: workspace.name,
                        role: workspace.role,
                        description: workspace.description,
                        updatedAt: workspace.updatedAt,
                    })),
                );

                if (data.userId) {
                    localStorage.setItem('user_id', data.id);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, [apiUrl]);

    // Handle socket connection and listen to events
    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            const newSocket = socketIO.connect(socketUrl, {
                transports: ['websocket'],
                query: { token },
                reconnectionDelayMax: 10000,
            });

            socket.current = newSocket;

            newSocket.on('connect', () => {
                console.log('Connected to WebSocket server');
                newSocket.emit('requestUserInfo', { userId });
            });

            // Listen for 'userInfo' event from socket and update user info
            newSocket.on('userInfo', (data: any) => {
                console.log('Received user info via socket:', data);
                setUserInfo(data);
                setWorkspaces(
                    data.workspaces.map((workspace: any) => ({
                        id: workspace.id,
                        name: workspace.name,
                        role: workspace.role,
                        description: workspace.description,
                        updatedAt: workspace.updatedAt,
                    })),
                );
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from WebSocket server');
            });

            return () => {
                socket.current?.disconnect();
            };
        }
    }, [socketUrl]);

    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                backgroundColor: 'black',
            }}
        >
            <div style={{ marginLeft: '0', padding: '20px', width: '100%' }}>
                {userInfo && <Header username={userInfo.username} />}
                <div className='projects-section'>
                    <h3>My Workspaces</h3>
                    {workspaces
                        .filter((ws) => ws.role === 'admin')
                        .map((workspace) => (
                            <Workspaces
                                key={workspace.id}
                                workspace={workspace}
                                userId={userInfo.id}
                                socket={socket.current}
                            />
                        ))}
                </div>
                <div className='projects-section'>
                    <h3>Joined Workspaces</h3>
                    {workspaces
                        .filter((ws) => ws.role !== 'admin')
                        .map((workspace) => (
                            <Workspaces
                                key={workspace.id}
                                workspace={workspace}
                                userId={userInfo.id}
                                socket={socket.current}
                            />
                        ))}
                </div>
                <CustomButton socket={socket.current} userId={localStorage.getItem('user_id')} />
            </div>
        </div>
    );
}

export default DashboardPage;
