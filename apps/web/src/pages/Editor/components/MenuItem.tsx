import React from 'react';

interface Props {
    children: string;
    onClick: () => void;
}

function MenuItem({ children, onClick }: Props) {
    const menuItemStyle: React.CSSProperties = {
        listStyleType: 'none',
        padding: '5px 10px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        backgroundColor: 'transparent',
        color: 'white',
    };

    return (
        <li style={menuItemStyle} onClick={onClick}>
            {children}
        </li>
    );
}

export default MenuItem;
