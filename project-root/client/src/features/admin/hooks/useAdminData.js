import { useEffect, useState } from "react";
import { adminAPI, auditAPI } from "../../../utils/api";

export default function useAdminData(user, navigate) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    Promise.all([
      adminAPI.listUsers(),
      auditAPI.list(50),
    ])
      .then(([u, l]) => {
        setUsers(u.data);
        setLogs(l.data);
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  return {
    users,
    setUsers,
    logs,
    loading,
  };
}