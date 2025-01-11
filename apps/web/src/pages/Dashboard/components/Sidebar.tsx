import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className='dashboard-sidebar'>
      <h2>Dashboard</h2>
      <input type='text' placeholder='Enter Username' ></input>
      <button >Add Users</button>
    </div>
  );
};

export default Sidebar;
