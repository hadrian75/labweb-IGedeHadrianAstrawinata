import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/Api";

const InputNilai = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { kode_mk } = useParams();
  const [matakuliah, setMatakuliah] = useState([]);
  const [mahasiswa, setMahasiswa] = useState([]);
  const [komponenNilai, setKomponenNilai] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMK, setSelectedMK] = useState(kode_mk || "");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    mahasiswa: "",
    komponen: "",
    nilai_angka: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMatakuliah = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // ✅ GANTI dari axios.get ke api.get
      const response = await api.get("/academic/matakuliah/");
      const filtered =
        user.role === "DOSEN"
          ? response.data.filter((mk) =>
              mk.pengajar?.some((p) => p.email === user.email)
            )
          : response.data;
      setMatakuliah(filtered);
    } catch (error) {
      console.error("Error fetching matakuliah:", error);
      setError("Gagal memuat data mata kuliah");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMahasiswa = useCallback(async () => {
    try {
      // ✅ GANTI dari axios.get ke api.get
      const response = await api.get("/academic/mahasiswa/");
      setMahasiswa(response.data);
    } catch (error) {
      console.error("Error fetching mahasiswa:", error);
      setError("Gagal memuat data mahasiswa");
      setMahasiswa([]);
    }
  }, []);

  const fetchKomponenNilai = useCallback(async (kode_mk) => {
    try {
      // ✅ GANTI dari axios.get ke api.get
      const response = await api.get("/academic/komponen/", {
        params: { matakuliah_kode_mk: kode_mk },
      });
      setKomponenNilai(response.data);
    } catch (error) {
      console.error("Error fetching komponen nilai:", error);
      setKomponenNilai([]);
    }
  }, []);

  const fetchAssessments = useCallback(async (kode_mk) => {
    try {
      // ✅ GANTI dari axios.get ke api.get
      const response = await api.get("/academic/assessment/", {
        params: { matakuliah_kode_mk: kode_mk },
      });
      setAssessments(response.data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setAssessments([]);
    }
  }, []);

  useEffect(() => {
    fetchMatakuliah();
    fetchMahasiswa();
  }, [fetchMatakuliah, fetchMahasiswa]);

  useEffect(() => {
    if (selectedMK) {
      fetchKomponenNilai(selectedMK);
      fetchAssessments(selectedMK);
    } else {
      setKomponenNilai([]);
      setAssessments([]);
    }
  }, [selectedMK, fetchKomponenNilai, fetchAssessments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nilai = parseFloat(formData.nilai_angka);
    if (isNaN(nilai) || nilai < 0 || nilai > 100) {
      setError("Nilai harus antara 0 dan 100.");
      return;
    }

    try {
      // ✅ GANTI dari axios.post ke api.post
      await api.post("/academic/assessment/", formData);

      setSuccess("Nilai berhasil diinput!");
      setShowModal(false);
      fetchAssessments(selectedMK);
      resetForm();
    } catch (error) {
      if (error.response?.data?.non_field_errors) {
        setError(error.response.data.non_field_errors[0]);
      } else if (error.response?.data) {
        const errors = error.response.data;
        const errorMsg = Object.keys(errors)
          .map((k) => `${errors[k]}`)
          .join("; ");
        setError(errorMsg || "Terjadi kesalahan saat menyimpan nilai");
      } else {
        setError("Terjadi kesalahan saat menyimpan nilai");
      }
      console.error("Error saving assessment:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus nilai ini?")) return;

    try {
      // ✅ GANTI dari axios.delete ke api.delete
      await api.delete(`/academic/assessment/${id}/`);
      setSuccess("Nilai berhasil dihapus!");
      fetchAssessments(selectedMK);
    } catch (error) {
      setError("Gagal menghapus nilai");
    }
  };

  const resetForm = () => {
    setFormData({
      mahasiswa: "",
      komponen: "",
      nilai_angka: "",
    });
    setError("");
  };

  const calculateFinalGrade = async (mahasiswaId) => {
    setSuccess("");
    setError("");
    try {
      // ✅ GANTI dari axios.post ke api.post
      const response = await api.post(
        "/academic/nilai-akhir/calculate_final_score/",
        {
          mahasiswa_id: mahasiswaId,
          matakuliah_kode: selectedMK,
        }
      );
      setSuccess(`Nilai akhir berhasil dihitung: ${response.data.nilai_huruf}`);
    } catch (error) {
      setError(error.response?.data?.detail || "Gagal menghitung nilai akhir");
    }
  };

  const filteredAssessments = assessments.filter((a) =>
    a.mahasiswa_nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMKData = matakuliah.find((mk) => mk.kode_mk === selectedMK);

  // Hitung total bobot HANYA untuk komponen yang ditampilkan
  const totalBobot = komponenNilai.reduce(
    (acc, k) => acc + parseFloat(k.bobot_persen),
    0
  );

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
                  Input Nilai Mahasiswa
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola nilai assessment untuk mata kuliah Anda
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Pilih Mata Kuliah --</option>
            {matakuliah.map((mk) => (
              <option key={mk.kode_mk} value={mk.kode_mk}>
                {mk.kode_mk} - {mk.nama_mk} ({mk.total_mahasiswa} mahasiswa)
              </option>
            ))}
          </select>
        </div>

        {selectedMK && (
          <>
            {/* Komponen Nilai Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Komponen Penilaian
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    Math.abs(totalBobot - 100) < 0.01
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Total: {totalBobot.toFixed(0)}%
                </span>
              </div>

              {komponenNilai.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">
                    Belum ada komponen nilai untuk mata kuliah ini
                  </p>
                  <p className="text-xs mt-1">
                    Silakan tambahkan komponen nilai terlebih dahulu
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {komponenNilai.map((k) => (
                    <div
                      key={k.id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
                    >
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        {k.nama_komponen}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {parseFloat(k.bobot_persen).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Nilai Button & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={komponenNilai.length === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    komponenNilai.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  }`}
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
                  Input Nilai
                </button>

                <input
                  type="text"
                  placeholder="🔍 Cari mahasiswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Daftar Nilai */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Daftar Nilai
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredAssessments.length} nilai terinput
                </p>
              </div>

              {filteredAssessments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Belum Ada Nilai
                  </h3>
                  <p className="text-gray-500">
                    Klik "Input Nilai" untuk mulai menginput nilai mahasiswa
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Mahasiswa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Komponen
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Nilai
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAssessments.map((assessment) => (
                        <tr key={assessment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {assessment.mahasiswa_nama}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {assessment.mahasiswa}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                              {assessment.komponen_nama}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-gray-900">
                              {parseFloat(assessment.nilai_angka).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  calculateFinalGrade(assessment.mahasiswa)
                                }
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                              >
                                Hitung Akhir
                              </button>
                              <button
                                onClick={() => handleDelete(assessment.id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Input Nilai */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Input Nilai
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
                  Mahasiswa
                </label>
                <select
                  value={formData.mahasiswa}
                  onChange={(e) =>
                    setFormData({ ...formData, mahasiswa: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Mahasiswa</option>
                  {mahasiswa.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komponen Nilai
                </label>
                <select
                  value={formData.komponen}
                  onChange={(e) =>
                    setFormData({ ...formData, komponen: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Komponen</option>
                  {komponenNilai.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_komponen} ({parseFloat(k.bobot_persen).toFixed(0)}
                      %)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.nilai_angka}
                  onChange={(e) =>
                    setFormData({ ...formData, nilai_angka: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="85.50"
                  required
                />
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputNilai;
