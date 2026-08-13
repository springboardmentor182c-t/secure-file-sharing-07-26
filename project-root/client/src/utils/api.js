import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────
// Attach JWT token automatically
// ─────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ─────────────────────────────────────────────
// Handle expired token
// ─────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem("refresh_token");


      if (refreshToken) {

        try {

          const response = await axios.post(
            `${BASE_URL}/api/auth/refresh`,
            {
              refresh_token: refreshToken,
            }
          );


          localStorage.setItem(
            "access_token",
            response.data.access_token
          );


          localStorage.setItem(
            "refresh_token",
            response.data.refresh_token
          );


          originalRequest.headers.Authorization =
            `Bearer ${response.data.access_token}`;


          return api(originalRequest);


        } catch (err) {

          localStorage.clear();
          window.location.href = "/login";

        }

      }

    }

    return Promise.reject(error);
  }
);



// ─────────────────────────────────────────────
// Error helper
// ─────────────────────────────────────────────

// Turns an axios failure into something worth showing a user. Without this,
// an unreachable API (no `err.response`) falls through to whatever fallback
// the caller passed — e.g. "Invalid email or password" when the real problem
// is that nothing is serving the backend.

export const getApiError = (err, fallback = "Something went wrong.") => {

  if (!err?.response) {
    return `Cannot reach the server at ${BASE_URL}. Make sure the backend is running.`;
  }

  const detail = err.response.data?.detail;

  if (typeof detail === "string") return detail;

  // FastAPI validation errors arrive as a list of {loc, msg, type}
  if (Array.isArray(detail) && detail.length) {
    return detail[0]?.msg || fallback;
  }

  return fallback;
};


// ─────────────────────────────────────────────
// AUTH APIs
// ─────────────────────────────────────────────

export const authAPI = {


  signup: (
    name,
    email,
    password
  ) => {

    return api.post(
      "/api/auth/signup",
      {
        name,
        email,
        password,
      }
    );

  },


  login: (
    email,
    password
  ) => {

    return api.post(
      "/api/auth/login",
      {
        email,
        password,
      }
    );

  },


  forgotPassword: (email) =>
    api.post(
      "/api/auth/forgot-password",
      {
        email,
      }
    ),


  resetPassword: (reset_token, new_password) =>
    api.post(
      "/api/auth/reset-password",
      {
        reset_token,
        new_password,
      }
    ),


  me: () =>
    api.get("/api/auth/me"),


  logout: () =>
    api.post("/api/auth/logout"),



  mfaSetup: () =>
    api.post("/api/auth/mfa/setup"),



  mfaEnable: (code) =>
    api.post(
      "/api/auth/mfa/enable",
      {
        code,
      }
    ),



  mfaDisable: (code) =>
    api.post(
      "/api/auth/mfa/disable",
      {
        code,
      }
    ),



  mfaVerify: (
    mfa_token,
    code
  ) =>
    api.post(
      "/api/auth/mfa/verify",
      {
        mfa_token,
        code,
      }
    ),

};



// ─────────────────────────────────────────────
// FILE APIs
// ─────────────────────────────────────────────

export const filesAPI = {

  list: (folderId) =>
    api.get(
      "/api/files/",
      {
        params:{
          folder_id: folderId
        }
      }
    ),

  upload: (
    formData,
    folderId,
    encrypted,
    mimetype,
    onProgress
  ) =>
    api.post(
      "/api/files/upload",
      formData,
      {
        params: { folder_id: folderId, encrypted, mimetype },
        headers:{
          "Content-Type":
          "multipart/form-data",
        },

        onUploadProgress:(event)=>{

          if(onProgress){

            const percent =
              Math.round(
                (event.loaded * 100) /
                event.total
              );

            onProgress(percent);

          }

        },

      }
    ),


  get:(id)=>
    api.get(`/api/files/${id}`),


  download:(id)=>
    api.get(
      `/api/files/${id}/download`,
      {
        responseType:"blob",
      }
    ),


  delete:(id)=>
    api.delete(`/api/files/${id}`),

  toggleEncrypt: (id) => api.patch(`/api/files/${id}/encrypt`),

};



// ─────────────────────────────────────────────
// FOLDER APIs
// ─────────────────────────────────────────────

