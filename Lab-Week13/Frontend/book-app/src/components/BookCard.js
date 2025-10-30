import React from 'react';

function BookCard({ book, onEdit, onDelete }) {
  const getRatingConfig = (rating) => {
    const lowerRating = rating ? rating.toLowerCase() : 'average';

    switch (lowerRating) {
      case "excellent":
        return {
          display: "Sangat Bagus",
          stars: "⭐⭐⭐⭐⭐",
          color: "text-emerald-700",
          bgColor: "bg-gradient-to-r from-emerald-50 to-green-50",
          borderColor: "border-emerald-300",
          icon: "🏆"
        };
      case "average":
        return {
          display: "Biasa Saja",
          stars: "⭐⭐⭐",
          color: "text-amber-700",
          bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
          borderColor: "border-amber-300",
          icon: "👍"
        };
      case "bad":
        return {
          display: "Kurang Bagus",
          stars: "⭐",
          color: "text-rose-700",
          bgColor: "bg-gradient-to-r from-rose-50 to-red-50",
          borderColor: "border-rose-300",
          icon: "📉"
        };
      default:
        return {
          display: "Biasa Saja",
          stars: "⭐⭐⭐",
          color: "text-amber-700",
          bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
          borderColor: "border-amber-300",
          icon: "👍"
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak diketahui';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const ratingConfig = getRatingConfig(book.rating);
  const defaultImage = "https://via.placeholder.com/400x300/6366f1/ffffff?text=No+Cover";

  return (
    <div className="group bg-gradient-to-br from-white via-white to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
        <img
          src={book.image || defaultImage}
          alt={book.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          <span className="text-2xl">📚</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-blue-700 transition-colors mb-3 line-clamp-2">
          {book.name}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm font-semibold truncate">{book.author}</span>
        </div>

        <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${ratingConfig.bgColor} ${ratingConfig.borderColor} border-2 mb-4 shadow-sm`}>
          <span className="text-xl">{ratingConfig.icon}</span>
          <span className="text-base">{ratingConfig.stars}</span>
          <span className={`text-sm font-bold ${ratingConfig.color}`}>
            {ratingConfig.display}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-xs mb-5 pb-5 border-b-2 border-gray-100 bg-gray-50 -mx-2 px-4 py-2 rounded-lg">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Ditambahkan: <span className="font-bold text-gray-700">{formatDate(book.uploaded)}</span></span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(book)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;