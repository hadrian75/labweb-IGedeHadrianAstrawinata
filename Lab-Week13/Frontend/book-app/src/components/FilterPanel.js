import { useState } from 'react';

function FilterPanel({ onFilterChange, onReset }) {
  const [filters, setFilters] = useState({
    name: '',
    author: '',
    rating: '',
    uploaded_after: '',
    uploaded_before: '',
  });

  const handleChange = (e) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value,
    };
    setFilters(newFilters);

    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      name: '', author: '', rating: '', uploaded_after: '',
      uploaded_before: ''
    };
    setFilters(emptyFilters);
    onReset();
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl shadow-xl border-2 border-purple-200 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Filter Buku</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            🔍 Cari Judul
          </label>
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="Contoh: Harry Potter"
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            👤 Cari Penulis
          </label>
          <input
            type="text"
            name="author"
            value={filters.author}
            onChange={handleChange}
            placeholder="Contoh: J.K. Rowling"
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            ⭐ Rating
          </label>
          <select
            name="rating"
            value={filters.rating}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer bg-white"
          >
            <option value="">Semua Rating</option>
            <option value="excellent">⭐⭐⭐⭐⭐ Excellent</option>
            <option value="average">⭐⭐⭐ Average</option>
            <option value="bad">⭐ Bad</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            📅 Dari Tanggal
          </label>
          <input
            type="date"
            name="uploaded_after"
            value={filters.uploaded_after}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all cursor-pointer"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            📅 Sampai Tanggal
          </label>
          <input
            type="date"
            name="uploaded_before"
            value={filters.uploaded_before}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all cursor-pointer"
          />
        </div>
      </div>

      {(filters.name || filters.author || filters.rating || filters.uploaded_after || filters.uploaded_before) && (
        <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Filter Aktif:
            {filters.name && <span className="ml-1 px-2 py-0.5 bg-purple-200 rounded-full text-xs">Judul</span>}
            {filters.author && <span className="ml-1 px-2 py-0.5 bg-purple-200 rounded-full text-xs">Penulis</span>}
            {filters.rating && <span className="ml-1 px-2 py-0.5 bg-purple-200 rounded-full text-xs">Rating</span>}
            {filters.uploaded_after && <span className="ml-1 px-2 py-0.5 bg-purple-200 rounded-full text-xs">Dari</span>}
            {filters.uploaded_before && <span className="ml-1 px-2 py-0.5 bg-purple-200 rounded-full text-xs">Sampai</span>}
          </p>
        </div>
      )}

      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Semua Filter
      </button>

      <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-xl">
        <p className="text-xs text-gray-600 text-center">
          <span className="font-bold text-purple-700">💡 Tips:</span> Pilih tanggal untuk melihat buku yang diupload dalam periode tertentu
        </p>
      </div>
    </div>
  );
}

export default FilterPanel;