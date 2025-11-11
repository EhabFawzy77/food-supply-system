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

        {/* Fork and Knife (Food Symbol) */}
        <g transform="translate(8, 8)">
          {/* Fork */}
          <line x1="3" y1="2" x2="3" y2="18" stroke="#4F46E5" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="2" cy="1" r="0.8" fill="#4F46E5" />
          <line x1="1" y1="6" x2="0.5" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="3" y1="6" x2="3" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="5" y1="6" x2="5.5" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />

          {/* Leaf (Growth/Supply) */}
          <path
            d="M 12 2 Q 14 5 13 10 Q 12 15 10 16 Q 12 15 13 10 Q 14 5 12 2"
            fill="#10B981"
            opacity="0.8"
          />
          <line x1="12" y1="2" x2="10" y2="16" stroke="#059669" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* Accents */}
        <circle cx="28" cy="12" r="2" fill="#10B981" opacity="0.6" />
        <circle cx="32" cy="28" r="1.5" fill="#4F46E5" opacity="0.6" />
      </svg>

      {/* Logo Text */}
      <div className="flex flex-col">
        <div className="text-lg font-bold text-gray-800 leading-tight">
          توريد
        </div>
        <div className="text-xs text-indigo-600 font-semibold">
          الغذاء
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

        {/* Fork and Knife (Food Symbol) */}
        <g transform="translate(8, 8)">
          {/* Fork */}
          <line x1="3" y1="2" x2="3" y2="18" stroke="#4F46E5" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="2" cy="1" r="0.8" fill="#4F46E5" />
          <line x1="1" y1="6" x2="0.5" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="3" y1="6" x2="3" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="5" y1="6" x2="5.5" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />

          {/* Leaf (Growth/Supply) */}
          <path
            d="M 12 2 Q 14 5 13 10 Q 12 15 10 16 Q 12 15 13 10 Q 14 5 12 2"
            fill="#10B981"
            opacity="0.8"
          />
          <line x1="12" y1="2" x2="10" y2="16" stroke="#059669" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* Accents */}
        <circle cx="28" cy="12" r="2" fill="#10B981" opacity="0.6" />
        <circle cx="32" cy="28" r="1.5" fill="#4F46E5" opacity="0.6" />
      </svg>

      {/* Text Section */}
      <div>
        <div className="text-xl font-bold text-gray-800">
          نظام توريد الغذاء
        </div>
        <div className="text-xs text-gray-600">
          إدارة سلسلة التوريد الغذائية
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

      {/* Fork and Knife (Food Symbol) */}
      <g transform="translate(8, 8)">
        {/* Fork */}
        <line x1="3" y1="2" x2="3" y2="18" stroke="#4F46E5" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="2" cy="1" r="0.8" fill="#4F46E5" />
        <line x1="1" y1="6" x2="0.5" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="3" y1="6" x2="3" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="5" y1="6" x2="5.5" y2="14" stroke="#4F46E5" strokeWidth="0.8" strokeLinecap="round" />

        {/* Leaf (Growth/Supply) */}
        <path
          d="M 12 2 Q 14 5 13 10 Q 12 15 10 16 Q 12 15 13 10 Q 14 5 12 2"
          fill="#10B981"
          opacity="0.8"
        />
        <line x1="12" y1="2" x2="10" y2="16" stroke="#059669" strokeWidth="0.6" strokeLinecap="round" />
      </g>

      {/* Accents */}
      <circle cx="28" cy="12" r="2" fill="#10B981" opacity="0.6" />
      <circle cx="32" cy="28" r="1.5" fill="#4F46E5" opacity="0.6" />
    </svg>
  );
}
