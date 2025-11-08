import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/Api";

const TranskripNilai = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nilaiAkhir, setNilaiAkhir] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNilai();
  }, []);

  const fetchNilai = async () => {
    try {
      // ✅ GANTI dari axios.get ke api.get
      const response = await api.get("/academic/nilai-akhir/");
      setNilaiAkhir(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching nilai:", error);
      setLoading(false);
    }
  };

  const calculateIPK = () => {
    if (nilaiAkhir.length === 0) return "0.00";

    const gradePoints = {
      A: 4.0,
      AB: 3.5,
      B: 3.0,
      BC: 2.5,
      C: 2.0,
      D: 1.0,
      E: 0.0,
    };

    const total = nilaiAkhir.reduce((sum, nilai) => {
      return sum + (gradePoints[nilai.nilai_huruf] || 0);
    }, 0);

    return (total / nilaiAkhir.length).toFixed(2);
  };

  const calculateTotalSKS = () => {
    return nilaiAkhir.length * 3;
  };

  const getGradeColor = (grade) => {
    if (["A", "AB"].includes(grade)) return "green";
    if (["B", "BC"].includes(grade)) return "blue";
    if (["C"].includes(grade)) return "yellow";
    return "red";
  };

  const getGradeEmoji = (grade) => {
    if (["A", "AB"].includes(grade)) return "🌟";
    if (["B", "BC"].includes(grade)) return "✨";
    if (["C"].includes(grade)) return "👍";
    return "📌";
  };

  const filteredData = nilaiAkhir.filter((nilai) => {
    const matchesSearch =
      nilai.matakuliah_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nilai.matakuliah.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "passed")
      return matchesSearch && !["D", "E"].includes(nilai.nilai_huruf);
    if (filter === "failed")
      return matchesSearch && ["D", "E"].includes(nilai.nilai_huruf);
    return matchesSearch;
  });

  const getGradeDistribution = () => {
    const distribution = {};
    nilaiAkhir.forEach((nilai) => {
      distribution[nilai.nilai_huruf] =
        (distribution[nilai.nilai_huruf] || 0) + 1;
    });
    return distribution;
  };

  const gradeDistribution = getGradeDistribution();

  const handleExportPDF = () => {
    alert("Fitur export PDF akan segera hadir!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat transkrip nilai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-2xl font-bold text-gray-800">
                  Transkrip Nilai
                </h1>
                <p className="text-sm text-gray-500">
                  Riwayat nilai akademik Anda
                </p>
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">
                Indeks Prestasi
              </span>
              <span className="text-3xl">🎯</span>
            </div>
            <div className="text-4xl font-bold mb-1">{calculateIPK()}</div>
            <p className="text-blue-100 text-sm">IPK Kumulatif</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Total SKS
              </span>
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {calculateTotalSKS()}
            </div>
            <p className="text-gray-500 text-sm">SKS Lulus</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Mata Kuliah
              </span>
              <span className="text-3xl">📖</span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {nilaiAkhir.length}
            </div>
            <p className="text-gray-500 text-sm">Total MK</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Status</span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-xl font-bold text-green-600 mb-1">
              {
                nilaiAkhir.filter((n) => !["D", "E"].includes(n.nilai_huruf))
                  .length
              }{" "}
              Lulus
            </div>
            <p className="text-gray-500 text-sm">dari {nilaiAkhir.length} MK</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribusi Nilai
          </h3>
          <div className="grid grid-cols-7 gap-4">
            {["A", "AB", "B", "BC", "C", "D", "E"].map((grade) => (
              <div
                key={grade}
                className={`text-center p-4 rounded-lg ${
                  gradeDistribution[grade] > 0
                    ? `bg-${getGradeColor(grade)}-100`
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`text-2xl font-bold ${
                    gradeDistribution[grade] > 0
                      ? `text-${getGradeColor(grade)}-800`
                      : "text-gray-400"
                  }`}
                >
                  {gradeDistribution[grade] || 0}
                </div>
                <div
                  className={`text-sm font-semibold mt-1 ${
                    gradeDistribution[grade] > 0
                      ? `text-${getGradeColor(grade)}-700`
                      : "text-gray-500"
                  }`}
                >
                  {grade}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="🔍 Cari mata kuliah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semua ({nilaiAkhir.length})
              </button>
              <button
                onClick={() => setFilter("passed")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "passed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lulus (
                {
                  nilaiAkhir.filter((n) => !["D", "E"].includes(n.nilai_huruf))
                    .length
                }
                )
              </button>
              <button
                onClick={() => setFilter("failed")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "failed"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tidak Lulus (
                {
                  nilaiAkhir.filter((n) => ["D", "E"].includes(n.nilai_huruf))
                    .length
                }
                )
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchTerm ? "Tidak ada hasil" : "Belum ada nilai"}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Coba kata kunci lain untuk pencarian Anda"
                  : "Nilai akan muncul setelah dosen melakukan input"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kode MK
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mata Kuliah
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      SKS
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nilai Angka
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nilai Huruf
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((nilai, index) => {
                    const gradeColor = getGradeColor(nilai.nilai_huruf);
                    const isPassed = !["D", "E"].includes(nilai.nilai_huruf);

                    return (
                      <tr
                        key={nilai.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {nilai.matakuliah}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {nilai.matakuliah_nama}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-700">
                            3
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {parseFloat(nilai.nilai_total).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-${gradeColor}-100 text-${gradeColor}-800`}
                          >
                            {getGradeEmoji(nilai.nilai_huruf)}
                            {nilai.nilai_huruf}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Lulus
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Tidak Lulus
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Ringkasan Akademik
              </h3>
              <p className="text-sm text-gray-600">
                Anda telah menyelesaikan{" "}
                <span className="font-semibold">
                  {nilaiAkhir.length} mata kuliah
                </span>{" "}
                dengan IPK{" "}
                <span className="font-semibold">{calculateIPK()}</span>
              </p>
            </div>
            <div className="text-5xl">
              {parseFloat(calculateIPK()) >= 3.5
                ? "🏆"
                : parseFloat(calculateIPK()) >= 3.0
                ? "🎖️"
                : "💪"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranskripNilai;
