import { useState, useEffect, useRef } from 'react';
import { Plus, Layers, Settings2, X, Edit2, Trash2 } from 'lucide-react';

const MetricGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', metricIds: [] as number[] });
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchGroups = () => {
    fetch('http://localhost:3001/api/metric-groups')
      .then(res => res.json())
      .then(data => setGroups(data));
  };

  useEffect(() => {
    fetchGroups();
    fetch('http://localhost:3001/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/metric-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewGroup({ name: '', description: '', metricIds: [] });
        fetchGroups();
      }
    } catch (error) {
      console.error('Failed to add metric group', error);
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/metric-groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingGroup.name,
          description: editingGroup.description,
          metricIds: editingGroup.metricIds
        })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingGroup(null);
        fetchGroups();
      }
    } catch (error) {
      console.error('Failed to edit metric group', error);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this metric group?')) {
      try {
        const res = await fetch(`http://localhost:3001/api/metric-groups/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchGroups();
        }
      } catch (error) {
        console.error('Failed to delete metric group', error);
      }
    }
    setOpenMenuId(null);
  };

  const openEditModal = (group: any) => {
    setEditingGroup({ 
      ...group, 
      metricIds: group.metrics?.map((m: any) => m.id) || []
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const toggleMetricSelection = (metricId: number, isEditing: boolean) => {
    if (isEditing) {
      setEditingGroup((prev: any) => {
        const isSelected = prev.metricIds.includes(metricId);
        if (isSelected) {
          return { ...prev, metricIds: prev.metricIds.filter((id: number) => id !== metricId) };
        } else {
          return { ...prev, metricIds: [...prev.metricIds, metricId] };
        }
      });
    } else {
      setNewGroup(prev => {
        const isSelected = prev.metricIds.includes(metricId);
        if (isSelected) {
          return { ...prev, metricIds: prev.metricIds.filter(id => id !== metricId) };
        } else {
          return { ...prev, metricIds: [...prev.metricIds, metricId] };
        }
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Add Group Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add Metric Group</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                <input 
                  type="text" 
                  required
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Security Assessment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="What is this group for?"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Metrics</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {metrics.map(metric => (
                    <label key={metric.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newGroup.metricIds.includes(metric.id)}
                        onChange={() => toggleMetricSelection(metric.id, false)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-700">{metric.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/30"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditModalOpen && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Edit Metric Group</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                <input 
                  type="text" 
                  required
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Metrics</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {metrics.map(metric => (
                    <label key={metric.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingGroup.metricIds.includes(metric.id)}
                        onChange={() => toggleMetricSelection(metric.id, true)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-700">{metric.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sm:flex sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Metric Groups</h1>
          <p className="mt-2 text-base text-slate-500 max-w-2xl">Group metrics together to assign them to specific products.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-lg shadow-blue-500/30 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.length === 0 ? (
          <div className="col-span-full glass-card p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <Layers className="h-10 w-10 text-slate-400 -rotate-3" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No metric groups defined</h3>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto">Get started by creating a new metric group.</p>
          </div>
        ) : (
          groups.map((group: any) => (
            <div key={group.id} className="glass-card flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === group.id ? null : group.id)}
                      className="text-slate-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Settings2 className="h-5 w-5" />
                    </button>
                    {openMenuId === group.id && (
                      <div ref={menuRef} className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                        <button
                          onClick={() => openEditModal(group)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                        >
                          <Edit2 className="w-4 h-4 mr-2 text-slate-400" />
                          Edit Group
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2 text-rose-500" />
                          Delete Group
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  {group.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {group.description || 'No description provided.'}
                </p>
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Metrics ({group.metrics?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                    {group.metrics?.map((m: any) => (
                      <span key={m.id} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MetricGroups;