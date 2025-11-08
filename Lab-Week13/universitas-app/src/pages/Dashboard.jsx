import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import JadwalKRS from "./Jadwalkrs";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matakuliah, setMatakuliah] = useState([]);
  const [nilaiAkhir, setNilaiAkhir] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      if (user.role === "DOSEN") {
        const mkResponse = await axios.get(
          "http://localhost:8000/api/academic/matakuliah/"
        );
        const filtered = mkResponse.data.filter((mk) =>
          mk.pengajar.some((p) => p.email === user.email)
        );
        setMatakuliah(filtered);
      } else {
        const mkResponse = await axios.get(
          "http://localhost:8000/api/academic/matakuliah/"
        );
        setMatakuliah(mkResponse.data);

        const nilaiResponse = await axios.get(
          "http://localhost:8000/api/academic/nilai-akhir/"
        );
        setNilaiAkhir(nilaiResponse.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }
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
    return matakuliah.length * 3; // 3 SKS per MK
  };
  const Sidebar = () => (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-20"
      } bg-white border-r border-gray-200 min-h-screen transition-all duration-300 flex flex-col`}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          {sidebarOpen && (
            <span className="text-xl font-bold text-gray-800">SIAKAD</span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {user.role === "DOSEN" && (
            <>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                {sidebarOpen && (
                  <span>
                    <Link to={"/matakuliah"}>Mata Kuliah</Link>
                  </span>
                )}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                {sidebarOpen && (
                  <span>
                    <Link to={"/input-nilai"}>Input Nilai</Link>
                  </span>
                )}
              </button>
            </>
          )}

          {user.role === "MAHASISWA" && (
            <>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {sidebarOpen && (
                  <span>
                    <Link to="/transkrip-nilai">Transkrip Nilai</Link>{" "}
                  </span>
                )}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {sidebarOpen && (
                  <span>
                    <Link to={"/jadwal-krs"}>Jadwal KRS</Link>
                  </span>
                )}
              </button>
            </>
          )}

          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  const TopBar = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Type to search across dashboard"
              className="w-96 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                {user.fullName}
              </div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  const StatsCards = () => {
    const getTotalMahasiswa = () => {
      return matakuliah.reduce((sum, mk) => sum + (mk.total_mahasiswa || 0), 0);
    };
    const getNilaiTerinputPercentage = () => {
      const totalMK = matakuliah.length;
      const studentsPerMK = 20;
      const componentsPerMK = 4;
      const expectedTotal = totalMK * studentsPerMK * componentsPerMK;

      return expectedTotal;
    };

    const dosenStats = [
      {
        title: "Mata Kuliah Diampu",
        value: matakuliah.length,
        icon: "📚",
        color: "blue",
        trend: "+2 dari semester lalu",
      },
      {
        title: "Total Mahasiswa",
        value: getTotalMahasiswa(),
        icon: "👥",
        color: "green",
        trend: "+12.5% semester ini",
      },
      {
        title: "Nilai Terinput",
        value: getNilaiTerinputPercentage(),
        icon: "✅",
        color: "purple",
        trend: "11 pending",
      },
    ];

    const mahasiswaStats = [
      {
        title: "Total SKS Diambil",
        value: calculateTotalSKS(),
        icon: "📖",
        color: "blue",
        trend: `${matakuliah.length} mata kuliah`,
      },
      {
        title: "IPK Sementara",
        value: calculateIPK(),
        icon: "🎯",
        color: "green",
        trend: "Semester 6",
      },
      {
        title: "Nilai Keluar",
        value: nilaiAkhir.length,
        icon: "📊",
        color: "purple",
        trend: `dari ${matakuliah.length} MK`,
      },
    ];

    const stats = user.role === "DOSEN" ? dosenStats : mahasiswaStats;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stat.value}
                </h3>
                <p className="text-xs text-gray-500">{stat.trend}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${stat.color}-600 h-2 rounded-full`}
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DosenDashboard = () => (
    <div className="space-y-6">
      <StatsCards />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Mata Kuliah yang Diampu
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Daftar mata kuliah yang Anda ajar semester ini
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + Tambah MK
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Memuat data...</p>
          </div>
        ) : matakuliah.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500">Belum ada mata kuliah yang diampu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode MK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Mata Kuliah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jurusan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matakuliah.map((mk) => (
                  <tr key={mk.kode_mk} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {mk.kode_mk}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {mk.nama_mk}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {mk.sks} SKS
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {mk.jurusan?.nama || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-medium mr-4">
                        Input Nilai
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 font-medium">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Input Nilai Mahasiswa
              </h4>
              <p className="text-sm text-gray-600">
                Kelola dan input nilai untuk mata kuliah yang Anda ampu
              </p>
            </div>
            <div className="text-3xl"></div>
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Mulai Input Nilai
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Kelola Komponen Nilai
              </h4>
              <p className="text-sm text-gray-600">
                Atur bobot UTS, UAS, Tugas, dan komponen lainnya
              </p>
            </div>
            <div className="text-3xl"></div>
          </div>
          <button
            onClick={() => navigate("/kelola-komponen")}
            className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Kelola Komponen
          </button>
        </div>
      </div>
    </div>
  );

  const MahasiswaDashboard = () => (
    <div className="space-y-6">
      <StatsCards />

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Transkrip Nilai Card */}
        <div
          onClick={() => navigate("/transkrip-nilai")}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
                Transkrip Nilai
              </h4>
              <p className="text-sm text-gray-600">
                Lihat riwayat nilai lengkap dan IPK Anda
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span className="font-semibold text-green-600">
                  {nilaiAkhir.length} MK
                </span>
                <span>•</span>
                <span>
                  IPK: <span className="font-semibold">{calculateIPK()}</span>
                </span>
              </div>
            </div>
            <div className="text-4xl group-hover:scale-110 transition-transform">
              📊
            </div>
          </div>
          <div className="flex items-center justify-between text-green-700 font-medium text-sm group-hover:gap-2 transition-all">
            <span>Buka Transkrip</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </div>

        <div
          onClick={() => navigate("/jadwal-krs")}
          className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-yellow-700 transition-colors">
                Jadwal KRS
              </h4>
              <p className="text-sm text-gray-600">
                Lihat jadwal kuliah dan pengambilan mata kuliah
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span className="font-semibold text-yellow-600">
                  {matakuliah.length} MK
                </span>
                <span>•</span>
                <span>{calculateTotalSKS()} SKS</span>
              </div>
            </div>
            <div className="text-4xl group-hover:scale-110 transition-transform">
              📅
            </div>
          </div>
          <div className="flex items-center justify-between text-yellow-700 font-medium text-sm group-hover:gap-2 transition-all">
            <span>Buka Jadwal</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Transkrip Nilai Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Transkrip Nilai Terbaru
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                5 nilai terakhir yang diinput
              </p>
            </div>
            <button
              onClick={() => navigate("/transkrip-nilai")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Lihat Semua
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : nilaiAkhir.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500">Belum ada nilai yang keluar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mata Kuliah
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Nilai Angka
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Nilai Huruf
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nilaiAkhir.slice(0, 5).map((nilai) => {
                  const gradeColor = ["A", "AB"].includes(nilai.nilai_huruf)
                    ? "green"
                    : ["B", "BC"].includes(nilai.nilai_huruf)
                    ? "blue"
                    : ["C"].includes(nilai.nilai_huruf)
                    ? "yellow"
                    : "red";

                  return (
                    <tr key={nilai.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {nilai.matakuliah_nama}
                        </div>
                        <div className="text-xs text-gray-500">
                          {nilai.matakuliah}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {parseFloat(nilai.nilai_total).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 inline-flex text-sm font-bold rounded-full bg-${gradeColor}-100 text-${gradeColor}-800`}
                        >
                          {nilai.nilai_huruf}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ Lulus
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mata Kuliah yang Diambil */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Mata Kuliah Semester Ini
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Daftar mata kuliah yang Anda ambil
              </p>
            </div>
            <button
              onClick={() => navigate("/jadwal-krs")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Lihat Jadwal
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matakuliah.slice(0, 6).map((mk) => (
                <div
                  key={mk.kode_mk}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate("/jadwal-krs")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {mk.nama_mk}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {mk.kode_mk} • {mk.sks} SKS
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {mk.jurusan?.kode || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                    <svg
                      className="w-4 h-4"
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
                    <span>
                      {mk.pengajar?.[0]?.full_name || "Belum ditentukan"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {matakuliah.length > 6 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/jadwal-krs")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Lihat {matakuliah.length - 6} mata kuliah lainnya →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopBar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Selamat Datang, {user.fullName}! 👋
                  </h2>
                  <p className="text-blue-100">
                    {user.role === "DOSEN"
                      ? "Kelola mata kuliah dan nilai mahasiswa Anda dengan mudah"
                      : "Pantau perkembangan akademik Anda di sini"}
                  </p>
                </div>
                <div className="hidden md:block text-6xl opacity-20">
                  {user.role === "DOSEN" ? "👨‍🏫" : "🎓"}
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center text-sm text-gray-600">
              <span>Dashboard</span>
              <svg
                className="w-4 h-4 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-gray-900 font-medium">
                {user.role === "DOSEN" ? "Dosen Panel" : "Mahasiswa Panel"}
              </span>
            </div>

            {user.role === "DOSEN" ? (
              <DosenDashboard />
            ) : (
              <MahasiswaDashboard />
            )}
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
            <p>© 2025 SIAKAD Prasetiya Mulya. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-700">
                Bantuan
              </a>
              <a href="#" className="hover:text-gray-700">
                Dokumentasi
              </a>
              <a href="#" className="hover:text-gray-700">
                Kontak
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
