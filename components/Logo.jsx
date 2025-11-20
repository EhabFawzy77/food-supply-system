'use client';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Logo SVG */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background Circle */}
        <circle cx="20" cy="20" r="18" fill="#4F46E5" opacity="0.1" />
        <circle cx="20" cy="20" r="18" stroke="#4F46E5" strokeWidth="1.5" />

        {/* Paint Brush Symbol */}
        <g transform="translate(8, 8)">
          {/* Brush Handle */}
          <rect x="2" y="8" width="2" height="10" fill="#4F46E5" rx="1" />
  
          {/* Brush Head */}
          <rect x="1" y="2" width="4" height="6" fill="#10B981" rx="0.5" />
  
          {/* Brush Bristles */}
          <line x1="0.5" y1="2" x2="0.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="1.5" y1="2" x2="1.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="2.5" y1="2" x2="2.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="3.5" y1="2" x2="3.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="4.5" y1="2" x2="4.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
  
          {/* Paint Drop */}
          <ellipse cx="12" cy="6" rx="2" ry="3" fill="#10B981" opacity="0.8" />
        </g>

        {/* Accents */}
        <circle cx="28" cy="12" r="2" fill="#10B981" opacity="0.6" />
        <circle cx="32" cy="28" r="1.5" fill="#4F46E5" opacity="0.6" />
      </svg>

      {/* Logo Text */}
      <div className="flex flex-col">
        <div className="text-lg font-bold text-gray-800 leading-tight">
          دهانات
        </div>
        <div className="text-xs text-indigo-600 font-semibold">
          مركز
        </div>
      </div>
    </div>
  );
}

export function LogoWithText() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo SVG */}
      <svg
        width="50"
        height="50"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background Circle */}
        <circle cx="20" cy="20" r="18" fill="#4F46E5" opacity="0.1" />
        <circle cx="20" cy="20" r="18" stroke="#4F46E5" strokeWidth="1.5" />

        {/* Paint Brush Symbol */}
        <g transform="translate(8, 8)">
          {/* Brush Handle */}
          <rect x="2" y="8" width="2" height="10" fill="#4F46E5" rx="1" />

          {/* Brush Head */}
          <rect x="1" y="2" width="4" height="6" fill="#10B981" rx="0.5" />

          {/* Brush Bristles */}
          <line x1="0.5" y1="2" x2="0.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="1.5" y1="2" x2="1.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="2.5" y1="2" x2="2.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="3.5" y1="2" x2="3.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="4.5" y1="2" x2="4.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />

          {/* Paint Drop */}
          <ellipse cx="12" cy="6" rx="2" ry="3" fill="#10B981" opacity="0.8" />
        </g>

        {/* Accents */}
        <circle cx="28" cy="12" r="2" fill="#10B981" opacity="0.6" />
        <circle cx="32" cy="28" r="1.5" fill="#4F46E5" opacity="0.6" />
      </svg>

      {/* Text Section */}
      <div>
        <div className="text-xl font-bold text-gray-800">
          نظام إدارة الدهانات
        </div>
        <div className="text-xs text-gray-600">
          إدارة مركز الدهانات
        </div>
      </div>
    </div>
  );
}

export function LogoIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Background Circle */}
      <circle cx="20" cy="20" r="18" fill="#4F46E5" opacity="0.1" />
      <circle cx="20" cy="20" r="18" stroke="#4F46E5" strokeWidth="1.5" />

      {/* Paint Brush Symbol */}
      <g transform="translate(8, 8)">
        {/* Brush Handle */}
        <rect x="2" y="8" width="2" height="10" fill="#4F46E5" rx="1" />

        {/* Brush Head */}
        <rect x="1" y="2" width="4" height="6" fill="#10B981" rx="0.5" />

        {/* Brush Bristles */}
        <line x1="0.5" y1="2" x2="0.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="1.5" y1="2" x2="1.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="2.5" y1="2" x2="2.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="3.5" y1="2" x2="3.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="4.5" y1="2" x2="4.5" y2="8" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" />

        {/* Paint Drop */}
        <ellipse cx="12" cy="6" rx="2" ry="3" fill="#10B981" opacity="0.8" />
      </g>

      {/* Accents */}
      <circle cx="28" cy="12" r="2" fill="#10B981" opacity="0.6" />
      <circle cx="32" cy="28" r="1.5" fill="#4F46E5" opacity="0.6" />
    </svg>
  );
}
