function Security() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>Encryption & Security</h1>

      <div>
        <h3>Security Status</h3>
        <p>Encryption Level: AES-256 Bit</p>
        <p>Algorithm: AES-256</p>
        <p>Status: Secure</p>
      </div>

      <div>
        <h3>Security Features</h3>
        <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
          <li>AES-256 File Encryption</li>
          <li>Password Protected Sharing</li>
          <li>Secure File Transfer</li>
          <li>Access Control</li>
          <li>Data Integrity Verification</li>
          <li>Encryption Key Management</li>
        </ul>
      </div>
    </div>
  );
}

export default Security;