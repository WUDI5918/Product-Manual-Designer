
import React, { useState, useMemo } from 'react';
import { Template } from '../constants';
import TemplatePreview from './TemplatePreview';

interface TemplatePropertiesModalProps {
  template: Template;
  onSave: (updates: { name: string; category: string; tags: string[] }) => void;
  onClose: () => void;
}

const TemplatePropertiesModal: React.FC<TemplatePropertiesModalProps> = ({ template, onSave, onClose }) => {
  const [name, setName] = useState(template.name);
  const [category, setCategory] = useState(template.category);
  const [tags, setTags] = useState(template.tags.join(', '));

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        category: category.trim() || 'Custom',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-panel rounded-xl shadow-2xl w-full max-w-md border border-color p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-dark-color">Edit Template Properties</h2>
        <div>
          <label className="block text-sm font-medium text-light-color mb-1">Template Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-color mb-1">Category</label>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-color mb-1">Tags (comma-separated)</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="input w-full" />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};


interface TemplateManagerScreenProps {
  templates: Template[];
  onDelete: (templateId: string) => void;
  onClose: () => void;
  onEdit: (templateId: string) => void;
  onCreate: () => void;
  onUpdateProperties: (templateId: string, updates: { name: string; category: string; tags: string[] }) => void;
}

const TemplateManagerScreen: React.FC<TemplateManagerScreenProps> = ({ templates, onDelete, onClose, onEdit, onCreate, onUpdateProperties }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [propertiesModalTemplate, setPropertiesModalTemplate] = useState<Template | null>(null);

    const categories = ['All', ...Array.from(new Set(templates.map(t=> t.category)))];

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => 
            (activeFilter === 'All' || t.category === activeFilter) &&
            (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [templates, searchTerm, activeFilter]);
    
    return (
        <div className="w-full h-screen bg-canvas flex items-center justify-center p-4">
            {propertiesModalTemplate && (
              <TemplatePropertiesModal
                  template={propertiesModalTemplate}
                  onSave={(updates) => {
                      onUpdateProperties(propertiesModalTemplate.id, updates);
                      setPropertiesModalTemplate(null);
                  }}
                  onClose={() => setPropertiesModalTemplate(null)}
              />
            )}
            <div className="bg-panel rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-color">
                <div className="p-5 border-b border-color flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-dark-color">Template Library</h2>
                        <div className="flex items-center space-x-4">
                           <button onClick={onCreate} className="btn btn-secondary">
                                <i className="fas fa-plus mr-2"></i> Create New Template
                            </button>
                           <button onClick={onClose} className="btn btn-secondary">
                                <i className="fas fa-home mr-2"></i> Back to Home
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                        <div className="relative flex-1">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-light-color"></i>
                            <input type="text" placeholder="Search templates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full pl-10" />
                        </div>
                         <div className="flex space-x-2">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeFilter === cat ? 'bg-orange-500 text-white' : 'bg-element text-base-color hover-bg-element'}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredTemplates.map(template => (
                           <div key={template.id} className="group">
                                <div className="border border-color rounded-lg overflow-hidden transition-all group-hover:shadow-xl group-hover:border-primary-color bg-element flex flex-col">
                                    <div className="relative aspect-[8.5/11] bg-contrast overflow-hidden flex items-center justify-center">
                                        {template.previewImage ? (
                                            <img src={template.previewImage} alt={template.name} className="w-full h-full object-cover"/>
                                        ) : (
                                            <TemplatePreview template={template} />
                                        )}
                                    </div>
                                    <div className="p-3 bg-panel/50 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-base-color truncate">{template.name}</h3>
                                            <p className="text-sm text-light-color">{template.category}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {template.tags.map(tag => (
                                                    <span key={tag} className="text-xs bg-contrast text-light-color px-2 py-0.5 rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center space-x-2 transition-all duration-300 max-h-0 opacity-0 invisible group-hover:visible group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-2">
                                    <button data-testid={`edit-template-${template.id}`} onClick={() => onEdit(template.id)} className="btn btn-primary flex-1 text-xs px-2 py-2" title="Edit Content">
                                        <i className="fas fa-pencil-alt mr-1"></i>Edit
                                    </button>
                                    <button data-testid={`props-template-${template.id}`} onClick={() => setPropertiesModalTemplate(template)} className="btn bg-white text-slate-800 hover:bg-slate-200 border-transparent flex-1 text-xs px-2 py-2" title="Properties">
                                        <i className="fas fa-cog mr-1"></i>Props
                                    </button>
                                    <button data-testid={`delete-template-${template.id}`} onClick={() => onDelete(template.id)} className="btn bg-red-600 hover:bg-red-700 text-white border-transparent flex-1 text-xs px-2 py-2" title="Delete">
                                        <i className="fas fa-trash mr-1"></i>Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                     {filteredTemplates.length === 0 && <p className="text-center text-light-color mt-8">No templates found. Create one to get started!</p>}
                </div>
            </div>
        </div>
    );
};

export default TemplateManagerScreen;