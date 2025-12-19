'use client';

export default function DashboardHeader({ 
  title, 
  subtitle, 
  userName, 
  userRole,
  gradientFrom = "from-blue-500",
  gradientTo = "to-purple-600",
  onLogout,
  onBack
}) {
  return (
    <header className={`relative bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white p-8 rounded-2xl shadow-2xl mb-8 animate-fade-in overflow-hidden`}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      <div className="relative flex justify-between items-start">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute -left-2 top-0 bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30"
            aria-label="Quay lại"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className={onBack ? "flex-1 ml-14" : "flex-1"}>
          <h1 className="text-4xl font-bold mb-3 animate-slide-up drop-shadow-lg">
            {title}
          </h1>
          <p className="text-white/90 text-lg animate-slide-up animation-delay-100 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {subtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm opacity-80 mb-1">Xin chào,</div>
            <div className="font-semibold text-xl mb-3 flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {userName}
            </div>
            <div className="flex gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm font-medium backdrop-blur-sm border border-white/30 flex items-center gap-2"
                  aria-label="Quay lại"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
              )}
              <button
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm font-medium backdrop-blur-sm border border-white/30 flex items-center gap-2"
                aria-label="Đăng xuất"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
