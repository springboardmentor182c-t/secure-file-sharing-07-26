import React from "react";
import LoginForm from "../features/authentication/components/LoginForm";

const Login = () => {
  return (
    <div style={styles.container}>
      <LoginForm />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#F5EBDD",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
};

export default Login;