import React, { useState, useEffect } from 'react';
import API from '../../api';

const AdminSettings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await API.get('/api/admin/settings');
        setData(res.data);
        setFilteredData(res.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Mock data fallback
        const mockSettings = [
          { id: 1, key: 'site_name', value: 'Admin Dashboard', type: 'string', description: 'Site name' },
          { id: 2, key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Maintenance mode' },
          { id: 3, key: 'max_users', value: '1000', type: 'number', description: 'Maximum users allowed' },
          { id: 4, key: 'email_notifications', value: 'true', type: 'boolean', description: 'Email notifications enabled' }
        ];
        setData(mockSettings);
        setFilteredData(mockSettings);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [data]);

  if (loading) return <div className="text-lg text-blue-500">Loading...</div>;
  if (!Array.isArray(filteredData) || filteredData.length === 0) return <div className="text-lg text-gray-500">No settings found.</div>;

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
                  {h}
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
                  <td key={h} className="px-3 py-4 text-gray-600 text-sm border-b border-gray-100">
                    {String(row[h])}
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

export default AdminSettings; 