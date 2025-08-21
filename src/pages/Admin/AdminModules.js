import React, { useState, useEffect } from 'react';
import {
    SearchIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    CogIcon,
    ShieldCheckIcon,
    PuzzleIcon as PuzzlePieceIcon,
} from '@heroicons/react/outline';
import API from '../../api';
import { Toast } from '../../components/Alerts/CustomToast';

const AdminModules = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredModules, setFilteredModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newModule, setNewModule] = useState({
        id: '',
        name: '',
        description: '',
        enabled: false,
        category: 'general',
        permissions: []
    });

    // Available module categories
    const moduleCategories = [
        { id: 'general', name: 'General', color: 'bg-blue-100 text-blue-800' },
        { id: 'analytics', name: 'Analytics', color: 'bg-green-100 text-green-800' },
        { id: 'communication', name: 'Communication', color: 'bg-purple-100 text-purple-800' },
        { id: 'security', name: 'Security', color: 'bg-red-100 text-red-800' },
        { id: 'integration', name: 'Integration', color: 'bg-yellow-100 text-yellow-800' }
    ];

    // Available permissions
    const availablePermissions = [
        'read',
        'write',
        'delete',
        'admin',
        'export',
        'import',
        'approve',
        'reject'
    ];

    // Fetch modules from backend
    const fetchModules = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await API.get('/api/admin/modules');
            const modulesData = response.data || [];

            // If no modules found, create default modules
            if (modulesData.length === 0) {
                const defaultModules = [
                    {
                        id: 'analytics',
                        name: 'Analytics Dashboard',
                        description: 'Access to analytics and reporting features',
                        enabled: true,
                        category: 'analytics',
                        permissions: ['read', 'export'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'chat',
                        name: 'Chat Support',
                        description: 'Customer support chat functionality',
                        enabled: true,
                        category: 'communication',
                        permissions: ['read', 'write'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'reports',
                        name: 'Reports Generator',
                        description: 'Generate and view detailed reports',
                        enabled: true,
                        category: 'analytics',
                        permissions: ['read', 'export'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'api',
                        name: 'API Access',
                        description: 'API integration capabilities',
                        enabled: false,
                        category: 'integration',
                        permissions: ['read', 'write'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'export',
                        name: 'Data Export',
                        description: 'Export data functionality',
                        enabled: true,
                        category: 'general',
                        permissions: ['read', 'export'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 'advanced',
                        name: 'Advanced Features',
                        description: 'Advanced user features and settings',
                        enabled: false,
                        category: 'general',
                        permissions: ['read', 'write', 'admin'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];
                setModules(defaultModules);
                setFilteredModules(defaultModules);
            } else {
                setModules(modulesData);
                setFilteredModules(modulesData);
            }
        } catch (err) {
            console.error('Error fetching modules:', err);
            setError('Failed to load modules. Please try again.');
            // Fallback to default modules
            const fallbackModules = [
                {
                    id: 'analytics',
                    name: 'Analytics Dashboard',
                    description: 'Access to analytics and reporting features',
                    enabled: true,
                    category: 'analytics',
                    permissions: ['read', 'export']
                },
                {
                    id: 'chat',
                    name: 'Chat Support',
                    description: 'Customer support chat functionality',
                    enabled: true,
                    category: 'communication',
                    permissions: ['read', 'write']
                }
            ];
            setModules(fallbackModules);
            setFilteredModules(fallbackModules);
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchModules();
    }, []);

    // Filter modules based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredModules(modules);
        } else {
            const filtered = modules.filter(module =>
                module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                module.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredModules(filtered);
        }
    }, [searchTerm, modules]);

    // Handle module toggle
    const handleToggleModule = async (moduleId, enabled) => {
        try {
            setLoading(true);

            // Update in backend
            await API.put(`/api/admin/modules/${moduleId}`, { enabled });

            // Update local state
            const updatedModules = modules.map(module =>
                module.id === moduleId ? { ...module, enabled } : module
            );
            setModules(updatedModules);

            Toast.success(`Module ${enabled ? 'enabled' : 'disabled'} successfully!`);
        } catch (error) {
            console.error('Error toggling module:', error);
            Toast.error('Failed to update module status');
        } finally {
            setLoading(false);
        }
    };

    // Handle module creation
    const handleCreateModule = async () => {
        try {
            if (!newModule.id || !newModule.name) {
                Toast.error('Please fill in all required fields');
                return;
            }

            setLoading(true);

            // Check if module ID already exists
            if (modules.find(m => m.id === newModule.id)) {
                Toast.error('Module ID already exists');
                return; 
            }

            // Create module in backend
            const response = await API.post('/api/admin/modules', newModule);

            // Add to local state
            const createdModule = response.data;
            setModules([...modules, createdModule]);

            // Reset form
            setNewModule({
                id: '',
                name: '',
                description: '',
                enabled: false,
                category: 'general',
                permissions: []
            });
            setEditDialogOpen(false);

            Toast.success('Module created successfully!');
        } catch (error) {
            console.error('Error creating module:', error);
            Toast.error('Failed to create module');
        } finally {
            setLoading(false);
        }
    };

    // Handle module update
    const handleUpdateModule = async () => {
        try {
            if (!selectedModule.id || !selectedModule.name) {
                Toast.error('Please fill in all required fields');
                return;
            }

            setLoading(true);

            // Update module in backend
            await API.put(`/api/admin/modules/${selectedModule.id}`, selectedModule);

            // Update local state
            const updatedModules = modules.map(module =>
                module.id === selectedModule.id ? selectedModule : module
            );
            setModules(updatedModules);

            setEditDialogOpen(false);
            setSelectedModule(null);

            Toast.success('Module updated successfully!');
        } catch (error) {
            console.error('Error updating module:', error);
            Toast.error('Failed to update module');
        } finally {
            setLoading(false);
        }
    };

    // Handle module deletion
    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);

            // Delete from backend
            await API.delete(`/api/admin/modules/${moduleId}`);

            // Remove from local state
            const updatedModules = modules.filter(module => module.id !== moduleId);
            setModules(updatedModules);

            Toast.success('Module deleted successfully!');
        } catch (error) {
            console.error('Error deleting module:', error);
            Toast.error('Failed to delete module');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit module
    const handleEditModule = (module) => {
        setSelectedModule({ ...module });
        setEditDialogOpen(true);
    };

    // Get category color
    const getCategoryColor = (category) => {
        const categoryObj = moduleCategories.find(c => c.id === category);
        return categoryObj ? categoryObj.color : 'bg-gray-100 text-gray-800';
    };

    // Get category name
    const getCategoryName = (category) => {
        const categoryObj = moduleCategories.find(c => c.id === category);
        return categoryObj ? categoryObj.name : category;
    };

    if (loading && modules.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-lg text-blue-500">Loading modules...</div>
                </div>
            </div>
        );
    }

    if (error && modules.length === 0) {
        return (
            <div className="text-lg text-red-500 text-center p-5">
                {error}
                <br />
                <button
                    onClick={fetchModules}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Modules Management</h1>
                    <p className="text-gray-600">Manage system modules and their permissions</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedModule(null);
                        setNewModule({
                            id: '',
                            name: '',
                            description: '',
                            enabled: false,
                            category: 'general',
                            permissions: []
                        });
                        setEditDialogOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Module
                </button>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search modules by name, description, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => (
                    <div key={module.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        {module.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3">
                                        {module.description}
                                    </p>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(module.category)}`}>
                                            {getCategoryName(module.category)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${module.enabled
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {module.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            {module.permissions && module.permissions.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {module.permissions.map((permission) => (
                                            <span
                                                key={permission}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                            >
                                                {permission}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleToggleModule(module.id, !module.enabled)}
                                    disabled={loading}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${module.enabled
                                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                        }`}
                                >
                                    {module.enabled ? (
                                        <>
                                            <XCircleIcon className="w-4 h-4" />
                                            Disable
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Enable
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditModule(module)}
                                        className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteModule(module.id)}
                                        className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredModules.length === 0 && (
                <div className="text-center py-12">
                    <CogIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No modules found' : 'No modules available'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm
                            ? 'Try adjusting your search terms.'
                            : 'Get started by creating your first module.'
                        }
                    </p>
                </div>
            )}

            {/* Edit/Create Dialog */}
            {editDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 text-xl">
                                {selectedModule ? 'Edit Module' : 'Create New Module'}
                            </h3>
                            <button
                                onClick={() => {
                                    setEditDialogOpen(false);
                                    setSelectedModule(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Module ID *
                                </label>
                                <input
                                    type="text"
                                    value={selectedModule ? selectedModule.id : newModule.id}
                                    onChange={(e) => {
                                        if (selectedModule) {
                                            setSelectedModule({ ...selectedModule, id: e.target.value });
                                        } else {
                                            setNewModule({ ...newModule, id: e.target.value });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., analytics, chat, reports"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Module Name *
                                </label>
                                <input
                                    type="text"
                                    value={selectedModule ? selectedModule.name : newModule.name}
                                    onChange={(e) => {
                                        if (selectedModule) {
                                            setSelectedModule({ ...selectedModule, name: e.target.value });
                                        } else {
                                            setNewModule({ ...newModule, name: e.target.value });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Analytics Dashboard"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={selectedModule ? selectedModule.description : newModule.description}
                                    onChange={(e) => {
                                        if (selectedModule) {
                                            setSelectedModule({ ...selectedModule, description: e.target.value });
                                        } else {
                                            setNewModule({ ...newModule, description: e.target.value });
                                        }
                                    }}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe what this module does..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={selectedModule ? selectedModule.category : newModule.category}
                                    onChange={(e) => {
                                        if (selectedModule) {
                                            setSelectedModule({ ...selectedModule, category: e.target.value });
                                        } else {
                                            setNewModule({ ...newModule, category: e.target.value });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {moduleCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Permissions
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availablePermissions.map((permission) => (
                                        <label key={permission} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    (selectedModule ? selectedModule.permissions : newModule.permissions)?.includes(permission)
                                                }
                                                onChange={(e) => {
                                                    const currentPermissions = selectedModule ? selectedModule.permissions : newModule.permissions;
                                                    const updatedPermissions = e.target.checked
                                                        ? [...(currentPermissions || []), permission]
                                                        : (currentPermissions || []).filter(p => p !== permission);

                                                    if (selectedModule) {
                                                        setSelectedModule({ ...selectedModule, permissions: updatedPermissions });
                                                    } else {
                                                        setNewModule({ ...newModule, permissions: updatedPermissions });
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{permission}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedModule ? selectedModule.enabled : newModule.enabled}
                                        onChange={(e) => {
                                            if (selectedModule) {
                                                setSelectedModule({ ...selectedModule, enabled: e.target.checked });
                                            } else {
                                                setNewModule({ ...newModule, enabled: e.target.checked });
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Enable module</span>
                                </label>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setEditDialogOpen(false);
                                    setSelectedModule(null);
                                }}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={selectedModule ? handleUpdateModule : handleCreateModule}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (selectedModule ? 'Update Module' : 'Create Module')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminModules; 