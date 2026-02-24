import { useState, useEffect, useRef } from 'react';
import { Plus, FolderKanban, Users, X, Edit2, Trash2, Settings2 } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', productIds: [] as number[] });
  const [editingProject, setEditingProject] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchProjects = () => {
    fetch('http://localhost:3001/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data));
  };

  const fetchProducts = () => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProjects();
    fetchProducts();
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

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewProject({ name: '', description: '', productIds: [] });
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to add project', error);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProject.name,
          description: editingProject.description,
          productIds: editingProject.productIds
        })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingProject(null);
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to edit project', error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const res = await fetch(`http://localhost:3001/api/projects/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchProjects();
        }
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
    setOpenMenuId(null);
  };

  const openEditModal = (project: any) => {
    setEditingProject({ 
      ...project, 
      productIds: project.products?.map((p: any) => p.id) || []
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const toggleProductSelection = (productId: number, isEditing: boolean) => {
    if (isEditing) {
      setEditingProject((prev: any) => {
        const isSelected = prev.productIds.includes(productId);
        if (isSelected) {
          return { ...prev, productIds: prev.productIds.filter((id: number) => id !== productId) };
        } else {
          return { ...prev, productIds: [...prev.productIds, productId] };
        }
      });
    } else {
      setNewProject(prev => {
        const isSelected = prev.productIds.includes(productId);
        if (isSelected) {
          return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
        } else {
          return { ...prev, productIds: [...prev.productIds, productId] };
        }
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add New Project</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Project Phoenix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="What is this project about?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Products</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {products.map(product => (
                    <label key={product.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newProject.productIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id, false)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-700">{product.name}</span>
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Edit Project</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Products</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {products.map(product => (
                    <label key={product.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingProject.productIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id, true)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-700">{product.name}</span>
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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Internal Projects</h1>
          <p className="mt-2 text-base text-slate-500 max-w-2xl">Track which internal teams and projects are using the approved software.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-lg shadow-blue-500/30 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full glass-card p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 -rotate-3">
              <FolderKanban className="h-10 w-10 text-slate-400 rotate-3" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No projects found</h3>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto">Get started by adding an internal project to track software usage.</p>
          </div>
        ) : (
          projects.map((project: any) => (
            <div key={project.id} className="glass-card flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                      <FolderKanban className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {project.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                    className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <Settings2 className="h-5 w-5" />
                  </button>
                  {openMenuId === project.id && (
                    <div ref={menuRef} className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                      <button
                        onClick={() => openEditModal(project)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                      >
                        <Edit2 className="w-4 h-4 mr-2 text-slate-400" />
                        Edit Project
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2 text-rose-500" />
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>
              <div className="px-6 py-4 border-t border-slate-100/50 bg-white/40 rounded-b-2xl flex justify-between items-center">
                <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg">
                  <Users className="h-4 w-4 mr-1.5 text-slate-400" />
                  {project.products?.length || 0} Products
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;