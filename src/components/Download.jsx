import React from 'react';
import { FaDownload } from 'react-icons/fa';

const Download = ({ fileName, displayName }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `/${fileName}`; // Usa una ruta relativa al archivo en la carpeta public
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleDownload}
            className="bg-white text-green-500 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-200 transition"
        >
            <FaDownload />
            {displayName || 'Descargar Archivo'}
        </button>
    );
};

export default Download;
