
import React from 'react';

type EditingTarget = { type: 'project' | 'template' | 'newTemplate' } | null;

interface HeaderProps {
    projectName: string;
    editingTarget: EditingTarget;
    onSaveAsTemplate: () => void;
    onGoHome: () => void;
    onSaveChanges: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const Header: React.FC<HeaderProps> = ({ projectName, editingTarget, onSaveAsTemplate, onGoHome, onSaveChanges, theme, onToggleTheme, onUndo, onRedo, canUndo, canRedo }) => {
  const isEditingTemplate = editingTarget?.type === 'template' || editingTarget?.type === 'newTemplate';
  
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-panel border-b border-color flex-shrink-0 z-20">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-element rounded-lg">
           <i className="fas fa-book-open text-orange-500 text-xl"></i>
        </div>
        <div>
            <h1 className="text-lg font-semibold text-dark-color">{projectName}</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
         <button onClick={onGoHome} className="btn btn-secondary w-10 h-10 p-0" title="Go to Home Screen">
            <i className="fas fa-home"></i>
        </button>
        <div className="w-px h-6 bg-border"></div>
        <button onClick={onUndo} disabled={!canUndo} className="btn btn-secondary w-10 h-10 p-0" title="Undo (Ctrl+Z)">
            <i className="fas fa-undo"></i>
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="btn btn-secondary w-10 h-10 p-0" title="Redo (Ctrl+Y)">
            <i className="fas fa-redo"></i>
        </button>
        <div className="w-px h-6 bg-border"></div>
        <button onClick={onToggleTheme} className="btn btn-secondary w-10 h-10 p-0" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
        </button>
        
        {!isEditingTemplate && (
          <button onClick={onSaveAsTemplate} className="btn btn-secondary"><i className="fas fa-bookmark mr-2"></i>Save as Template</button>
        )}

        <button onClick={onSaveChanges} className="btn btn-secondary">
          <i className="fas fa-save mr-2"></i>{isEditingTemplate ? 'Save Template' : 'Save'}
        </button>
        
        <button className="btn btn-primary"><i className="fas fa-file-export mr-2"></i>Export</button>
      </div>
    </header>
  );
};

export default Header;
