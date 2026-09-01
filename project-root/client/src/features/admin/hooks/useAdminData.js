import { useEffect, useState } from "react";
import { adminAPI, auditAPI } from "../../../utils/api";

export default function useAdminData(user, navigate) {
const [users, setUsers] = useState([]);
const [logs, setLogs] = useState([]);
const [stats, setStats] = useState({});
const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    Promise.all([
  adminAPI.stats(),
  adminAPI.listUsers(),
  auditAPI.list(50),
])
.then(([s, u, l]) => {
  setStats(s.data);
  console.log("Stats API Response:", s.data);
  setUsers(u.data);
  setLogs(l.data);
})
      .finally(() => setLoading(false));
  }, [user, navigate]);
  
return {
  stats,
  users,
  setUsers,
  logs,
  loading,
};
}