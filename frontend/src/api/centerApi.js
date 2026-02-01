import axios from "axios";

/* =========================
   Base URL
========================= */
// لازم يكون فيه /api/v1
const BASE_URL =
  import.meta.env.VITE_API_URL?.endsWith("/api/v1")
    ? import.meta.env.VITE_API_URL
    : `${import.meta.env.VITE_API_URL}/api/v1`;

const centerApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* =========================
   Request Interceptor
========================= */
centerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("centerToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   Response Interceptor
   (حل نهائي لمشكلة النشر)
========================= */
centerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.status === 403)
    ) {
      console.warn("Center token expired or invalid");

      localStorage.removeItem("centerToken");

      // نرجع لتسجيل دخول المركز
      if (window.location.pathname.startsWith("/center")) {
        window.location.href = "/center-login";
      }
    }

    return Promise.reject(error);
  }
);

export default centerApi;
