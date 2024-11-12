import React from 'react';

function FilterSection({ filters, onFilterChange }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Legajo</label>
                <div className="mt-1 relative rounded-md shadow-xl">
                    <input
                        type="text"
                        name="legajo"
                        value={filters.legajo}
                        onChange={onFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Buscar por legajo..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <div className="mt-1 relative rounded-md shadow-xl">
                    <input
                        type="text"
                        name="nombre"
                        value={filters.nombre}
                        onChange={onFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Buscar por nombre..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Sitio</label>
                <div className="mt-1 relative rounded-md shadow-xl">
                    <input
                        type="text"
                        name="sitio"
                        value={filters.sitio}
                        onChange={onFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Buscar por sitio..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Distancia AVE</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        name="distanciaAveMin"
                        value={filters.distanciaAveMin}
                        onChange={onFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Min"
                    />
                    <input
                        type="number"
                        name="distanciaAveMax"
                        value={filters.distanciaAveMax}
                        onChange={onFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Max"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Distancia SM</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        name="distanciaSmMin"
                        value={filters.distanciaSmMin}
                        onChange={onFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Min"
                    />
                    <input
                        type="number"
                        name="distanciaSmMax"
                        value={filters.distanciaSmMax}
                        onChange={onFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Max"
                    />
                </div>
            </div>
        </div>
    );
}

export default FilterSection;