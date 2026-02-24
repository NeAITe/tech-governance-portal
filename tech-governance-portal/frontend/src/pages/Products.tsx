import { useState, useEffect, useRef } from 'react';
import { Plus, Search, MoreVertical, Filter, Package, X, Edit2, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [metricGroups, setMetricGroups] = useState<any[]>([]);
  const [internalProjects, setInternalProjects] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', links: [''], status: 'UNDER_EVALUATION', metricGroupIds: [] as number[], internalProjectIds: [] as number[] });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  const fetchMetricGroups = () => {
    fetch('/api/metric-groups')
      .then(res => res.json())
      .then(data => setMetricGroups(data));
  };

  const fetchInternalProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setInternalProjects(data));
  };

  useEffect(() => {
    fetchProducts();
    fetchMetricGroups();
    fetchInternalProjects();
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewProduct({ name: '', description: '', links: [''], status: 'UNDER_EVALUATION', metricGroupIds: [], internalProjectIds: [] });
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to add product', error);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          links: editingProduct.links,
          status: editingProduct.status,
          metricGroupIds: editingProduct.metricGroupIds,
          internalProjectIds: editingProduct.internalProjectIds
        })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to edit product', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
    setOpenMenuId(null);
  };

  const openEditModal = (product: any) => {
    setEditingProduct({ 
      ...product, 
      links: product.links?.length ? product.links : [''],
      metricGroupIds: product.metricGroups?.map((g: any) => g.id) || [],
      internalProjectIds: product.internalProjects?.map((p: any) => p.id) || []
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const toggleMetricGroupSelection = (groupId: number, isEditing: boolean) => {
    if (isEditing) {
      setEditingProduct((prev: any) => {
        const isSelected = prev.metricGroupIds.includes(groupId);
        if (isSelected) {
          return { ...prev, metricGroupIds: prev.metricGroupIds.filter((id: number) => id !== groupId) };
        } else {
          return { ...prev, metricGroupIds: [...prev.metricGroupIds, groupId] };
        }
      });
    } else {
      setNewProduct(prev => {
        const isSelected = prev.metricGroupIds.includes(groupId);
        if (isSelected) {
          return { ...prev, metricGroupIds: prev.metricGroupIds.filter(id => id !== groupId) };
        } else {
          return { ...prev, metricGroupIds: [...prev.metricGroupIds, groupId] };
        }
      });
    }
  };

  const toggleInternalProjectSelection = (projectId: number, isEditing: boolean) => {
    if (isEditing) {
      setEditingProduct((prev: any) => {
        const isSelected = prev.internalProjectIds.includes(projectId);
        if (isSelected) {
          return { ...prev, internalProjectIds: prev.internalProjectIds.filter((id: number) => id !== projectId) };
        } else {
          return { ...prev, internalProjectIds: [...prev.internalProjectIds, projectId] };
        }
      });
    } else {
      setNewProduct(prev => {
        const isSelected = prev.internalProjectIds.includes(projectId);
        if (isSelected) {
          return { ...prev, internalProjectIds: prev.internalProjectIds.filter(id => id !== projectId) };
        } else {
          return { ...prev, internalProjectIds: [...prev.internalProjectIds, projectId] };
        }
      });
    }
  };

const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All Statuses' || 
                          (statusFilter === 'Approved' && product.status === 'APPROVED') ||
                          (statusFilter === 'Under Evaluation' && product.status === 'UNDER_EVALUATION') ||
                          (statusFilter === 'Standard' && product.status === 'STANDARD') ||
                          (statusFilter === 'Sunset' && product.status === 'SUNSET');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            className="block w-full pl-11 pr-4 py-3 bg-white/50 border-0 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all placeholder:text-slate-400"
            placeholder="Search products by name, description..."
          />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Brief description of the product..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
                <input 
                  type="url" 
                  value={newProduct.links[0]}
                  onChange={(e) => setNewProduct({...newProduct, links: [e.target.value]})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="UNDER_EVALUATION">Under Evaluation</option>
                  <option value="APPROVED">Approved</option>
                  <option value="STANDARD">Standard</option>
                  <option value="SUNSET">Sunset</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Metric Groups</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {metricGroups.map(group => (
                    <label key={group.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newProduct.metricGroupIds.includes(group.id)}
                        onChange={() => toggleMetricGroupSelection(group.id, false)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-700">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Internal Projects</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {internalProjects.map(project => (
                    <label key={project.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newProduct.internalProjectIds.includes(project.id)}
                        onChange={() => toggleInternalProjectSelection(project.id, false)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-700">{project.name}</span>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Edit Product</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
                <input 
                  type="url" 
                  value={editingProduct.links[0]}
                  onChange={(e) => setEditingProduct({...editingProduct, links: [e.target.value]})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={editingProduct.status}
                  onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="UNDER_EVALUATION">Under Evaluation</option>
                  <option value="APPROVED">Approved</option>
                  <option value="STANDARD">Standard</option>
                  <option value="SUNSET">Sunset</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Metric Groups</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {metricGroups.map(group => (
                    <label key={group.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingProduct.metricGroupIds.includes(group.id)}
                        onChange={() => toggleMetricGroupSelection(group.id, true)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-700">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Internal Projects</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {internalProjects.map(project => (
                    <label key={project.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingProduct.internalProjectIds.includes(project.id)}
                        onChange={() => toggleInternalProjectSelection(project.id, true)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-700">{project.name}</span>
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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Products Portfolio</h1>
          <p className="mt-2 text-base text-slate-500 max-w-2xl">Manage and track all software products currently in the organization's portfolio.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-lg shadow-blue-500/30 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Product
          </button>
        </div>
      </div>

      <div className="glass-card p-2 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            className="block w-full pl-11 pr-4 py-3 bg-white/50 border-0 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all placeholder:text-slate-400"
            placeholder="Search products by name, description..."
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Filter className="h-4 w-4 text-slate-400" />
             </div>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="block w-full pl-9 pr-10 py-2.5 text-sm font-medium text-slate-700 bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
             >
               <option>All Statuses</option>
               <option>Approved</option>
               <option>Under Evaluation</option>
               <option>Standard</option>
               <option>Sunset</option>
             </select>
           </div>
        </div>
      </div>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            className="block w-full pl-11 pr-4 py-3 bg-white/50 border-0 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all placeholder:text-slate-400"
            placeholder="Search products by name, description..."
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Filter className="h-4 w-4 text-slate-400" />
             </div>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="block w-full pl-9 pr-10 py-2.5 text-sm font-medium text-slate-700 bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
             >
               <option>All Statuses</option>
               <option>Approved</option>
               <option>Under Evaluation</option>
               <option>Standard</option>
               <option>Sunset</option>
             </select>
           </div>
        </div>
      </div>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            className="block w-full pl-11 pr-4 py-3 bg-white/50 border-0 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all placeholder:text-slate-400"
            placeholder="Search products by name, description..."
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Filter className="h-4 w-4 text-slate-400" />
             </div>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="block w-full pl-9 pr-10 py-2.5 text-sm font-medium text-slate-700 bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
             >
               <option>All Statuses</option>
               <option>Approved</option>
               <option>Under Evaluation</option>
               <option>Standard</option>
               <option>Sunset</option>
             </select>
           </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 bg-white/40">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">No products found.</p>
                    <p className="text-sm text-slate-400 mt-1">Click "Add Product" to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-white/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/50 flex items-center justify-center text-blue-600 font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
                          {product.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{product.name}</div>
                          <div className="text-sm text-slate-500 mt-0.5">
                            {product.links?.[0] ? (
                              <a href={product.links[0]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {product.links[0]}
                              </a>
                            ) : 'No link provided'}
                          </div>
                        </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg border ${
                        product.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        product.status === 'UNDER_EVALUATION' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        product.status === 'SUNSET' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">{product.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {openMenuId === product.id && (
                        <div ref={menuRef} className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                          <button
                            onClick={() => openEditModal(product)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                          >
                            <Edit2 className="w-4 h-4 mr-2 text-slate-400" />
                            Edit Product
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2 text-rose-500" />
                            Delete Product
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;