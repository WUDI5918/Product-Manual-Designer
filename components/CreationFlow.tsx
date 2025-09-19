
import React, { useState, useMemo } from 'react';
import { Page, Template, ComponentType, COMPONENT_LIBRARY } from '../constants';
import TemplatePreview from './TemplatePreview';

type Stage = 'choice' | 'templateLibrary' | 'blankSetup' | 'naming';

interface CreationFlowProps {
  onProjectCreate: (projectName: string, pages: Page[], template: Template) => void;
  onCancel: () => void;
  templates: Template[];
  onDeleteTemplate: (templateId: string) => void;
}

const CreationFlow: React.FC<CreationFlowProps> = ({ onProjectCreate, onCancel, templates, onDeleteTemplate }) => {
  const [stage, setStage] = useState<Stage>('choice');
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [pageSetup, setPageSetup] = useState({ width: 8.5, height: 11, unit: 'in'});

  const handleCreateFromTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setStage('naming');
  };

  const handleCreateBlank = () => {
    // This function creates the blank page content, which is then named
    const blankPage: Page = {
      id: `page-${Date.now()}`,
      name: 'Page 1',
      header: [],
      body: [
        {
          id: 'title-1', type: ComponentType.Text, x: 40, y: 40, width: 736, height: 60,
          props: { 
            ...COMPONENT_LIBRARY.find(c => c.type === ComponentType.Text)?.defaultProps,
            text: 'New Manual Title', textType: 'h1', fontSize: 32, color: '#111827', fontWeight: 'bold' 
          }
        }
      ],
      footer: [],
    };
    const blankTemplate: Template = {
        id: 'blank', name: 'Blank Document', category: '', tags: [],
        page: { header: blankPage.header, body: blankPage.body, footer: blankPage.footer }
    };
    setSelectedTemplate(blankTemplate);
    setStage('naming');
  };

  const handleFinalCreate = () => {
    if (projectName.trim() && selectedTemplate) {
      const pageData = JSON.parse(JSON.stringify(selectedTemplate.page));
      const initialPage: Page = {
          id: `page-${Date.now()}`,
          name: 'Page 1',
          ...pageData
      };
      onProjectCreate(projectName.trim(), [initialPage], selectedTemplate);
    }
  };
  
  const handleBack = () => {
      if (stage === 'choice') onCancel();
      else if (stage === 'templateLibrary' || stage === 'blankSetup') setStage('choice');
      else if (stage === 'naming') {
          setStage(selectedTemplate?.id === 'blank' ? 'blankSetup' : 'templateLibrary')
      } else {
          setStage('choice');
      }
  }

  const renderStage = () => {
    switch (stage) {
      case 'choice':
        return <ChoiceStage onSelectTemplate={() => setStage('templateLibrary')} onSelectBlank={() => setStage('blankSetup')} onBack={handleBack} />;
      case 'templateLibrary':
        return <TemplateLibraryStage templates={templates} onSelect={handleCreateFromTemplate} onDelete={onDeleteTemplate} onBack={handleBack} />;
      case 'blankSetup':
        return <BlankSetupStage onSetupComplete={handleCreateBlank} onBack={handleBack} />
      case 'naming':
        return <NamingStage projectName={projectName} setProjectName={setProjectName} onCreate={handleFinalCreate} onBack={handleBack} />;
      default:
        return <ChoiceStage onSelectTemplate={() => setStage('templateLibrary')} onSelectBlank={() => setStage('blankSetup')} onBack={handleBack} />;
    }
  };

  return (
    <div className="w-full h-screen bg-canvas flex items-center justify-center p-4">
      {renderStage()}
    </div>
  );
};

const ChoiceStage: React.FC<{ onSelectTemplate: () => void; onSelectBlank: () => void, onBack: () => void }> = ({ onSelectTemplate, onSelectBlank, onBack }) => (
  <div className="max-w-3xl w-full">
     <button onClick={onBack} className="flex items-center text-base-color hover:text-dark-color font-semibold mb-6 text-sm">
        <i className="fas fa-arrow-left mr-2"></i> Back to Home
    </button>
    <h2 className="text-3xl font-bold text-dark-color mb-8 text-center">How would you like to start?</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
            onClick={onSelectTemplate} 
            className="text-left p-6 border-2 border-primary-color bg-contrast rounded-lg cursor-pointer transition-all"
        >
            <i className="fas fa-file-invoice text-4xl text-orange-500 mb-4"></i>
            <h3 className="font-bold text-lg text-dark-color">Start from a Template</h3>
            <p className="text-light-color mt-1">Get a head start with a professionally designed layout. <span className="font-semibold text-orange-400">(Recommended)</span></p>
        </div>
        <div 
            onClick={onSelectBlank} 
            className="text-left p-6 border-2 border-color bg-panel rounded-lg cursor-pointer transition-all hover:border-slate-400 dark:hover:border-slate-500"
        >
            <i className="fas fa-file text-4xl text-slate-500 mb-4"></i>
            <h3 className="font-bold text-lg text-dark-color">Start with a Blank Document</h3>
            <p className="text-light-color mt-1">Choose a page size and begin your design from scratch.</p>
        </div>
    </div>
  </div>
);

