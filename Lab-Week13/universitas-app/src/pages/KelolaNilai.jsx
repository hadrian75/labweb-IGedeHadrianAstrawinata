import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/Api";

const KelolaNilai = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matakuliah, setMatakuliah] = useState([]);
  const [komponenList, setKomponenList] = useState([]);
  const [selectedMK, setSelectedMK] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    nama_komponen: "",
    bobot_persen: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pilihan komponen yang tersedia
  const KOMPONEN_CHOICES = [
    { value: "UTS", label: "Ujian Tengah Semester" },
    { value: "UAS", label: "Ujian Akhir Semester" },
    { value: "Tugas", label: "Tugas/Proyek" },
    { value: "Kehadiran", label: "Kehadiran" },
    { value: "Lainnya", label: "Lainnya" },
  ];

  useEffect(() => {
    fetchMatakuliah();
  }, []);

  useEffect(() => {
    if (selectedMK) {
      fetchKomponen(selectedMK);
    } else {
      setKomponenList([]);
    }
  }, [selectedMK]);

  const fetchMatakuliah = async () => {
    try {
      const response = await api.get("/academic/matakuliah/");
      const filtered =
        user.role === "DOSEN"
          ? response.data.filter((mk) =>
              mk.pengajar?.some((p) => p.email === user.email)
            )
          : response.data;
      setMatakuliah(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching matakuliah:", error);
      setError("Gagal memuat data mata kuliah");
      setLoading(false);
    }
  };

  const fetchKomponen = async (kode_mk) => {
    try {
      const response = await api.get("/academic/komponen/", {
        params: { matakuliah_kode_mk: kode_mk },
      });
      setKomponenList(response.data);
    } catch (error) {
      console.error("Error fetching komponen:", error);
      setKomponenList([]);
    }
  };

  const calculateTotalBobot = () => {
    return komponenList.reduce(
      (sum, k) => sum + parseFloat(k.bobot_persen || 0),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi bobot
    const bobot = parseFloat(formData.bobot_persen);
    if (isNaN(bobot) || bobot <= 0 || bobot > 100) {
      setError("Bobot harus antara 1-100%");
      return;
    }

    // Cek total bobot setelah ditambah/edit
    const currentTotal = calculateTotalBobot();
    const otherBobot = editMode
      ? currentTotal -
        parseFloat(
          komponenList.find((k) => k.id === formData.id)?.bobot_persen || 0
        )
      : currentTotal;

    const newTotal = otherBobot + bobot;

    if (newTotal > 100) {
      setError(
        `Total bobot akan melebihi 100% (${newTotal.toFixed(
          1
        )}%). Maksimal bobot yang bisa ditambahkan: ${(
          100 - otherBobot
        ).toFixed(1)}%`
      );
      return;
    }

    try {
      const payload = {
        matakuliah: selectedMK,
        nama_komponen: formData.nama_komponen,
        bobot_persen: formData.bobot_persen,
      };

      if (editMode) {
        await api.put(`/academic/komponen/${formData.id}/`, payload);
        setSuccess("Komponen berhasil diupdate!");
      } else {
        await api.post("/academic/komponen/", payload);
        setSuccess("Komponen berhasil ditambahkan!");
      }

      setShowModal(false);
      resetForm();
      fetchKomponen(selectedMK);
    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.non_field_errors) {
          setError(errors.non_field_errors[0]);
        } else {
          const errorMsg = Object.keys(errors)
            .map((k) => `${errors[k]}`)
            .join("; ");
          setError(errorMsg || "Terjadi kesalahan saat menyimpan komponen");
        }
      } else {
        setError("Terjadi kesalahan saat menyimpan komponen");
      }
    }
  };

  const handleEdit = (komponen) => {
    setFormData({
      id: komponen.id,
      nama_komponen: komponen.nama_komponen,
      bobot_persen: komponen.bobot_persen,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus komponen ini?")) return;

    try {
      await api.delete(`/academic/komponen/${id}/`);
      setSuccess("Komponen berhasil dihapus!");
      fetchKomponen(selectedMK);
    } catch (error) {
      setError("Gagal menghapus komponen");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nama_komponen: "",
      bobot_persen: "",
    });
    setEditMode(false);
    setError("");
  };

  const totalBobot = calculateTotalBobot();
  const selectedMKData = matakuliah.find((mk) => mk.kode_mk === selectedMK);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kelola Komponen Nilai
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Atur bobot UTS, UAS, Tugas, dan komponen lainnya
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alert Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <button
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Select Mata Kuliah */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Pilih Mata Kuliah
          </label>
          <select
            value={selectedMK}
            onChange={(e) => setSelectedMK(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Pilih Mata Kuliah --</option>
            {matakuliah.map((mk) => (
              <option key={mk.kode_mk} value={mk.kode_mk}>
                {mk.kode_mk} - {mk.nama_mk}
              </option>
            ))}
          </select>
        </div>

        {selectedMK && (
          <>
            {/* Info Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border border-purple-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {selectedMKData?.nama_mk}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Kode: <span className="font-semibold">{selectedMK}</span> •
                    SKS:{" "}
                    <span className="font-semibold">{selectedMKData?.sks}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                      Math.abs(totalBobot - 100) < 0.01
                        ? "bg-green-100 text-green-800"
                        : totalBobot > 100
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <span className="text-2xl">
                      {Math.abs(totalBobot - 100) < 0.01
                        ? "✅"
                        : totalBobot > 100
                        ? "❌"
                        : "⚠️"}
                    </span>
                    <span>Total: {totalBobot.toFixed(1)}%</span>
                  </div>
                  {Math.abs(totalBobot - 100) >= 0.01 && (
                    <p className="text-xs text-gray-600 mt-2">
                      {totalBobot < 100
                        ? `Kurang ${(100 - totalBobot).toFixed(1)}%`
                        : `Kelebihan ${(totalBobot - 100).toFixed(1)}%`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Add Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md hover:shadow-lg transition-all font-semibold"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Komponen
              </button>
            </div>

            {/* Komponen List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Daftar Komponen
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {komponenList.length} komponen terdaftar
                </p>
              </div>

              {komponenList.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Belum Ada Komponen
                  </h3>
                  <p className="text-gray-500">
                    Klik "Tambah Komponen" untuk mulai menambahkan komponen
                    penilaian
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {komponenList.map((komponen) => (
                    <div
                      key={komponen.id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-100 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800">
                            {komponen.nama_komponen}
                          </h4>
                          <p className="text-3xl font-bold text-blue-600 mt-2">
                            {parseFloat(komponen.bobot_persen).toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-3xl">
                          {komponen.nama_komponen === "UTS"
                            ? "📝"
                            : komponen.nama_komponen === "UAS"
                            ? "📄"
                            : komponen.nama_komponen === "Tugas"
                            ? "📚"
                            : komponen.nama_komponen === "Kehadiran"
                            ? "✅"
                            : "📌"}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(komponen)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(komponen.id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editMode ? "Edit Komponen" : "Tambah Komponen"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Komponen
                </label>
                <select
                  value={formData.nama_komponen}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_komponen: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={editMode}
                >
                  <option value="">Pilih Komponen</option>
                  {KOMPONEN_CHOICES.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
                {editMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Jenis komponen tidak dapat diubah
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bobot (%)
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={formData.bobot_persen}
                  onChange={(e) =>
                    setFormData({ ...formData, bobot_persen: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="30.00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sisa bobot yang tersedia:{" "}
                  {editMode
                    ? (
                        100 -
                        (totalBobot -
                          parseFloat(
                            komponenList.find((k) => k.id === formData.id)
                              ?.bobot_persen || 0
                          ))
                      ).toFixed(1)
                    : (100 - totalBobot).toFixed(1)}
                  %
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editMode ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaNilai;
