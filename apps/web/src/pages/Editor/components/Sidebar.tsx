import FileLabel from "./FileLabel";

interface FileItem {
    id: number;
    workspaceId: number;
    userId: number;
    filename: string;
    type: string;
    parentFolder: string;
    createdAt: string;
    updatedAt: string;
}

interface Props {
    files: FileItem[];
    sendDataToEditorPage: (fileId: number) => void;
    connectedUsers: []
}

function Sidebar({ files = [], sendDataToEditorPage, connectedUsers }: Props) {
    
    return (
        <div className="sidebar">
            <div className="explorer">
                <div className="sidebar-heading">Explorer</div>

                {files.map((file: any) => (
                    <FileLabel
                        key={file.id}
                        fileId={file.id}
                        type={file.type}
                        parent={file.parentFolder}
                        sendDataToSidebar={sendDataToEditorPage} 
                    >
                        {file.filename}
                    </FileLabel>
                ))}
            </div>
            <div className="connections">
                <div className="sidebar-heading">Connections</div>
                {connectedUsers.map((user, index) => (
                <p key={index}>{user}</p>
    ))}
            </div>
        </div>
    );
}

//fetch this from backend and delete this
// ADD FILE DEPTH FOR PARENT-CHILD FOLDER RELATION
/*const fileHierarchy: { name: string; type: string; parent: string }[] = [
    { name: "src", type: "folder", parent: "none" },
    { name: "components", type: "folder", parent: "src" },
    { name: "button.tsx", type: "file", parent: "components" },
    { name: "index.html", type: "file", parent: "src" },
    { name: "project.js", type: "file", parent: "src" },
    { name: "assets", type: "folder", parent: "none" },
    { name: "logo.jpg", type: "file", parent: "assets" },
];
*/

export default Sidebar;
