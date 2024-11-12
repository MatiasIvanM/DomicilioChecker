import React from 'react';
import { FaUpload } from 'react-icons/fa';

function FileUpload({ onUpload }) {
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('excel', file);

        try {
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                onUpload(result);
            } else {
                console.error('Error al subir el archivo');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
                <FaUpload className="w-5 h-5" />
                <span>Subir Excel</span>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </label>
        </div>
    );
}

export default FileUpload;