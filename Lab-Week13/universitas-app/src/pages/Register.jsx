// src/components/Register.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Register = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    full_name: "",
    role: "MAHASISWA",
    major: "",
  });
  const [jurusanList, setJurusanList] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/academic/jurusan/`);
        setJurusanList(response.data);
      } catch (err) {
        console.error("Failed to fetch jurusan list:", err);
      }
    };
    fetchJurusan();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const payload = {
      ...formData,
      major: formData.role === "DOSEN" ? null : formData.major,
    };

    if (payload.role === "MAHASISWA" && !payload.major) {
      setError("Major wajib diisi untuk Mahasiswa.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/register/`, payload);
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data) {
        const errors = err.response.data;
        const errorMessages = Object.keys(errors)
          .map((key) => `${key}: ${errors[key]}`)
          .join("\n");
        setError(errorMessages);
      } else {
        setError("Registration failed due to network error.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Sudah login. Mengalihkan...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create New Account
        </h2>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="full_name"
            required
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />

          <input
            type="email"
            name="email"
            required
            placeholder="Email (e.g., @student.prasetiyamulya.ac.id)"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />

          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />

          <input
            type="password"
            name="password_confirmation"
            required
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />

          <select
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="MAHASISWA">Mahasiswa</option>
            <option value="DOSEN">Dosen</option>
          </select>

          {formData.role === "MAHASISWA" && (
            <select
              name="major"
              required={formData.role === "MAHASISWA"}
              value={formData.major}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">-- Pilih Jurusan --</option>
              {jurusanList.map((jurusan) => (
                <option key={jurusan.kode} value={jurusan.kode}>
                  {jurusan.nama} ({jurusan.kode})
                </option>
              ))}
            </select>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          Sudah punya akun?{" "}
          <a href="/login" className="text-indigo-600 hover:text-indigo-500">
            Login di sini
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
