import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFilter } from 'react-icons/fa';
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import FileUpload from './FileUpload';
import FilterSection from './FilterSection';

function EmployeeTable() {
    const [employees, setEmployees] = useState([]);
    const [filters, setFilters] = useState({
        legajo: '',
        nombre: '',
        sitio: '',
        distanciaAveMin: '',
        distanciaAveMax: '',
        distanciaSmMin: '',
        distanciaSmMax: ''
    });
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await axios.get(`http://localhost:3001/employees?${params}`);
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileUpload = () => {
        fetchEmployees();
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedEmployees = React.useMemo(() => {
        let sortableEmployees = [...employees];
        if (sortConfig.key !== null) {
            sortableEmployees.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableEmployees;
    }, [employees, sortConfig]);

    const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(employees.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPagination = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // Number of page buttons to show around the current page

        const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-center items-center space-x-2">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 text-gray-500 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                    &laquo;
                </button>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 text-gray-500 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                    &lt;
                </button>

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded ${currentPage === page ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 text-gray-500 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                    &gt;
                </button>
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 text-gray-500 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                    &raquo;
                </button>
            </div>
        );

    };

    return (
        <div className="p-6 max-w-full mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-green-400 to-green-700 flex justify-between items-center h-20">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FaFilter className="w-6 h-6" />
                        Domicilios de Empleados
                    </h1>
                    <FileUpload onUpload={handleFileUpload} />
                </div>

                <div className="p-6 bg-gray-50 border-b">
                    <FilterSection filters={filters} onFilterChange={handleFilterChange} />
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        { label: 'Legajo', key: 'legajo' },
                                        { label: 'Nombre', key: 'apellido_nombre' },
                                        { label: 'Dirección', key: 'direccion' },
                                        { label: 'Barrio', key: 'barrio' },
                                        { label: 'Partido', key: 'partido' },
                                        { label: 'Localidad', key: 'localidad' },
                                        { label: 'Sitio', key: 'sitio' },
                                        { label: 'Dist. AVE', key: 'distancia_ave' },
                                        { label: 'Dist. SM', key: 'distancia_sm' }
                                    ].map(({ label, key }) => (
                                        <th
                                            key={key}
                                            onClick={() => requestSort(key)}
                                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer min-w-0
                                            ${sortConfig.key === key ? (sortConfig.direction === 'ascending' ? '⬆ text-blue-600' : '⬇ text-red-600') : ''}`}
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-xs font-medium text-gray-900 truncate">{employee.legajo}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 truncate">{employee.apellido_nombre}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 max-w-80 truncate">{employee.direccion}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 max-w-40 truncate">{employee.barrio}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 truncate">{employee.partido}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 truncate">{employee.localidad}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 truncate">{employee.sitio}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 truncate">{employee.distancia_ave}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 truncate">{employee.distancia_sm}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Renderizar paginación */}
                <div className="p-4">{renderPagination()}</div>
            </div>
        </div>
    );
}

export default EmployeeTable;
