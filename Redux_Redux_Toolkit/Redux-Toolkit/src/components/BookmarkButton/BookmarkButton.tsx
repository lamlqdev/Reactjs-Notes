import React from 'react';
import './BookmarkButton.css';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  size?: 'small' | 'medium' | 'large';
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isBookmarked,
  onToggle,
  size = 'medium'
}) => {
  return (
    <button
      className={`bookmark-button bookmark-button--${size} ${
        isBookmarked ? 'bookmark-button--active' : ''
      }`}
      onClick={onToggle}
      aria-label={isBookmarked ? 'Bỏ bookmark' : 'Thêm bookmark'}
    >
      <svg
        width={size === 'small' ? '18' : size === 'large' ? '24' : '20'}
        height={size === 'small' ? '18' : size === 'large' ? '24' : '20'}
        viewBox="0 0 24 24"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {isBookmarked ? 'Đã lưu' : 'Lưu'}
    </button>
  );
};

export default BookmarkButton;

