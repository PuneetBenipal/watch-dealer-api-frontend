import React from 'react';

const AdminDashboard = ({ adminUser }) => {
  return (
    <div>
      <div className="flex items-center mb-8">
        <img 
          src={adminUser.avatar} 
          alt={adminUser.name}
          className="w-14 h-14 rounded-full border-2 border-blue-500 mr-4" 
        />
        <div>
          <h1 className="text-gray-800 font-bold text-2xl">Welcome, {adminUser.name}!</h1>
          <p className="text-blue-500 text-lg">This is your admin dashboard.</p>
        </div>
      </div>
      <h2 className="text-blue-500 mb-6 text-2xl font-bold">Dashboard Overview</h2>
      <div className="text-gray-800 text-xl font-medium">You can manage users, settings, and more from the sidebar.</div>
    </div>
  );
};

export default AdminDashboard; 