export const foldersAPI = {


  list:(parentId)=>
    api.get(
      "/api/folders/",
      {
        params:{
          parent_id:parentId
        }
      }
    ),


  create:(name,parentId)=>
    api.post(
      "/api/folders/",
      {
        name,
        parent_id:parentId,
      }
    ),


  delete:(id)=>
    api.delete(
      `/api/folders/${id}`
    ),

};



// ─────────────────────────────────────────────
// SHARING APIs
// ─────────────────────────────────────────────

export const sharesAPI = {
  list: () =>
    api.get("/api/shares/"),

  create: (data) =>
    api.post("/api/shares/", data),

  revoke: (id) =>
    api.delete(`/api/shares/${id}`),

  getInfo: (token) =>
    api.get(`/api/shares/info/${token}`),

  verifyPassword: (token, password) =>
    api.post(`/api/shares/verify/${token}`, { password }),

  downloadPublic: (token, password) =>
    api.get(`/api/shares/download/${token}`, {
      params: password ? { password } : {},
      responseType: "blob",
    }),

  access: (token, password) =>
    api.get(`/api/shares/access/${token}`, {
      params: password ? { password } : {},
    }),
};




// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export const notificationsAPI = {


  list:(params = {}) =>
    api.get(
      "/api/notifications/",
      {
        params,
      }
    ),


  summary:() =>
    api.get("/api/notifications/summary"),


  create:(data)=>
    api.post(
      "/api/notifications/",
      data
    ),


  markRead:(id)=>
    api.patch(
      `/api/notifications/${id}/read`
    ),


  markAllRead:(type)=>
    api.patch(
      "/api/notifications/read-all",
      null,
      {
        params: type ? { type } : {},
      }
    ),


  delete:(id)=>
    api.delete(
      `/api/notifications/${id}`
    ),


  clear:(readOnly = false) =>
    api.delete(
      "/api/notifications/",
      {
        params:{
          read_only: readOnly,
        },
      }
    ),

};



// ─────────────────────────────────────────────
// Encryption
// ─────────────────────────────────────────────

export const encryptionAPI = {

  dashboard: () =>
    api.get("/api/encryption/dashboard"),

  encrypt: (plaintext) =>
    api.post(
      "/api/encryption/encrypt",
      {
        plaintext,
      }
    ),

  decrypt: (ciphertext) =>
    api.post(
      "/api/encryption/decrypt",
      {
        ciphertext,
      }
    ),

};



// ─────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────

export const analyticsAPI = {

  summary:() =>
    api.get(
      "/api/analytics/summary"
    ),

};



// ─────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────

export const adminAPI = {


  stats:() =>
    api.get(
      "/api/admin/stats"
    ),


  listUsers:(params = {}) =>
    api.get(
      "/api/admin/users",
      {
        params,
      }
    ),


  inviteUser:(data)=>
    api.post(
      "/api/admin/users/invite",
      data
    ),


  updateUser:(id,data)=>
    api.patch(
      `/api/admin/users/${id}`,
      data
    ),


  deleteUser:(id)=>
    api.delete(
      `/api/admin/users/${id}`
    ),


  listRoles:() =>
    api.get(
      "/api/admin/roles"
    ),


  storage:() =>
    api.get(
      "/api/admin/storage"
    ),


  auditLogs:(limit=50)=>
    api.get(
      "/api/admin/audit-logs",
      {
        params:{
          limit
        }
      }
    ),

};



// ─────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────

export const auditAPI = {


  list:(params = {}) =>
    api.get(
      "/api/audit/",
      {
        params,
      }
    ),


  stats:() =>
    api.get("/api/audit/stats"),


  exportCsv:(params = {}) =>
    api.get(
      "/api/audit/export",
      {
        params,
        responseType:"blob",
      }
    ),


  listBlockedIps:() =>
    api.get("/api/audit/blocked-ips"),


  blockIp:(ip_address, reason)=>
    api.post(
      "/api/audit/blocked-ips",
      {
        ip_address,
        reason,
      }
    ),


  unblockIp:(ip)=>
    api.delete(
      `/api/audit/blocked-ips/${ip}`
    ),

};



export default api;
