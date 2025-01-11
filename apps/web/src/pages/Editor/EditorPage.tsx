import MyMonacoEditor from "./components/MyMonacoEditor";
import "./EditorPage.css";
import Sidebar from "./components/Sidebar";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import MenuBar from "./components/MenuBar";
import socketIO from "socket.io-client";

function EditorPage() {
    const { id, userId } = useParams(); // Workspace ID
    const [files, setFiles] = useState<any[]>([]);
    const [fileId, setFileId] = useState<number | null>(null);
    const [fileContent, setFileContent] = useState<any[]>([]);
    const [currentFileInfo, setCurrentFileInfo] = useState<string>("");
    const socket = useRef<any | null>(null);
    const [socketReady, setSocketReady] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState<[]>([]);

    const socketUrl = import.meta.env.VITE_SOCKET_URL;

    useEffect(() => {
        document.body.className = "editor-page";
        return () => {
            document.body.className = "";
        };
    }, []);

    // Fetch content of the selected file
    const fetchFileCode = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/editor/code/${fileId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "access_token"
                        )}`,
                    },
                }
            );
            const data = await response.json();
            setFileContent(data);
            console.log('file content: ', fileContent)
            setCurrentFileInfo(
                files.find((file) => file.id === fileId)?.filename || ""
            );
        } catch (error) {
            console.error("Error fetching file content:", error);
        }
    };

    // Fetch file content when fileId changes
    useEffect(() => {
        if (fileId !== null) {
            fetchFileCode();
        }
    }, [fileId]);

    // Handle file selection
    const handleFileId = (data: number) => {
        setFileId(data);
    };

    // Initialize socket connection and fetch files list using socket
    useEffect(() => {
        if (id) {
            const newSocket = socketIO.connect(socketUrl, {
                transports: ["websocket"],
                reconnectionDelayMax: 10000,
            });

            socket.current = newSocket;

            newSocket.on("connect", () => {
                console.log(
                    `${userId} Connected to WebSocket server with ID: ${newSocket.id}`
                );
                newSocket.emit("joinWorkspace", { workspaceId: id, userId: userId});

                // Request the list of files after joining the workspace
                newSocket.emit("getFiles", { workspaceId: id });
                setSocketReady(true);
            });

            // newSocket.emit('usersConnected', {userId: userId});
            // Listen for new users joining workspace
            newSocket.on("usersConnected", (data: any) => {
                console.log(`user ${data} joined the workspace ${id}`);
                setConnectedUsers(data);
            })

            // Listen for files list
            newSocket.on("filesList", (updatedFiles: any) => {
                console.log("Updated files list:", updatedFiles);
                setFiles(updatedFiles); // Update the state with the new files list
            });

            newSocket.on("disconnect", () => {

                newSocket.emit('leaveWorkspace', {workspaceId:id, userId: userId});
                setSocketReady(false);
            });

            return () => {
                newSocket.off("filesList");
                newSocket.emit('leaveWorkspace', {workspaceId:id, userId: userId});
                setSocketReady(false);
                newSocket.disconnect();
                console.log("Disconnected from WebSocket...");
            };
        }
    }, [id]);

    return (
        <>
            <div className="header">CoScript</div>
            <div className="menu">
                <MenuBar
                    workspaceFiles={files}
                    currentFile={currentFileInfo}
                    workspaceId={id}
                    fetchFilesList={() =>
                        socket.current?.emit("getFiles", { workspaceId: id })
                    }
                    socket={socket.current}
                ></MenuBar>
                <div className="workspace-info">{currentFileInfo}</div>
            </div>

            <div className="editor-div">
                <Sidebar
                    files={files}
                    sendDataToEditorPage={handleFileId}
                    connectedUsers={connectedUsers}
                ></Sidebar>

                <div className="editor">
                    {socketReady && socket.current && (
                        <MyMonacoEditor
                            content={fileContent}
                            workspaceId={id}
                            fileId={fileId}
                            socket={socket.current} // Pass socket connection here
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default EditorPage;
