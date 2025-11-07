import './App.css';
import BookForm from './components/BookForm';
import BookCard from './components/BookCard';
import FilterPanel from './components/FilterPanel';
import { API_URL, getAllBooks, createBook, updateBook, deleteBook } from './services/BookService';
import { useState, useEffect } from 'react';

function App() {
  const [statusPengiriman, setStatusPengiriman] = useState(null);
  const [detailKesalahan, setDetailKesalahan] = useState('');
  const [daftarBuku, setDaftarBuku] = useState([]);
  const [bukuUntukEdit, setBukuUntukEdit] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({});


  const ambilDaftarBuku = async (filter = {}) => {
    setStatusPengiriman('fetching');
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== '')
      );
      const data = await getAllBooks(cleanFilters);
      setDaftarBuku(data);
      setStatusPengiriman(null);
      console.log("Daftar buku berhasil diambil.", cleanFilters);
    } catch (error) {
      console.error("Gagal mengambil daftar buku:", error);
      setStatusPengiriman('error');
      setDetailKesalahan('Gagal mengambil daftar buku dari server.');
    }
  };

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
    const timeOutId = setTimeout(() => {
      ambilDaftarBuku(filters);
    }, 500);
    return () => clearTimeout(timeOutId);
  };

  const handleResetFilter = () => {
    setCurrentFilters({});
    ambilDaftarBuku();
  }

  useEffect(() => {
    ambilDaftarBuku();
  }, []);

  const tanganiPengirimanBuku = async (bookData) => {
    setStatusPengiriman('loading');
    setDetailKesalahan('');

    const payload = {
      name: bookData.nama,
      author: bookData.author,
      rating: bookData.rating,
      image: bookData.image,
    };

    try {
      if (bukuUntukEdit) {
        await updateBook(bukuUntukEdit.id, payload);
        setStatusPengiriman('success');
        setBukuUntukEdit(null);
        console.log("Buku berhasil diupdate.");
      } else {
        await createBook(payload);
        setStatusPengiriman('success');
        console.log("Buku berhasil ditambahkan.");
      }

      ambilDaftarBuku();

    } catch (error) {
      setStatusPengiriman('error');
      if (error.response) {
        console.error("Kesalahan Validasi Django:", error.response.data);
        let errorMsg = 'Validasi Gagal.';
        try {
          errorMsg = JSON.stringify(error.response.data, null, 2);
        } catch (e) {
          errorMsg = error.response.data.toString();
        }
        setDetailKesalahan(`Validasi Gagal: ${errorMsg}`);
      } else if (error.request) {
        setDetailKesalahan('Kesalahan Jaringan: Tidak ada respons dari server Django. (Pastikan CORS sudah diatur)');
      } else {
        setDetailKesalahan(`Kesalahan: ${error.message}`);
      }
    }
  };

  const tanganiHapusBuku = async (id) => {
    setStatusPengiriman('deleting');
    try {
      await deleteBook(id);
      setStatusPengiriman('success');
      console.log(`Buku dengan ID ${id} berhasil dihapus.`);
      ambilDaftarBuku();
    } catch (error) {
      setStatusPengiriman('error');
      setDetailKesalahan(`Gagal menghapus buku ID ${id}.`);
    }
  };

  const batalkanEdit = () => {
    setBukuUntukEdit(null);
  };

  useEffect(() => {
    ambilDaftarBuku();
  }, []);

  const PesanStatus = () => {
    if (statusPengiriman === 'loading') {
      return (
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-700 font-bold px-6 py-4 rounded-xl shadow-lg animate-pulse">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Mengirim data ke Django...</span>
        </div>
      );
    }
    if (statusPengiriman === 'fetching') {
      return (
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 text-purple-700 font-bold px-6 py-4 rounded-xl shadow-lg animate-pulse">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Mengambil daftar buku...</span>
        </div>
      );
    }
    if (statusPengiriman === 'deleting') {
      return (
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-700 font-bold px-6 py-4 rounded-xl shadow-lg animate-pulse">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Menghapus buku...</span>
        </div>
      );
    }
    if (statusPengiriman === 'success') {
      return (
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-green-800 font-bold px-6 py-4 rounded-xl shadow-lg">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>🎉 Sukses! Data buku berhasil diproses dan daftar diperbarui!</span>
        </div>
      );
    }
    if (statusPengiriman === 'error') {
      return (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 font-bold text-lg">⚠️ Pengiriman/Pengambilan Gagal!</span>
          </div>
          <pre className="text-sm font-mono text-left whitespace-pre-wrap mt-3 p-4 bg-red-100 border-2 border-red-300 rounded-lg overflow-auto text-red-900">
            {detailKesalahan}
          </pre>
          <p className="text-xs mt-3 text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cek konsol browser untuk detail kesalahan penuh.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center pt-8 font-sans pb-12">
      <script src="https://cdn.tailwindcss.com"></script>

      {/* Header dengan Gradient dan Animasi */}
      <header className="mb-10 p-8 w-full max-w-6xl text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl rounded-3xl border-4 border-white transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="bg-white p-3 rounded-2xl shadow-lg">
            <span className="text-5xl">📚</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Perpustakaan Digital
          </h1>
        </div>
        <p className="text-lg text-blue-100 font-semibold">
          CRUD Buku dengan React & Django API
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-white/90 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Kelola koleksi buku Anda dengan mudah dan modern</span>
        </div>
      </header>
      <FilterPanel
        onFilterChange={handleFilterChange}
        onReset={handleResetFilter}
      />
      <div className="w-full max-w-6xl px-4 mb-6">
        <PesanStatus />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
        <div>
          <BookForm
            onSubmit={tanganiPengirimanBuku}
            bookEdit={bukuUntukEdit}
            onCancel={batalkanEdit}
          />
        </div>

        <div className="space-y-6 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between border-b-4 border-gradient-to-r from-blue-500 to-indigo-500 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Daftar Buku
              </h2>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-full font-bold text-lg shadow-lg">
              {daftarBuku.length}
            </div>
          </div>

          {daftarBuku.length === 0 && statusPengiriman !== 'fetching' ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-5xl">📚</span>
              </div>
              <p className="text-gray-600 font-semibold text-lg mb-2">
                Belum Ada Buku
              </p>
              <p className="text-gray-500 italic p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 max-w-md mx-auto">
                Koleksi Anda masih kosong. Mulai tambahkan buku favorit menggunakan formulir di sebelah kiri! 📖
              </p>
            </div>
          ) : (
            <div className="space-y-5 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {daftarBuku.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={setBukuUntukEdit}
                  onDelete={tanganiHapusBuku}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-16 text-center space-y-3 px-4">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-gray-200 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-gray-700 font-semibold">API Endpoint:</p>
          </div>
          <code className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-lg text-sm font-mono text-gray-800 border-2 border-gray-300 inline-block">
            {API_URL}
          </code>
          <p className="text-gray-600 text-sm mt-4 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Logika API dikelola oleh <strong className="text-indigo-600">BookService</strong>
          </p>
        </div>
        <p className="text-gray-500 text-sm">
          Made with 💙 using React & Django
        </p>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
}

export default App;