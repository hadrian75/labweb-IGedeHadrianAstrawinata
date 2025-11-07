import { useState, useEffect } from 'react';

function BookForm({ onSubmit, bookEdit, onCancel }) {
  const [formData, setFormData] = useState({
    nama: '',
    author: '',
    rating: 'excellent',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  useEffect(() => {
    if (bookEdit) {
      setFormData({
        nama: bookEdit.name || '',
        author: bookEdit.author || '',
        rating: bookEdit.rating || 'excellent',
        image: null,
      });
      if (bookEdit.image) {
        setImagePreview(bookEdit.image);
      }
    } else {
      setFormData({
        nama: '',
        author: '',
        rating: 'excellent',
        image: null,
      });
      setImagePreview(null);
    }
  }, [bookEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Exceeds Image Size. Max 5MB.");
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, JPEG, PNG, and WEBP formats are allowed.");
        return;
      }
    }

    setFormData({
      ...formData,
      image: file,
    });
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    }
    reader.readAsDataURL(file);
  }

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null,
    });
    setImagePreview(null);

    const fileInput = document.getElementById('image-upload')
    if (fileInput) {
      fileInput.value = '';
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    } else {
      console.error("BookForm: onSubmit prop is missing or not a function.");
    }

    if (!bookEdit) {
      setFormData({
        nama: '',
        author: '',
        rating: 'excellent',
        image: null,
      });
    }
    setImagePreview(null);
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-8 rounded-2xl shadow-2xl border-2 border-blue-100 transition-all duration-300 hover:shadow-3xl sticky top-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg mb-4">
          <span className="text-3xl">{bookEdit ? '✏️' : '➕'}</span>
        </div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          {bookEdit ? 'Edit Buku' : 'Tambah Buku Baru'}
        </h2>
        <p className="text-gray-600 text-sm mt-2">
          {bookEdit ? 'Perbarui informasi buku yang ada' : 'Isi formulir untuk menambahkan buku'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className='group'>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Cover Buku (Opsional)
          </label>

          {imagePreview && (
            <div className="mb-4 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl border-4 border-gray-200 shadow-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="relative">
            <input
              type="file"
              id="image-upload"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center gap-3 w-full px-5 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 bg-white"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-semibold text-gray-600">
                {imagePreview ? 'Ganti Gambar' : 'Upload Cover Buku'}
              </span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Format: JPG, PNG, WebP. Max: 5MB
          </p>
        </div>

        <div className='group'>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Nama Buku
          </label>
          <input
            type='text'
            name='nama'
            value={formData.nama}
            onChange={handleChange}
            className='w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm group-hover:border-blue-400'
            placeholder='Contoh: Harry Potter and the Philosopher Stone'
            required
          />
        </div>

        <div className='group'>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Penulis
          </label>
          <input
            type='text'
            name='author'
            value={formData.author}
            onChange={handleChange}
            className='w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm group-hover:border-indigo-400'
            placeholder='Contoh: J.K. Rowling'
            required
          />
        </div>

        <div className='group'>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Rating Buku
          </label>
          <div className="relative">
            <select
              name='rating'
              value={formData.rating}
              onChange={handleChange}
              className='w-full px-5 py-3 border-2 border-gray-300 rounded-xl appearance-none bg-white focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 transition-all duration-200 cursor-pointer shadow-sm font-semibold text-gray-700 group-hover:border-yellow-400'
              required
            >
              <option value="excellent">⭐⭐⭐⭐⭐ excellent (Sangat Bagus)</option>
              <option value="average">⭐⭐⭐ Average (Biasa Saja)</option>
              <option value="bad">⭐ Bad (Kurang Bagus)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-600">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {bookEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95 border-2 border-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Batalkan
            </button>
          )}
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {bookEdit ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              )}
            </svg>
            {bookEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-xs text-gray-600 text-center">
          <span className="font-bold text-blue-700">💡 Tips:</span> Upload cover buku untuk tampilan yang lebih menarik!
        </p>
      </div>
    </div>
  );
}

export default BookForm;