const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 px-8 py-12 text-center border-b border-red-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <div className="inline-block bg-red-100 text-red-800 px-4 py-1 rounded-full text-sm font-semibold mb-3">
              ERROR 403
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Access Denied
            </h2>
          </div>

          <div className="px-8 py-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                Your current role does not have permission to access this
                resource. Please contact your administrator for assistance.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                Go Back
              </button>
              <a
                href="/"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 text-sm text-center"
              >
                Home
              </a>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support@education.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
