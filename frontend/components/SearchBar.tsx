import React from 'react';

interface Props {
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  onClear: () => void;
  showClear: boolean;
}

function SearchBar({ value, handleChange, placeholder, onClear, showClear }: Props) {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center bg-mist-800 rounded-full px-3 py-2">
        {/* Search Icon */}
        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
        />
        {showClear && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
