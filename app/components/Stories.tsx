"use client";
export default function Stories() {
  const users = ["You","arjun","sweety","rahul","priya","vizag","hyd","ani","tej"];
  return (
    <div style={{ display: "flex", gap: "16px", padding: "12px", overflowX: "auto", borderBottom: "1px solid #f4f4f5", background: "white" }}>
      {users.map((u,i)=>(
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: "58px" }}>
          <div style={{ width: "58px", height: "58px", borderRadius: "50%", background: "linear-gradient(45deg,#FF8A00,#FF3A00,#C700B1)", padding: "2px" }}>
            <div style={{ width: "100%", height: "100%", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>{u[0].toUpperCase()}</div>
          </div>
          <span style={{ fontSize: "11px" }}>{u}</span>
        </div>
      ))}
    </div>
  );
}
