import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Previous
      </button>

      {pages.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-3 py-1 border rounded ${
            currentPage === pageNum
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};