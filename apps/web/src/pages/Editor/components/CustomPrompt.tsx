import React, { ReactNode, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: string,) => void;

// children = {heading, textbox title 1, textbox title 2 .....}
  children: ReactNode;
}

function CustomPrompt ({ isOpen, onClose, onSubmit ,children}: Props) {
  const [input, setInput] = useState('');
//   const [input2, setInput2] = useState('');
//   const [input3, setInput3] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(input);
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>{children}</h3>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={inputStyle}
        />
        {/* <input
          type="text"
          placeholder="Input 2"
          value={input2}
          onChange={(e) => setInput2(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Input 3"
          value={input3}
          onChange={(e) => setInput3(e.target.value)}
          style={inputStyle}
        /> */}
        <div style={buttonContainerStyle}>
          <button onClick={handleSubmit} style={buttonStyle}>Submit</button>
          <button onClick={onClose} style={buttonStyle}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Simple inline styles
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'black',
  padding: '20px',
  borderRadius: '8px',
  width: '300px',
  textAlign: 'center',
  color: "white"
};

const inputStyle: React.CSSProperties = {
  margin: '10px 0',
  padding: '8px',
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: '4px',
  border: '1px solid #ccc',
  backgroundColor: 'black',
  color: 'white'
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '4px',
  backgroundColor: '#a0332c',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
};

export default CustomPrompt;
