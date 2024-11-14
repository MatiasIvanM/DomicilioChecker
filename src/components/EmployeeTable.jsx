import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFilter, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import FileUpload from './FileUpload';
import FilterSection from './FilterSection';

function EmployeeTable() {
    const [employees, setEmployees] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]); // Almacena todos los empleados
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
    const [itemsPerPage, setItemsPerPage] = useState(10); // Estado para la cantidad de elementos por página

    // Cargar todos los empleados solo una vez
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3001/employees');
            setAllEmployees(response.data); // Almacenar todos los empleados
            setEmployees(response.data); // Mostrar todos los empleados al principio
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees(); // Cargar los empleados inicialmente
    }, []);

    // Filtrar empleados según los filtros locales
    const applyFilters = () => {
        const filteredEmployees = allEmployees.filter(employee => {
            return (
                (!filters.legajo || employee.legajo.toString().includes(filters.legajo)) &&
                (!filters.nombre || employee.apellido_nombre.toLowerCase().includes(filters.nombre.toLowerCase())) &&
                (!filters.sitio || (employee.sitio && employee.sitio.toLowerCase().includes(filters.sitio.toLowerCase()))) &&
                (!filters.distanciaAveMin || employee.distancia_ave >= parseFloat(filters.distanciaAveMin)) &&
                (!filters.distanciaAveMax || employee.distancia_ave <= parseFloat(filters.distanciaAveMax)) &&
                (!filters.distanciaSmMin || employee.distancia_sm >= parseFloat(filters.distanciaSmMin)) &&
                (!filters.distanciaSmMax || employee.distancia_sm <= parseFloat(filters.distanciaSmMax))
            );
        });
        setEmployees(filteredEmployees);
    };

    useEffect(() => {
        applyFilters(); // Aplicar filtros cada vez que se cambian
    }, [filters, allEmployees]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileUpload = () => {
        applyFilters(); // Aplicar filtros si se suben nuevos archivos
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

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value)); // Cambiar la cantidad de elementos por página
        setCurrentPage(1); // Resetear la página a 1 cuando se cambie el número de elementos por página
    };

    //  * Paginacion
    const renderPagination = () => {
        const pageNumbers = [];
        const maxPageButtons = 3; // Número de botones de página alrededor de la página actual

        const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-end items-center mt-4 mr-4">
                <div className="flex space-x-2">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400 transition duration-150"
                    >
                        &laquo;
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400 transition duration-150"
                    >
                        &lt;
                    </button>

                    {pageNumbers.map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${currentPage === page ? 'bg-green-500 text-white' : 'bg-transparent text-gray-600'} hover:bg-green-100 transition duration-150`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400 transition duration-150"
                    >
                        &gt;
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400 transition duration-150"
                    >
                        &raquo;
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <label htmlFor="itemsPerPage" className="text-sm text-gray-600">Mostrar</label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="p-2 border-b-4 border-green-500 bg-transparent focus:border-gree-500 rounded-md"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                    <span className="text-sm text-gray-600">por página</span>
                </div>
            </div>
        );
    };



    return (
        <div className="p-6 max-w-full mx-auto max-h-full">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden max-h-full min-h-full">
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

                {/* Selector de elementos por página */}
                {renderPagination()}
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
                                        { label: 'Dist. AVE (m)', key: 'distancia_ave' },
                                        { label: 'Dist. SM (m)', key: 'distancia_sm' }
                                    ].map(({ label, key }) => (
                                        <th
                                            key={key}
                                            className="px-4 py-2 text-left text-sm font-semibold text-gray-500 cursor-pointer"
                                            onClick={() => requestSort(key)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {label}
                                                {sortConfig.key === key && (
                                                    <span>{sortConfig.direction === 'ascending' ? <FaArrowUp /> : <FaArrowDown />}</span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedEmployees.map(employee => (
                                    <tr key={employee.id}>
                                        <td className="px-4 py-2 text-xs">{employee.legajo}</td>
                                        <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap" style={{ maxWidth: '150px' }}>{employee.apellido_nombre}</td>
                                        <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap" style={{ maxWidth: '350px' }}>
                                            {employee.direccion}
                                        </td>
                                        <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap" style={{ maxWidth: '150px' }}>{employee.barrio}</td>
                                        <td className="px-4 py-2 text-xs">{employee.partido}</td>
                                        <td className="px-4 py-2 text-xs">{employee.localidad}</td>
                                        <td className="px-4 py-2 text-xs">{employee.sitio}</td>
                                        <td className="px-4 py-2 text-xs">{employee.distancia_ave}</td>
                                        <td className="px-4 py-2 text-xs">{employee.distancia_sm}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>


            </div>
        </div>
    );
}

export default EmployeeTable;
