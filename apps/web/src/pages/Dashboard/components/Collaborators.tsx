import React from 'react';

const Collaborators: React.FC = () => {
  return (
    <div className="collaborators-container">
      <h3 className="collaborators-title">Active Collaborators</h3>
      <div className="collaborator-item">
        <img src="https://via.placeholder.com/35" alt="User Avatar" className="collaborator-avatar" />
        <div>
          <div className="collaborator-name">Alice Smith</div>
          <div className="collaborator-status">Online</div>
        </div>
      </div>
      <div className="collaborator-item">
        <img src="https://via.placeholder.com/35" alt="User Avatar" className="collaborator-avatar" />
        <div>
          <div className="collaborator-name">Bob Johnson</div>
          <div className="collaborator-status">Online</div>
        </div>
      </div>
    </div>
  );
};

export default Collaborators;
