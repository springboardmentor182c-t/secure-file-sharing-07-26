function Security() {
  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          color: "#1e3a8a",
          marginBottom: "25px",
          fontSize: "36px",
          fontWeight: "700",
        }}
      >
        🔒 Encryption & Security
      </h1>

      {/* Security Status Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "15px",
          padding: "25px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ color: "#2563eb", marginBottom: "20px" }}>
          Security Status
        </h2>

        <p><strong>Encryption Level:</strong> AES-256 Bit</p>
        <p><strong>Algorithm:</strong> AES-256</p>

        <p>
          <strong>Status:</strong>
          <span
            style={{
              color: "green",
              fontWeight: "bold",
              marginLeft: "8px",
            }}
          >
            ✅ Secure
          </span>
        </p>

        <p>
          <strong>Security Score:</strong>
          <span
            style={{
              color: "#2563eb",
              fontWeight: "bold",
              marginLeft: "8px",
            }}
          >
            100%
          </span>
        </p>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1",
            minWidth: "180px",
            background: "#ffffff",
            borderRadius: "15px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ color: "#2563eb" }}>256 Bit</h2>
          <p>Encryption Strength</p>
        </div>

        <div
          style={{
            flex: "1",
            minWidth: "180px",
            background: "#ffffff",
            borderRadius: "15px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ color: "green" }}>100%</h2>
          <p>Security Score</p>
        </div>

        <div
          style={{
            flex: "1",
            minWidth: "180px",
            background: "#ffffff",
            borderRadius: "15px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ color: "#f59e0b" }}>24/7</h2>
          <p>Monitoring</p>
        </div>
      </div>

      {/* Security Features Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "15px",
          padding: "25px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ color: "#2563eb", marginBottom: "20px" }}>
          Security Features
        </h2>

        <ul
          style={{
            paddingLeft: "25px",
            lineHeight: "2.2",
          }}
        >
          <li>🔐 AES-256 File Encryption</li>
          <li>🔑 Password Protected Sharing</li>
          <li>📁 Secure File Transfer</li>
          <li>🛡️ Access Control</li>
          <li>✔️ Data Integrity Verification</li>
          <li>🔒 Encryption Key Management</li>
        </ul>
      </div>
    </div>
  );
}

export default Security;