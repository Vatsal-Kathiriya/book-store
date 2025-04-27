import React from 'react';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  cover: string;
  price: number;
  rating: number;
  category?: string;
}

const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  cover,
  price,
  rating,
  category
}) => {
  return (
    <Link 
      href={`/books/${id}`}
      className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
    >
      <div className="relative overflow-hidden">
        <img 
          src={cover} 
          alt={title} 
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{author}</p>
        <div className="flex items-center mt-auto">
          <span className="flex items-center text-amber-500">
            <FiStar className="fill-current mr-1" />
            {rating}
          </span>
          <span className="ml-auto font-medium text-gray-900 dark:text-white">
            ${price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
