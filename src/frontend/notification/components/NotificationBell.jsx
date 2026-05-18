import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : "http://localhost:5000/api";

const NotificationBell = ({ count: countProp }) => {
  const [count, setCount] = useState(countProp ?? 0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API}/notifications/unread-count`);
        if (!res.ok) return;
        const data = await res.json();
        setCount(data.count ?? 0);
      } catch {
        // backend fora do ar — mantém o último valor
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block", cursor: "pointer" }}>
      <span style={{ fontSize: "20px" }}>🔔</span>
      {count > 0 && (
        <span style={{
          position: "absolute",
          top: "-5px",
          right: "-5px",
          background: "red",
          color: "white",
          borderRadius: "50%",
          padding: "2px 6px",
          fontSize: "10px",
          fontWeight: "bold",
          minWidth: "18px",
          textAlign: "center",
        }}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
