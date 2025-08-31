// src/api.js
import axios from "axios";

// Django 개발서버로 고정
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: false,
});

export default api;
