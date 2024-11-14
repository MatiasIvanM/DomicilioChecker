import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import { GrUpdate } from "react-icons/gr";
import Download from './Download';

function FileUpload({ onUpload }) {
    const [dragging, setDragging] = useState(false);

    const handleFileChange = async (event) => {
        let file = null;

        // Si es un evento de cambio de archivo (input)
        if (event.target.files) {
            file = event.target.files[0];
        }

        // Si es un evento de arrastre (drag and drop)
        if (event.dataTransfer && event.dataTransfer.files) {
            file = event.dataTransfer.files[0];
        }

        if (!file) return;

        const formData = new FormData();
        formData.append('excel', file);

        try {
            const response = await fetch('http://localhost:3001/upload', {
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

    const handlerUpdate = async () => {
        try {
            const response = await fetch('http://localhost:3001/update');

            if (response.ok) {
                const result = await response.json();
                console.log(result);
            } else {
                console.error('Error al actualizar');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        if (!dragging) {
            setDragging(true);
        }
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        handleFileChange(event);
    };

    return (
        <>
            <div
                className={`flex flex-col items-center justify-center gap-2 
            ${dragging ? 'border-2 border-white' : 'border-2 border-dashed border-white'} 
            bg-transparent p-2 rounded-lg w-64 h-16`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <label className="bg-white text-green-500 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-200 transition cursor-pointer text-sm w-60 h-12">
                    <FaUpload className="w-4 h-4" />
                    <span className="ml-4 text-s">Subir o arrastrar Excel aquí</span>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

            </div>
            <Download fileName="DomiciliosParaRevisar.xlsx" displayName="Descargar Domicilios" />
            <button
                className="bg-white text-green-500 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-200 transition h-12 w-auto"
                onClick={handlerUpdate}
            >
                <GrUpdate className="w-8 h-8" />
            </button>
        </>
    );
}

export default FileUpload;
