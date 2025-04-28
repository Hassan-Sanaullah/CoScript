import { getFileIcon } from './Icons';
import { FaFolder } from 'react-icons/fa';

interface Props {
    fileId: number;
    type: string;
    parent: string;
    children: string;

    sendDataToSidebar: (id: number) => void;
}

function FileLabel({ fileId, type, parent, children, sendDataToSidebar }: Props) {
    // Extract the file extension from the file name
    const extension: string | undefined = children.split('.').pop();

    const handleClick = () => {
        sendDataToSidebar(fileId);
    };

    const style = {
        listStyleType: 'none',
        textIndent: '0px',
        width: '100%',
    };

    if (parent !== '') {
        style.textIndent = '20px';
    }

    return (
        <li style={style} className='filelabel' onClick={handleClick}>
            {type === 'file' ? getFileIcon(extension) : <FaFolder title='Folder' />}
            {'  ' + children}
        </li>
    );
}

export default FileLabel;
