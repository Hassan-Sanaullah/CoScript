import { Editor, type Monaco } from '@monaco-editor/react';
import GitHubDarkClassic from '../themes/githubDarkClassic.json';
import { useEffect, useState, useRef } from 'react';

interface FileContent {
    id: number;
    fileId: number;
    userId: number;
    lineNo: number;
    code: string;
    language: string;
    createdAt: string;
}

interface Props {
    content: FileContent[]; // The initial content passed as a prop
    workspaceId: string | undefined;
    fileId: number | null;
    socket: any;
}

function MyMonacoEditor({ content = [], workspaceId, fileId, socket }: Props) {
    const [editorContent, setEditorContent] = useState<string>('');
    const [language, setLanguage] = useState<string>('typescript');
    const editorRef = useRef<any>(null);
    const applyingRemoteUpdate = useRef(false);

    // Helper to concatenate snippets into a single string
    const getFileContent = (snippets: FileContent[]) => {
        if (!Array.isArray(snippets)) {
            console.error('Expected snippets to be an array but received:', snippets);
            return '';
        }
        return snippets
            .sort((a, b) => a.lineNo - b.lineNo)
            .map((snippet) => snippet.code)
            .join('\n');
    };

    // Update editor content and language when content prop changes
    useEffect(() => {
        const newContent = getFileContent(content);
        setEditorContent(newContent);
        setLanguage(content.length > 0 ? content[0].language : 'typescript');
    }, [content]);

    // Configure and mount Monaco editor
    const handleEditorDidMount = (monaco: Monaco) => {
        monaco.editor.defineTheme('GitHubDarkClassic', {
            base: 'vs-dark',
            inherit: true,
            ...GitHubDarkClassic,
        });
    };

    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;
    };

    // Listen for remote changes from other users
    useEffect(() => {
        if (!socket || !workspaceId || fileId === null) return;

        socket.on('receiveChange', (data: { workspaceId: string; fileId: number; text: string }) => {
            // Only update content if the workspaceId and fileId match
            console.log(data);
            if (data.workspaceId === workspaceId && data.fileId === fileId) {
                const editor = editorRef.current;
                if (!editor || applyingRemoteUpdate.current) return;

                const currentContent = editor.getValue();
                if (currentContent !== data.text) {
                    applyingRemoteUpdate.current = true;
                    editor.executeEdits(null, [
                        {
                            range: editor.getModel().getFullModelRange(),
                            text: data.text,
                        },
                    ]);
                    applyingRemoteUpdate.current = false;
                }
            }
        });

        return () => {
            socket.off('receiveChange');
        };
    }, [socket, workspaceId, fileId]);

    // Switch file when fileId prop changes
    useEffect(() => {
        if (fileId !== null && socket && workspaceId) {
            socket.emit('switchFile', { workspaceId, fileId });
            console.log(`Switched to file: ${fileId} in workspace: ${workspaceId}`);
        }
    }, [fileId, workspaceId, socket]);

    // Emit code changes to the WebSocket
    const handleCodeChange = (newCode: string) => {
        if (applyingRemoteUpdate.current) return; // Skip emitting changes triggered by remote updates

        if (socket && workspaceId && fileId !== null) {
            const editor = editorRef.current;
            if (editor) {
                // Get the cursor position
                const cursorPosition = editor.getPosition(); // { lineNumber, column }
                const lineNo = cursorPosition ? cursorPosition.lineNumber : 1; // Default to line 1 if undefined

                console.log('Emitting change to WebSocket:', {
                    workspaceId,
                    fileId,
                    lineNo,
                    code: newCode,
                    language: language,
                });

                // Emit the change with the line number
                socket.emit('sendChange', {
                    workspaceId: workspaceId,
                    fileId: fileId,
                    lineNo: lineNo,
                    code: newCode,
                    language: language,
                });
            }
        }
    };

    return (
        <Editor
            width='100%'
            height='93vh'
            language={language}
            value={editorContent}
            theme='GitHubDarkClassic'
            beforeMount={handleEditorDidMount}
            onMount={handleEditorMount}
            onChange={(value:any) => {
                if (value !== editorContent) {
                    setEditorContent(value || '');
                    handleCodeChange(value || '');
                }
            }}
            options={{
                fontSize: 14,
                fontFamily: 'Jetbrains-Mono',
                fontLigatures: true,
                wordWrap: 'on',
                minimap: { enabled: true },
                bracketPairColorization: { enabled: true },
                cursorBlinking: 'expand',
                formatOnPaste: true,
                suggest: { showFields: false, showFunctions: false },
            }}
        />
    );
}

export default MyMonacoEditor;
