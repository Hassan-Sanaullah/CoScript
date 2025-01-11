import { useEffect, useState } from "react";
import MenuItem from "./MenuItem";
import CustomPrompt from "./CustomPrompt";

interface Props {
    workspaceFiles: any[];
    currentFile: string;
    fetchFilesList: any;
    workspaceId: string | undefined;
    socket: any; // Receive socket connection from EditorPage
}

function MenuBar({
    workspaceFiles,
    currentFile,
    fetchFilesList,
    workspaceId,
    socket,
}: Props) {
    const [menuAction, setMenuAction] = useState<string>("");
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    //const [requestData, setRequestData] = useState<object>({});

    const handlePromptSubmit = (input: string) => {
        console.log("Submitted data:", { input });

        let parentFolder: string;
        if (
            workspaceFiles.find((file) => file.filename === currentFile)
                ?.type === "folder"
        ) {
            parentFolder = currentFile;
        } else {
            parentFolder =
                workspaceFiles.find((file) => file.filename === currentFile)
                    ?.parentFolder || "";
        }
        // setRequestData({
        //     workspaceId: workspaceId,
        //     filename: input,
        //     type: menuAction,
        //     parentFolder: parentFolder,
        // });
        console.log("Parent folder  ", parentFolder);

        
        if (socket && workspaceId) {
            socket.emit("createFile", {
                workspaceId,
                filename: input,
                type: menuAction,
                parentFolder,
            });
            console.log("Create file/folder request sent via socket:", {
                workspaceId,
                filename: input,
                type: menuAction,
                parentFolder,
            });
        }
    };

    
    useEffect(() => {
        if (socket) {
            socket.on("fileCreated", (newFile: any) => {
                console.log("New file/folder created:", newFile);
                fetchFilesList(); // Refresh file list after creation
            });

            return () => {
                socket.off("fileCreated");
            };
        }
    }, [socket, fetchFilesList]);

    return (
        <>
            <MenuItem
                options={[
                    {
                        label: "New File",
                        onClick: () => {
                            setIsPromptOpen(true);
                            setMenuAction("file");
                        },
                    },
                    {
                        label: "New Folder",
                        onClick: () => {
                            setIsPromptOpen(true);
                            setMenuAction("folder");
                        },
                    },
                    {
                        label: "Delete file",
                        onClick: () => {
                            setMenuAction("delete");
                        },
                    },
                ]}
            >
                File
            </MenuItem>
            <MenuItem
                options={[
                    { label: "Undo", onClick: () => setMenuAction("Undo") },
                    { label: "Redo", onClick: () => setMenuAction("Redo") },
                ]}
            >
                Edit
            </MenuItem>
            <MenuItem
                options={[
                    {
                        label: "Zoom In",
                        onClick: () => console.log("Zoom In"),
                    },
                    {
                        label: "Zoom Out",
                        onClick: () => console.log("Zoom Out"),
                    },
                ]}
            >
                View
            </MenuItem>
            <MenuItem
                options={[
                    { label: "About", onClick: () => console.log("About") },
                    {
                        label: "Help Center",
                        onClick: () => console.log("Help Center"),
                    },
                ]}
            >
                Help
            </MenuItem>
            <CustomPrompt
                isOpen={isPromptOpen}
                onClose={() => setIsPromptOpen(false)}
                onSubmit={handlePromptSubmit}
            >
                {"Enter file name"}
            </CustomPrompt>
        </>
    );
}

export default MenuBar;
