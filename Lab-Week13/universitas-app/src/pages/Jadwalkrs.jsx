import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const JadwalKRS = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matakuliah, setMatakuliah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("schedule");

  const scheduleSlots = [
    "07:00 - 08:40",
    "08:40 - 10:20",
    "10:20 - 12:00",
    "13:00 - 14:40",
    "14:40 - 16:20",
    "16:20 - 18:00",
  ];

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://localhost:8000/api/academic/matakuliah/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const coursesWithSchedule = response.data
        .slice(0, 8)
        .map((mk, index) => ({
          ...mk,
          hari: days[index % 5],
          jam: scheduleSlots[index % 6],
          ruangan: `R.${100 + index}`,
          kelas: String.fromCharCode(65 + (index % 3)), // A, B, C
        }));

      setMatakuliah(coursesWithSchedule);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jadwal:", error);
      setLoading(false);
    }
  };

  const totalSKS = matakuliah.reduce((sum, mk) => sum + (mk.sks || 0), 0);

  const getScheduleBySlot = (day, slot) => {
    return matakuliah.find((mk) => mk.hari === day && mk.jam === slot);
  };

  const getColorClass = (index) => {
    const colors = [
      "bg-blue-100 border-blue-300 text-blue-800",
      "bg-green-100 border-green-300 text-green-800",
      "bg-purple-100 border-purple-300 text-purple-800",
      "bg-pink-100 border-pink-300 text-pink-800",
      "bg-indigo-100 border-indigo-300 text-indigo-800",
      "bg-yellow-100 border-yellow-300 text-yellow-800",
      "bg-red-100 border-red-300 text-red-800",
      "bg-teal-100 border-teal-300 text-teal-800",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat jadwal KRS...</p>
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
                <h1 className="text-2xl font-bold text-gray-800">Jadwal KRS</h1>
                <p className="text-sm text-gray-500">
                  Semester Genap 2024/2025
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("schedule")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "schedule"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Jadwal
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">
                Total SKS
              </span>
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-4xl font-bold mb-1">{totalSKS}</div>
            <p className="text-blue-100 text-sm">SKS Semester Ini</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Mata Kuliah
              </span>
              <span className="text-3xl">📖</span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {matakuliah.length}
            </div>
            <p className="text-gray-500 text-sm">MK Diambil</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Hari Kuliah
              </span>
              <span className="text-3xl">📅</span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {new Set(matakuliah.map((mk) => mk.hari)).size}
            </div>
            <p className="text-gray-500 text-sm">Hari per Minggu</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Status KRS
              </span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-lg font-bold text-green-600 mb-1">
              Approved
            </div>
            <p className="text-gray-500 text-sm">Dosen Wali</p>
          </div>
        </div>

        {viewMode === "schedule" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Jadwal Mingguan
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Senin - Jumat, 07:00 - 18:00
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-200 sticky left-0 bg-gray-50">
                      Waktu
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase border-r border-gray-200 min-w-[180px]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduleSlots.map((slot, slotIndex) => (
                    <tr key={slot} className="border-t border-gray-200">
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 border-r border-gray-200 bg-gray-50 sticky left-0 whitespace-nowrap">
                        {slot}
                      </td>
                      {days.map((day) => {
                        const course = getScheduleBySlot(day, slot);
                        return (
                          <td
                            key={`${day}-${slot}`}
                            className="px-2 py-2 border-r border-gray-200 align-top"
                          >
                            {course ? (
                              <div
                                className={`p-3 rounded-lg border-2 ${getColorClass(
                                  matakuliah.indexOf(course)
                                )} hover:shadow-md transition-shadow cursor-pointer`}
                              >
                                <div className="font-semibold text-sm mb-1 line-clamp-1">
                                  {course.nama_mk}
                                </div>
                                <div className="text-xs space-y-1">
                                  <div className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <span className="line-clamp-1">
                                      {course.pengajar?.[0]?.full_name || "TBA"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                      />
                                    </svg>
                                    <span>{course.ruangan}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-semibold">
                                      {course.sks} SKS
                                    </span>
                                    <span>•</span>
                                    <span>Kelas {course.kelas}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full min-h-[80px]"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {matakuliah.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Belum Ada Jadwal
                </h3>
                <p className="text-gray-500">
                  Jadwal KRS Anda akan muncul di sini
                </p>
              </div>
            ) : (
              matakuliah.map((mk, index) => (
                <div
                  key={mk.kode_mk}
                  className={`bg-white rounded-xl p-6 shadow-sm border-l-4 hover:shadow-md transition-shadow ${
                    getColorClass(index).split(" ")[0]
                  } border-gray-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getColorClass(
                            index
                          )}`}
                        >
                          {mk.kode_mk}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {mk.sks} SKS
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          Kelas {mk.kelas}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {mk.nama_mk}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500">Dosen</div>
                            <div className="font-medium">
                              {mk.pengajar?.[0]?.full_name || "TBA"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500">Jadwal</div>
                            <div className="font-medium">
                              {mk.hari}, {mk.jam}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500">Ruangan</div>
                            <div className="font-medium">{mk.ruangan}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  Batas Pengambilan SKS
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Anda telah mengambil{" "}
                  <span className="font-semibold">{totalSKS} SKS</span> dari
                  maksimal <span className="font-semibold">24 SKS</span>
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(totalSKS / 24) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  Periode Pengisian KRS
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  1 Januari - 15 Januari 2025
                </p>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
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
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JadwalKRS;
