import React from "react";

const NotificationBell = ({ count }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
      {/* Usando emoji para não depender de biblioteca externa */}
      <span style={{ fontSize: '20px' }}>🔔</span>
      
      {count > 0 && (
        <span style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          background: 'red',
          color: 'white',
          borderRadius: '50%',
          padding: '2px 6px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          {count}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
