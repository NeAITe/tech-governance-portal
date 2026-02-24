import { useState, useEffect } from 'react';
import { ClipboardList, Plus, X, Star, Trash2, Edit2, Search } from 'lucide-react';

const Evaluations = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<any>(null);
  const [evaluationData, setEvaluationData] = useState<Record<number, { score: number, comments: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvaluations = () => {
    fetch('http://localhost:3001/api/evaluations').then(res => res.json()).then(data => setEvaluations(data));
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/products').then(res => res.json()).then(data => setProducts(data));
    fetchEvaluations();
  }, []);

  useEffect(() => {
    if (isAddModalOpen && selectedProductId) {
      const product = products.find(p => p.id === parseInt(selectedProductId));
      if (product && product.metricGroups) {
        const initialData: Record<number, { score: number, comments: string }> = {};
        product.metricGroups.forEach((group: any) => {
          group.metrics.forEach((m: any) => {
            if (!initialData[m.id]) {
               initialData[m.id] = { score: m.type === 'BOOLEAN' ? 1 : m.type === 'CUSTOM_NUMBER' ? 0 : (m.minScore || 1), comments: '' };
            }
          });
        });
        setEvaluationData(initialData);
      } else {
        setEvaluationData({});
      }
    } else {
      setEvaluationData({});
    }
  }, [isAddModalOpen, selectedProductId, products]);

  const handleAddEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = Object.entries(evaluationData).map(([metricId, data]) => ({
        productId: parseInt(selectedProductId),
        metricId: parseInt(metricId),
        score: data.score,
        comments: data.comments,
        stakeholders: ['']
      }));

      if (payload.length === 0) {
        alert("No metrics to evaluate for this product.");
        return;
      }

      const res = await fetch('http://localhost:3001/api/evaluations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setEvaluationData({});
        fetchEvaluations();
      }
    } catch (error) {
      console.error('Failed to add evaluations', error);
    }
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvaluation.id) {
        // Update existing
        const res = await fetch(`/api/evaluations/${editingEvaluation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: editingEvaluation.score,
            comments: editingEvaluation.comments
          })
        });
        if (res.ok) {
          setIsEditModalOpen(false);
          setEditingEvaluation(null);
          fetchEvaluations();
        }
      } else {
        // Create new (Batch endpoint handles single item creation implicitly if payload is array of 1)
        const payload = [{
            productId: parseInt(selectedProductId),
            metricId: editingEvaluation.metric.id,
            score: editingEvaluation.score,
            comments: editingEvaluation.comments,
            stakeholders: ['']
        }];

        const res = await fetch('http://localhost:3001/api/evaluations/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsEditModalOpen(false);
          setEditingEvaluation(null);
          fetchEvaluations();
        }
      }
    } catch (error) {
      console.error('Failed to save evaluation', error);
    }
  };

  const handleDeleteEvaluation = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      try {
        const res = await fetch(`http://localhost:3001/api/evaluations/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchEvaluations();
        }
      } catch (error) {
        console.error('Failed to delete evaluation', error);
      }
    }
  };

  const openEditModal = (metric: any, existingEval: any) => {
    if (existingEval) {
      setEditingEvaluation({ ...existingEval, metric });
    } else {
      setEditingEvaluation({ 
        metric, 
        score: metric.type === 'BOOLEAN' ? 1 : metric.type === 'CUSTOM_NUMBER' ? 0 : (metric.minScore || 1), 
        comments: '' 
      });
    }
    setIsEditModalOpen(true);
  };

  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
  const productEvaluations = evaluations.filter(e => e.productId === parseInt(selectedProductId));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Batch Evaluation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Batch Evaluation</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEvaluation} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
                  <select 
                    required
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="" disabled>Select a product to evaluate</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {selectedProductId && products.find(p => p.id === parseInt(selectedProductId))?.metricGroups?.length > 0 && (
                  <div className="space-y-6">
                    {products.find(p => p.id === parseInt(selectedProductId))?.metricGroups.map((group: any) => (
                      <div key={group.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800 flex justify-between items-center">
                          {group.name}
                          <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                            {group.metrics.length} metrics
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {group.metrics.map((metric: any) => {
                            const existingEval = productEvaluations.find(e => e.metricId === metric.id);
                            if (existingEval) return null; // Skip already evaluated metrics in batch mode
                            
                            return (
                              <div key={metric.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-slate-700">{metric.name}</span>
                                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {metric.type === 'BOOLEAN' ? 'Yes/No' : metric.type === 'CUSTOM_NUMBER' ? 'Custom Number' : `${metric.minScore || 1}-${metric.maxScore || 10} Scale`}
                                  </span>
                                </div>
                                {metric.description && <p className="text-xs text-slate-500">{metric.description}</p>}
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                  <div className="col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Score</label>
                                    {metric.type === 'BOOLEAN' ? (
                                      <select
                                        value={evaluationData[metric.id]?.score ?? 1}
                                        onChange={(e) => setEvaluationData(prev => ({ ...prev, [metric.id]: { ...prev[metric.id], score: parseInt(e.target.value) } }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                      >
                                        <option value={1}>Yes</option>
                                        <option value={0}>No</option>
                                      </select>
                                    ) : metric.type === 'CUSTOM_NUMBER' ? (
                                      <input 
                                        type="number" 
                                        required
                                        value={evaluationData[metric.id]?.score ?? 0}
                                        onChange={(e) => setEvaluationData(prev => ({ ...prev, [metric.id]: { ...prev[metric.id], score: parseInt(e.target.value) } }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                      />
                                    ) : (
                                      <input 
                                        type="number" 
                                        min={metric.minScore || 1} 
                                        max={metric.maxScore || 10}
                                        required
                                        value={evaluationData[metric.id]?.score ?? (metric.minScore || 1)}
                                        onChange={(e) => setEvaluationData(prev => ({ ...prev, [metric.id]: { ...prev[metric.id], score: parseInt(e.target.value) } }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                      />
                                    )}
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Comments (Optional)</label>
                                    <input 
                                      type="text"
                                      value={evaluationData[metric.id]?.comments ?? ''}
                                      onChange={(e) => setEvaluationData(prev => ({ ...prev, [metric.id]: { ...prev[metric.id], comments: e.target.value } }))}
                                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                      placeholder="Add a comment..."
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedProductId && products.find(p => p.id === parseInt(selectedProductId))?.metricGroups?.length === 0 && (
                  <div className="p-4 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200 flex items-center">
                    <span className="mr-2">⚠️</span>
                    This product has no metric groups assigned. Please assign metric groups to the product first.
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!selectedProductId || Object.keys(evaluationData).length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Evaluations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Create Evaluation Modal */}
      {isEditModalOpen && editingEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-slate-900">{editingEvaluation.id ? 'Edit Evaluation' : 'New Evaluation'}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEvaluation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                <input 
                  type="text" 
                  disabled
                  value={selectedProduct?.name}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Metric</label>
                <input 
                  type="text" 
                  disabled
                  value={editingEvaluation.metric?.name}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Score</label>
                {editingEvaluation.metric?.type === 'BOOLEAN' ? (
                  <select
                    value={editingEvaluation.score}
                    onChange={(e) => setEditingEvaluation({...editingEvaluation, score: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                ) : editingEvaluation.metric?.type === 'CUSTOM_NUMBER' ? (
                  <input 
                    type="number" 
                    required
                    value={editingEvaluation.score}
                    onChange={(e) => setEditingEvaluation({...editingEvaluation, score: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <input 
                    type="number" 
                    min={editingEvaluation.metric?.minScore || 1} 
                    max={editingEvaluation.metric?.maxScore || 10}
                    required
                    value={editingEvaluation.score}
                    onChange={(e) => setEditingEvaluation({...editingEvaluation, score: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
                <textarea 
                  value={editingEvaluation.comments}
                  onChange={(e) => setEditingEvaluation({...editingEvaluation, comments: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                />
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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Evaluations</h1>
          <p className="mt-2 text-base text-slate-500 max-w-2xl">Review and manage the evaluation process for software products.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-lg shadow-blue-500/30 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Evaluation
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Product to Evaluate</label>
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/50 sm:text-sm transition-all placeholder:text-slate-400"
              placeholder="Search products..."
            />
          </div>
          <select 
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/50 sm:text-sm"
          >
            <option value="" disabled>Select a product...</option>
            {filteredProducts.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {!selectedProductId ? (
        <div className="glass-card p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-gradient-to-b from-blue-50 to-transparent opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 border border-slate-100">
              <ClipboardList className="h-12 w-12 text-blue-500 -rotate-3" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Select a product</h3>
            <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">Choose a product from the dropdown above to view or edit its evaluations.</p>
          </div>
        </div>
      ) : selectedProduct?.metricGroups?.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Metric Groups Assigned</h3>
          <p className="text-slate-500">This product has no metric groups assigned. Please assign metric groups to the product first.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {selectedProduct?.metricGroups?.map((group: any) => (
            <div key={group.id} className="glass-card overflow-hidden">
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/60">
                <h3 className="text-lg font-bold text-slate-800">{group.name}</h3>
                {group.description && <p className="text-sm text-slate-500 mt-1">{group.description}</p>}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200/60">
                  <thead className="bg-white/40">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Metric</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/6">Score</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Comments</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 bg-white/20">
                    {group.metrics.map((metric: any) => {
                      const existingEval = productEvaluations.find(e => e.metricId === metric.id);
                      
                      return (
                        <tr key={metric.id} className="hover:bg-white/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">{metric.name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {metric.type === 'BOOLEAN' ? 'Yes/No' : metric.type === 'CUSTOM_NUMBER' ? 'Custom Number' : `${metric.minScore || 1}-${metric.maxScore || 10} Scale`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {existingEval ? (
                              <div className="flex items-center gap-1.5">
                                {metric.type === 'BOOLEAN' ? (
                                  <span className={`text-sm font-bold px-2.5 py-1 rounded-md ${existingEval.score === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {existingEval.score === 1 ? 'Yes' : 'No'}
                                  </span>
                                ) : metric.type === 'CUSTOM_NUMBER' ? (
                                  <span className="text-lg font-bold text-blue-600">
                                    {existingEval.score}
                                  </span>
                                ) : (
                                  <>
                                    <Star className={`w-4 h-4 ${existingEval.score >= ((metric.maxScore || 10) * 0.8) ? 'text-emerald-500 fill-emerald-500' : existingEval.score >= ((metric.maxScore || 10) * 0.5) ? 'text-amber-500 fill-amber-500' : 'text-rose-500 fill-rose-500'}`} />
                                    <span className={`text-lg font-bold ${existingEval.score >= ((metric.maxScore || 10) * 0.8) ? 'text-emerald-600' : existingEval.score >= ((metric.maxScore || 10) * 0.5) ? 'text-amber-600' : 'text-rose-600'}`}>
                                      {existingEval.score}
                                    </span>
                                    <span className="text-slate-400 font-medium text-sm">/{metric.maxScore || 10}</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400 italic">Not evaluated</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {existingEval?.comments ? (
                              <span className="line-clamp-2" title={existingEval.comments}>{existingEval.comments}</span>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {existingEval ? (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => openEditModal(metric, existingEval)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Evaluation"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEvaluation(existingEval.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Evaluation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => openEditModal(metric, null)}
                                className="inline-flex items-center px-3 py-1.5 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Evaluate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Evaluations;