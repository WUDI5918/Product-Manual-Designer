
import React, { useState, useMemo } from 'react';
import { Template } from '../constants';

interface TemplateLibraryModalProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onClose: () => void;
}

const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({ templates, onSelect, onDelete, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => 
            (activeFilter === 'All' || t.category === activeFilter) &&
            (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [templates, searchTerm, activeFilter]);
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-panel rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-color"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-color flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-dark-color">Add Page from Template</h2>
                         <button onClick={onClose} className="text-light-color hover:text-dark-color text-2xl">
                            <i className="fas fa-times"></i>
                        </button>
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
                            <div key={template.id} className="border border-color rounded-lg overflow-hidden group relative transition-all hover:shadow-xl hover-border-primary bg-element">
                                <div className="relative h-48 bg-contrast overflow-hidden">
                                    <img src={template.previewImage} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                </div>
                                <div className="p-3 bg-panel/50">
                                    <h3 className="font-semibold text-base-color truncate">{template.name}</h3>
                                    <p className="text-sm text-light-color">{template.category}</p>
                                </div>
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity space-y-3">
                                    <button onClick={() => onSelect(template)} className="btn btn-primary w-3/4">
                                        <i className="fas fa-plus mr-2"></i>Add Page
                                    </button>
                                </div>
                                {template.category === 'Custom' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(template.id); }} 
                                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:bg-red-600"
                                        title="Delete Template"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                     {filteredTemplates.length === 0 && <p className="text-center text-light-color mt-8">No templates found. Try adjusting your search or filters.</p>}
                </div>
            </div>
        </div>
    );
};

export default TemplateLibraryModal;
