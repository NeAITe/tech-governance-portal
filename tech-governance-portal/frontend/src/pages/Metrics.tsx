import { useState, useEffect, useRef } from 'react';
import { Plus, BarChart2, Settings2, X, Edit2, Trash2 } from 'lucide-react';

const Metrics = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({ name: '', description: '', type: 'NUMBER', minScore: 1, maxScore: 10 });
  const [editingMetric, setEditingMetric] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchMetrics = () => {
    fetch('http://localhost:3001/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data));
  };

  useEffect(() => {
    fetchMetrics();
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

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetric)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewMetric({ name: '', description: '', type: 'NUMBER', minScore: 1, maxScore: 10 });
        fetchMetrics();
      }
    } catch (error) {
      console.error('Failed to add metric', error);
    }
  };

  const handleEditMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/metrics/${editingMetric.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingMetric.name,
          description: editingMetric.description,
          type: editingMetric.type,
          minScore: editingMetric.minScore,
          maxScore: editingMetric.maxScore
        })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingMetric(null);
        fetchMetrics();
      }
    } catch (error) {
      console.error('Failed to edit metric', error);
    }
  };

  const handleDeleteMetric = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this metric?')) {
      try {
        const res = await fetch(`http://localhost:3001/api/metrics/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchMetrics();
        }
      } catch (error) {
        console.error('Failed to delete metric', error);
      }
    }
    setOpenMenuId(null);
  };

  const openEditModal = (metric: any) => {
    setEditingMetric({ ...metric });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Add Metric Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add New Metric</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMetric} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Metric Name</label>
                <input 
                  type="text" 
                  required
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Security Score"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newMetric.description}
                  onChange={(e) => setNewMetric({...newMetric, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="What does this metric evaluate?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Metric Type</label>
                <select 
                  value={newMetric.type}
                  onChange={(e) => setNewMetric({...newMetric, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="NUMBER">Number Scale</option>
                  <option value="BOOLEAN">Yes/No</option>
                  <option value="CUSTOM_NUMBER">Custom Number</option>
                </select>
              </div>
              {newMetric.type === 'NUMBER' && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Score</label>
                    <input 
                      type="number" 
                      required
                      value={newMetric.minScore}
                      onChange={(e) => setNewMetric({...newMetric, minScore: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
                    <input 
                      type="number" 
                      required
                      value={newMetric.maxScore}
                      onChange={(e) => setNewMetric({...newMetric, maxScore: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
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
                  Save Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Metric Modal */}
      {isEditModalOpen && editingMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Edit Metric</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditMetric} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Metric Name</label>
                <input 
                  type="text" 
                  required
                  value={editingMetric.name}
                  onChange={(e) => setEditingMetric({...editingMetric, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={editingMetric.description}
                  onChange={(e) => setEditingMetric({...editingMetric, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Metric Type</label>
                <select 
                  value={editingMetric.type}
                  onChange={(e) => setEditingMetric({...editingMetric, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="NUMBER">Number Scale</option>
                  <option value="BOOLEAN">Yes/No</option>
                  <option value="CUSTOM_NUMBER">Custom Number</option>
                </select>
              </div>
              {editingMetric.type === 'NUMBER' && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Score</label>
                    <input 
                      type="number" 
                      required
                      value={editingMetric.minScore}
                      onChange={(e) => setEditingMetric({...editingMetric, minScore: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
                    <input 
                      type="number" 
                      required
                      value={editingMetric.maxScore}
                      onChange={(e) => setEditingMetric({...editingMetric, maxScore: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Evaluation Metrics</h1>
          <p className="mt-2 text-base text-slate-500 max-w-2xl">Define and manage the criteria used to evaluate software products.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-lg shadow-blue-500/30 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Metric
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.length === 0 ? (
          <div className="col-span-full glass-card p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <BarChart2 className="h-10 w-10 text-slate-400 -rotate-3" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No metrics defined</h3>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto">Get started by creating a new evaluation metric to standardize your assessments.</p>
          </div>
        ) : (
          metrics.map((metric: any) => (
            <div key={metric.id} className="glass-card flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between relative">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === metric.id ? null : metric.id)}
                    className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Settings2 className="h-5 w-5" />
                  </button>
                  {openMenuId === metric.id && (
                    <div ref={menuRef} className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                      <button
                        onClick={() => openEditModal(metric)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                      >
                        <Edit2 className="w-4 h-4 mr-2 text-slate-400" />
                        Edit Metric
                      </button>
                      <button
                        onClick={() => handleDeleteMetric(metric.id)}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2 text-rose-500" />
                        Delete Metric
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 flex items-center justify-between">
                  {metric.name}
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    {metric.type === 'BOOLEAN' ? 'Yes/No' : metric.type === 'CUSTOM_NUMBER' ? 'Custom Number' : `${metric.minScore || 1}-${metric.maxScore || 10} Scale`}
                  </span>
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {metric.description || 'No description provided.'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Metrics;