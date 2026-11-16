import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function FloatingAddButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/add')}
      aria-label="Add expense"
      className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700
                 text-white rounded-full shadow-xl shadow-primary-300 dark:shadow-primary-900
                 flex items-center justify-center
                 transition-all duration-200 active:scale-90 hover:scale-105"
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  );
}
