import React, { useState, useEffect } from 'react';
import API from '../../api';

const AdminListings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch listings data
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await API.get('/api/listings');
        setData(res.data);
        setFilteredData(res.data);
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Mock data fallback
        const mockListings = [
          { id: 1, brand: 'Rolex', model: 'Submariner', ref_no: '116610LN', price: '$8,500', seller: 'WatchDealer1', country: 'UK', status: 'active' },
          { id: 2, brand: 'Omega', model: 'Speedmaster', ref_no: '311.30.42.30.01.005', price: '$3,200', seller: 'TimeZone', country: 'USA', status: 'pending' },
          { id: 3, brand: 'Patek Philippe', model: 'Calatrava', ref_no: '5196P-001', price: '$32,000', seller: 'LuxuryWatch', country: 'UAE', status: 'sold' },
          { id: 4, brand: 'TAG Heuer', model: 'Monaco', ref_no: 'CAW2111.FC6183', price: '$1,800', seller: 'SportWatch', country: 'HK', status: 'active' },
          { id: 5, brand: 'Breitling', model: 'Navitimer', ref_no: 'A23322121B2A1', price: '$4,200', seller: 'AviationTime', country: 'UK', status: 'inactive' }
        ];
        setData(mockListings);
        setFilteredData(mockListings);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [data]);

  if (loading) return <div className="text-lg text-blue-500">Loading...</div>;
  if (!Array.isArray(filteredData) || filteredData.length === 0) return <div className="text-lg text-gray-500">No listings found.</div>;

  const headers = Object.keys(filteredData[0]);
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              {headers.map(h => (
                <th key={h} className="px-3 py-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">
                  {h.replace('_', ' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr
                key={row.id || row._id || i}
                className="border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50"
              >
                {headers.map(h => (
                  <td key={h} className={`px-3 py-4 text-sm border-b border-gray-100 ${h === 'price' ? 'text-blue-500 font-semibold' :
                      h === 'status' ? `text-${getStatusColor(row[h]) === '#10b981' ? 'green' :
                        getStatusColor(row[h]) === '#f59e0b' ? 'yellow' :
                          getStatusColor(row[h]) === '#6366f1' ? 'indigo' :
                            getStatusColor(row[h]) === '#ef4444' ? 'red' : 'gray'}-600` :
                        'text-gray-600'
                    } ${h === 'brand' || h === 'price' ? 'font-semibold' : 'font-normal'}`}>
                    {h === 'status' ? (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBgColor(row[h]) === '#f0fdf4' ? 'bg-green-100 text-green-600' :
                          getStatusBgColor(row[h]) === '#fef3c7' ? 'bg-yellow-100 text-yellow-600' :
                            getStatusBgColor(row[h]) === '#eef2ff' ? 'bg-indigo-100 text-indigo-600' :
                              getStatusBgColor(row[h]) === '#fef2f2' ? 'bg-red-100 text-red-600' :
                                'bg-gray-100 text-gray-600'
                        }`}>
                        {String(row[h]).toUpperCase()}
                      </span>
                    ) : (
                      String(row[h])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-lg shadow-sm mt-2 px-2 py-1 flex justify-end">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-800">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {[5, 10, 25, 50, 100].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span className="text-gray-800">
            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= filteredData.length}
              className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper functions for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'sold': return '#6366f1';
    case 'inactive': return '#ef4444';
    default: return '#6b7280';
  }
};

const getStatusBgColor = (status) => {
  switch (status) {
    case 'active': return '#f0fdf4';
    case 'pending': return '#fef3c7';
    case 'sold': return '#eef2ff';
    case 'inactive': return '#fef2f2';
    default: return '#f9fafb';
  }
};

export default AdminListings; 