const BlankSetupStage: React.FC<{onSetupComplete: () => void, onBack: () => void}> = ({onSetupComplete, onBack}) => {
    const [preset, setPreset] = useState('letter');

    const presets = {
        'letter': { name: 'US Letter', size: '8.5 x 11 in' },
        'a4': { name: 'A4', size: '210 x 297 mm' },
        'custom': { name: 'Custom', size: 'User-defined' },
    }

    return (
        <div className="bg-panel p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-color">
            <button onClick={onBack} className="flex items-center text-base-color hover:text-dark-color font-semibold mb-4 text-sm">
                <i className="fas fa-arrow-left mr-2"></i> Back
            </button>
            <h2 className="text-2xl font-bold text-dark-color mb-2">Setup Your Blank Document</h2>
            <p className="text-light-color mb-6">Choose a standard page size to start. Custom sizes can be configured later.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {Object.entries(presets).map(([key, {name, size}]) => (
                    <div key={key} onClick={() => setPreset(key)} className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${preset === key ? 'border-primary-color bg-element' : 'border-color hover-border-color'}`}>
                        <p className="font-semibold text-base-color">{name}</p>
                        <p className="text-sm text-light-color">{size}</p>
                    </div>
                ))}
            </div>
             <button onClick={onSetupComplete} className="w-full btn btn-primary py-3">
                Continue <i className="fas fa-arrow-right ml-2"></i>
            </button>
        </div>
    );
};


const TemplateLibraryStage: React.FC<{ templates: Template[]; onSelect: (template: Template) => void; onDelete: (templateId: string) => void; onBack: () => void }> = ({ templates, onSelect, onDelete, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => 
            (activeFilter === 'All' || t.category === activeFilter) &&
            (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [templates, searchTerm, activeFilter]);
    
    if (previewTemplate) {
        return (
            <div className="bg-panel rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col p-6 border border-color">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <button onClick={() => setPreviewTemplate(null)} className="btn btn-secondary">
                        <i className="fas fa-arrow-left mr-2"></i> Back to Templates
                    </button>
                    <h2 className="text-2xl font-bold text-dark-color">{previewTemplate.name}</h2>
                    <button onClick={() => onSelect(previewTemplate)} className="btn btn-primary px-6 py-2">
                        Use This Template
                    </button>
                </div>
                 <div className="flex-1 bg-canvas rounded-lg overflow-y-auto p-4 border border-color flex justify-center items-start">
                    {previewTemplate.category === 'Custom' || !previewTemplate.previewImage ? (
                        <div className="w-[816px] h-[1056px] shadow-lg flex-shrink-0">
                            <TemplatePreview template={previewTemplate} />
                        </div>
                    ) : (
                        <img src={previewTemplate.previewImage} alt={previewTemplate.name} className="max-w-full h-auto object-contain rounded shadow-lg" />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-panel rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-color">
            <div className="p-6 border-b border-color flex-shrink-0">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center text-base-color hover:text-dark-color font-semibold text-sm">
                        <i className="fas fa-arrow-left mr-2"></i> Back
                    </button>
                    <h2 className="text-2xl font-bold text-dark-color">Select a Template</h2>
                    <div className="w-24"></div>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-light-color"></i>
                        <input type="text" placeholder="Search templates by name or tag..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full pl-10" />
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
                            <div onClick={() => setPreviewTemplate(template)} className="cursor-pointer">
                                <div className="relative aspect-[8.5/11] bg-contrast overflow-hidden flex items-center justify-center">
                                    {template.category === 'Custom' || !template.previewImage ? (
                                        <TemplatePreview template={template} />
                                    ) : (
                                      <img src={template.previewImage} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity">
                                        <span className="text-white font-bold opacity-0 group-hover:opacity-100"><i className="fas fa-eye mr-2"></i>Preview</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-panel/50">
                                    <h3 className="font-semibold text-base-color truncate">{template.name}</h3>
                                    <p className="text-sm text-light-color">{template.category}</p>
                                </div>
                            </div>
                            {template.category === 'Custom' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(template.id); }} 
                                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
    )
};

const NamingStage: React.FC<{ projectName: string; setProjectName: (name: string) => void; onCreate: () => void; onBack: () => void }> = ({ projectName, setProjectName, onCreate, onBack }) => (
    <div className="bg-panel p-8 rounded-xl shadow-2xl w-full max-w-md border border-color">
        <button onClick={onBack} className="flex items-center text-base-color hover:text-dark-color font-semibold mb-4 text-sm">
            <i className="fas fa-arrow-left mr-2"></i> Back
        </button>
        <h2 className="text-2xl font-bold text-dark-color mb-2">Name Your Manual</h2>
        <p className="text-light-color mb-6">Give your new project a descriptive name. You can change this later.</p>
        <input 
            type="text" 
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="e.g., Model-X Smart Speaker Guide"
            className="input w-full p-3 text-lg"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && projectName.trim() && onCreate()}
        />
        <button 
            onClick={onCreate} 
            disabled={!projectName.trim()}
            className="w-full btn btn-primary py-3 mt-6"
        >
            Create Manual
        </button>
    </div>
);


export default CreationFlow;
