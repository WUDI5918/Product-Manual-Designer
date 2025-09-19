
import React, { useState } from 'react';
import { Project } from '../constants';

interface HomeScreenProps {
  projects: Project[];
  onNewManual: () => void;
  onOpenTemplateManager: () => void;
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ projects, onNewManual, onOpenTemplateManager, onLoadProject, onDeleteProject, onRenameProject }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftName, setDraftName] = useState('');

    const handleRename = (project: Project) => {
        setEditingId(project.id);
        setDraftName(project.name);
    }
    
    const handleRenameSubmit = (projectId: string) => {
        if (draftName.trim()) {
            onRenameProject(projectId, draftName.trim());
        }
        setEditingId(null);
        setDraftName('');
    }

    return (
        <div className="w-full h-screen bg-canvas text-base-color flex flex-col items-center p-8 overflow-y-auto">
            <header className="text-center mb-12">
                <div className="p-6 bg-panel rounded-full shadow-lg mb-6 inline-block border-2 border-color">
                    <i className="fas fa-book-open text-orange-500 text-5xl"></i>
                </div>
                <h1 className="text-4xl font-bold text-dark-color">Product Manual Designer</h1>
                <p className="text-lg text-light-color mt-2">Welcome! Create a new manual or manage your existing projects.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
                <div onClick={onNewManual} className="bg-panel p-8 rounded-xl shadow-lg border border-color hover:border-primary-color transition-all cursor-pointer flex flex-col items-center text-center">
                    <i className="fas fa-plus-circle text-5xl text-orange-500 mb-4"></i>
                    <h2 className="text-2xl font-bold text-dark-color">Create New Manual</h2>
                    <p className="text-light-color mt-2">Start from a blank page or a professional template.</p>
                </div>
                <div onClick={onOpenTemplateManager} className="bg-panel p-8 rounded-xl shadow-lg border border-color hover:border-primary-color transition-all cursor-pointer flex flex-col items-center text-center">
                    <i className="fas fa-swatchbook text-5xl text-light-color mb-4"></i>
                    <h2 className="text-2xl font-bold text-dark-color">Template Library</h2>
                    <p className="text-light-color mt-2">Manage your saved custom page templates.</p>
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-dark-color mb-6 text-center">Product Manual Library</h2>
                <div className="bg-panel rounded-xl shadow-lg border border-color p-4 space-y-3">
                    {projects.length > 0 ? (
                        [...projects].sort((a, b) => b.lastModified - a.lastModified).map(project => (
                            <div key={project.id} className="flex items-center justify-between p-4 bg-element rounded-lg hover-bg-element transition-colors">
                                <div className="flex-1">
                                    {editingId === project.id ? (
                                        <input 
                                            type="text"
                                            value={draftName}
                                            onChange={(e) => setDraftName(e.target.value)}
                                            onBlur={() => handleRenameSubmit(project.id)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(project.id)}
                                            className="input text-lg font-semibold"
                                            autoFocus
                                        />
                                    ) : (
                                        <h3 className="text-lg font-semibold text-dark-color">{project.name}</h3>
                                    )}
                                    <p className="text-sm text-light-color">Last modified: {new Date(project.lastModified).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleRename(project)} className="btn btn-secondary w-10 h-10 p-0" title="Rename"><i className="fas fa-pencil-alt"></i></button>
                                    <button onClick={() => onDeleteProject(project.id)} className="btn btn-secondary w-10 h-10 p-0 hover:bg-red-500 hover:text-white" title="Delete"><i className="fas fa-trash"></i></button>
                                    <button onClick={() => onLoadProject(project.id)} className="btn btn-primary px-6">Open</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <i className="fas fa-folder-open text-5xl text-light-color mb-4"></i>
                            <p className="text-light-color">You haven't created any manuals yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
