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
    onProgress
  ) =>
    api.post(
      "/api/files/upload",
      formData,
      {
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


  list:() =>
    api.get("/api/shares/"),


  create:(data)=>
    api.post(
      "/api/shares/",
      data
    ),


  revoke:(id)=>
    api.delete(
      `/api/shares/${id}`
    ),


  access:(token,password)=>
    api.get(
      `/api/shares/access/${token}`,
      {
        params:{
          password
        }
      }
    ),

};



// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export const notificationsAPI = {


  list:() =>
    api.get("/api/notifications/"),


  markRead:(id)=>
    api.patch(
      `/api/notifications/${id}/read`
    ),


  markAllRead:() =>
    api.patch(
      "/api/notifications/read-all"
    ),


  delete:(id)=>
    api.delete(
      `/api/notifications/${id}`
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


  listUsers:() =>
    api.get(
      "/api/admin/users"
    ),


  updateUser:(id,data)=>
    api.patch(
      `/api/admin/users/${id}`,
      data
    ),

};



// ─────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────

export const auditAPI = {


  list:(limit=50)=>
    api.get(
      "/api/audit/",
      {
        params:{
          limit
        }
      }
    ),

};



export default api;