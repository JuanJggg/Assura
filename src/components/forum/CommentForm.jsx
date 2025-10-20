import React, { useState } from 'react';

const CommentForm = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('El contenido es obligatorio');
      return;
    }
    
    if (content.length < 5) {
      setError('El comentario debe tener al menos 5 caracteres');
      return;
    }

    onSubmit({ content });
    setContent('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu comentario..."
          rows={3}
          className={`w-full px-4 py-2 rounded-md border ${
            error ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 transition-colors duration-200"
        >
          Comentar
        </button>
      </div>
    </form>
  );
};

export default CommentForm;