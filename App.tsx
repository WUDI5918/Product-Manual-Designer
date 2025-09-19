

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { produce } from 'immer';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from './components/Header';
import LeftPanel from './components/TemplateManager';
import CenterPanel from './components/ManualViewer';
import RightPanel from './components/ui/Editable';
import CreationFlow from './components/CreationFlow';
import HomeScreen from './components/HomeScreen';
import TemplateLibraryModal from './components/TemplateLibraryModal';
import TemplateManagerScreen from './components/TemplateManagerScreen';
import SaveTemplateModal from './components/SaveTemplateModal';
import { EditorState, Page, Component, ComponentType, Template, Project } from './constants';
import { INITIAL_STATE, COMPONENT_LIBRARY } from './constants';

const Resizer = ({ onMouseDown }: { onMouseDown: React.MouseEventHandler<HTMLDivElement> }) => (
    <div
      onMouseDown={onMouseDown}
      className="resizer w-1.5 cursor-col-resize transition-colors duration-200 flex-shrink-0 z-10"
    />
);

type View = 'home' | 'creation' | 'editor' | 'templateManager';
type EditingTarget = 
  | { type: 'project'; id: string } 
  | { type: 'template'; id: string } 
  | { type: 'newTemplate' };

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_STATE.templates);
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);
  
  // This is the active editor state, derived from the active project or template
  const [activeState, setActiveState] = useState<EditorState | null>(null);

  const [panelWidths, setPanelWidths] = useState({ left: 288, right: 320 });
  const [zoom, setZoom] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const [history, setHistory] = useState<EditorState[]>([]);
  const [future, setFuture] = useState<EditorState[]>([]);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);


  // Load projects and templates from storage on initial mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('manualProjects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
      const savedTemplates = localStorage.getItem('customTemplates');
      if(savedTemplates) {
          const customTemplates = JSON.parse(savedTemplates);
          const baseTemplates = INITIAL_STATE.templates.filter(t => t.category !== "Custom");
          const mergedTemplates = [...baseTemplates, ...customTemplates];
          setTemplates(mergedTemplates);
      } else {
        setTemplates(INITIAL_STATE.templates);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const saveProjectsToStorage = (updatedProjects: Project[]) => {
    localStorage.setItem('manualProjects', JSON.stringify(updatedProjects));
  };
  
  const saveCustomTemplatesToStorage = (updatedTemplates: Template[]) => {
      const customTemplates = updatedTemplates.filter(t => t.category === "Custom");
      localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleStateChange = (updater: (draft: EditorState) => void, recordHistory = true) => {
    if (!activeState) return;
    if (recordHistory) {
      setHistory(prev => [...prev, activeState].slice(-50));
      setFuture([]);
    }
    setActiveState(produce(activeState, updater));
  };
  
  const handleCreateProject = (projectName: string, pages: Page[], template?: Template) => {
    const newProjectId = `proj-${Date.now()}`;
    const templatesForNewProject = template ? [template, ...templates.filter(t => t.id !== template.id)] : templates;
    
    const newProjectState: EditorState = {
        ...INITIAL_STATE,
        projectName,
        pages,
        currentPageIndex: 0,
        selectedComponentId: null,
        templates: templatesForNewProject
    };

    const newProject: Project = {
        id: newProjectId,
        name: projectName,
        lastModified: Date.now(),
        state: newProjectState
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    
    setEditingTarget({ type: 'project', id: newProjectId });
    setActiveState(newProjectState);
    setHistory([]);
    setFuture([]);
    setView('editor');
  };

  const handleLoadProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        setEditingTarget({ type: 'project', id: projectId });
        setActiveState(project.state);
        setHistory([]);
        setFuture([]);
        setView('editor');
    }
  };

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const pageData = JSON.parse(JSON.stringify(template.page));
    const templatePage: Page = { id: `page-tpl-${Date.now()}`, name: 'Template Page', ...pageData };

    const templateEditorState: EditorState = {
      ...INITIAL_STATE,
      projectName: `Editing: ${template.name}`,
      pages: [templatePage],
      currentPageIndex: 0,
      selectedComponentId: null,
      templates: templates,
    };
    
    setEditingTarget({ type: 'template', id: templateId });
    setActiveState(templateEditorState);
    setHistory([]);
    setFuture([]);
    setView('editor');
  };

  const handleCreateNewTemplate = () => {
      const blankPage: Page = { id: `page-new-tpl-${Date.now()}`, name: `Page 1`, header: [], body: [], footer: [] };
      const newTemplateState: EditorState = {
        ...INITIAL_STATE,
        projectName: 'New Template',
        pages: [blankPage],
        currentPageIndex: 0,
        selectedComponentId: null,
        templates: templates
      };
      
      setEditingTarget({ type: 'newTemplate' });
      setActiveState(newTemplateState);
      setHistory([]);
      setFuture([]);
      setView('editor');
  };

  const handleSaveChanges = () => {
    if (!editingTarget || !activeState) return;

    if (editingTarget.type === 'project') {
      const updatedProjects = produce(projects, draft => {
          const project = draft.find(p => p.id === editingTarget.id);
          if (project) {
              project.state = activeState;
              project.lastModified = Date.now();
          }
      });
      setProjects(updatedProjects);
      saveProjectsToStorage(updatedProjects);
      alert('Project Saved!');
    } else if (editingTarget.type === 'template') {
        const updatedTemplates = produce(templates, draft => {
          const template = draft.find(t => t.id === editingTarget.id);
          if (template) {
            const currentPage = activeState.pages[activeState.currentPageIndex];
            template.page = {
              header: JSON.parse(JSON.stringify(currentPage.header)),
              body: JSON.parse(JSON.stringify(currentPage.body)),
              footer: JSON.parse(JSON.stringify(currentPage.footer)),
            };
          }
        });
        setTemplates(updatedTemplates);
        saveCustomTemplatesToStorage(updatedTemplates);
        alert('Template Saved!');
    } else if (editingTarget.type === 'newTemplate') {
        setSaveTemplateModalOpen(true);
    }
  };

  const handleDeleteProject = (projectId: string) => {
      if (window.confirm("Are you sure you want to delete this manual? This cannot be undone.")) {
          const updatedProjects = projects.filter(p => p.id !== projectId);
          setProjects(updatedProjects);
          saveProjectsToStorage(updatedProjects);
      }
  };

  const handleRenameProject = (projectId: string, newName: string) => {
      const updatedProjects = produce(projects, draft => {
          const project = draft.find(p => p.id === projectId);
          if (project) {
              project.name = newName;
              project.state.projectName = newName;
              project.lastModified = Date.now();
          }
      });
      setProjects(updatedProjects);
      saveProjectsToStorage(updatedProjects);
  };
  
    const handleUpdateTemplateProperties = (templateId: string, updates: { name: string, category: string, tags: string[] }) => {
        const updatedTemplates = produce(templates, draft => {
            const template = draft.find(t => t.id === templateId);
            if (template) {
                template.name = updates.name;
                template.category = updates.category;
                template.tags = updates.tags;
            }
        });
        setTemplates(updatedTemplates);
        saveCustomTemplatesToStorage(updatedTemplates);

        if (activeState) {
            handleStateChange(draft => {
                const templateInState = draft.templates.find(t => t.id === templateId);
                if (templateInState) {
                    templateInState.name = updates.name;
                    templateInState.category = updates.category;
                    templateInState.tags = updates.tags;
                }
            }, false);
        }
    };

  const handleGoHome = () => {
      setEditingTarget(null);
      setActiveState(null);
      setView('home');
  };

  const undo = useCallback(() => {
    if (history.length === 0 || !activeState) return;
    const previousState = history[history.length - 1];
    setHistory(history.slice(0, history.length - 1));
    setFuture([activeState, ...future]);
    setActiveState(previousState);
  }, [history, activeState, future]);

  const redo = useCallback(() => {
    if (future.length === 0 || !activeState) return;
    const nextState = future[0];
    setFuture(future.slice(1));
    setHistory([...history, activeState]);
    setActiveState(nextState);
  }, [future, activeState, history]);

  const handleResize = useCallback((panel: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidths[panel];
    const minWidth = 240;
    const mainContainer = e.currentTarget.parentElement as HTMLElement;
    const centerPanelMinWidth = 400;

    const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        let newWidth = panel === 'left' ? startWidth + dx : startWidth - dx;
        newWidth = Math.max(minWidth, newWidth);
        if (mainContainer) {
            const otherPanelWidth = panelWidths[panel === 'left' ? 'right' : 'left'];
            const maxPanelWidth = mainContainer.offsetWidth - otherPanelWidth - centerPanelMinWidth;
            newWidth = Math.min(newWidth, maxPanelWidth);
        }
        setPanelWidths(prev => ({ ...prev, [panel]: newWidth }));
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelWidths]);

  const addComponent = useCallback((type: ComponentType, position: { x: number; y: number }, section: 'header' | 'body' | 'footer', initialProps?: any) => {
    const componentDef = COMPONENT_LIBRARY.find(c => c.type === type);
    if (!componentDef) return;

    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type,
      x: position.x,
      y: position.y,
      width: componentDef.defaultSize.width,
      height: componentDef.defaultSize.height,
      props: { ...componentDef.defaultProps, ...initialProps },
    };

    handleStateChange(draft => {
      const snappedX = draft.isSnapToGridEnabled ? Math.round(position.x / draft.gridSize) * draft.gridSize : position.x;
      const snappedY = draft.isSnapToGridEnabled ? Math.round(position.y / draft.gridSize) * draft.gridSize : position.y;
      
      if (initialProps) {
        newComponent.x = snappedX - (newComponent.width / 2);
        newComponent.y = snappedY - (newComponent.height / 2);
      } else {
        newComponent.x = snappedX;
        newComponent.y = snappedY;
      }

      draft.pages[draft.currentPageIndex][section].push(newComponent);
      draft.selectedComponentId = newComponent.id;
    });
  }, [activeState]);
  
  const updateComponent = useCallback((id: string, updates: Partial<Component> | { props: any }) => {
    handleStateChange(draft => {
      const page = draft.pages[draft.currentPageIndex];
      const component = 
        page.header.find(c => c.id === id) ||
        page.body.find(c => c.id === id) ||
        page.footer.find(c => c.id === id);

      if (component) {
        if ('props' in updates) {
            component.props = { ...component.props, ...updates.props };
        } else {
            Object.assign(component, updates);
        }
      }
    }, false);
  }, [activeState]);

  const selectComponent = useCallback((id: string | null) => {
    handleStateChange(draft => {
      draft.selectedComponentId = id;
    }, false);
  }, [activeState]);
  
  const deleteComponent = useCallback((id: string) => {
    handleStateChange(draft => {
        const page = draft.pages[draft.currentPageIndex];
        const component = [...page.header, ...page.body, ...page.footer].find(c => c.id === id);
        if (component?.isGenerated) return; 

        page.header = page.header.filter(c => c.id !== id);
        page.body = page.body.filter(c => c.id !== id);
        page.footer = page.footer.filter(c => c.id !== id);

        if (draft.selectedComponentId === id) {
            draft.selectedComponentId = null;
        }
    });
  }, [activeState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); return; }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeState?.selectedComponentId) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
           e.preventDefault();
           deleteComponent(activeState.selectedComponentId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeState?.selectedComponentId, deleteComponent, undo, redo]);
  
  const addPage = () => {
      handleStateChange(draft => {
          const newPage: Page = { id: `page-${Date.now()}`, name: `Page ${draft.pages.length + 1}`, header: [], body: [], footer: [] };
          draft.pages.push(newPage);
          draft.currentPageIndex = draft.pages.length - 1;
          draft.selectedComponentId = null;
      });
  };
  
  const renamePage = (index: number, newName: string) => {
    handleStateChange(draft => {
      if(draft.pages[index]) draft.pages[index].name = newName;
    });
  };

  const deletePage = (index: number) => {
    handleStateChange(draft => {
        if (draft.pages.length <= 1) return; 
        draft.pages.splice(index, 1);
        draft.currentPageIndex = Math.max(0, draft.currentPageIndex - 1);
        draft.selectedComponentId = null;
    });
  };
  
  const switchPage = (index: number) => {
      handleStateChange(draft => {
          draft.currentPageIndex = index;
          draft.selectedComponentId = null;
      }, false);
  };

  const handleSaveTemplate = (details: { name: string; category: string; tags: string[] }) => {
    if (!activeState) return;

    const { name, category, tags } = details;
    
    const currentPage = activeState.pages[activeState.currentPageIndex];
    const newTemplate: Template = {
        id: `template-${Date.now()}`,
        name,
        category,
        tags,
        page: {
            header: JSON.parse(JSON.stringify(currentPage.header)),
            body: JSON.parse(JSON.stringify(currentPage.body)),
            footer: JSON.parse(JSON.stringify(currentPage.footer)),
        }
    };
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveCustomTemplatesToStorage(updatedTemplates);
    
    if (editingTarget?.type === 'project') {
      handleStateChange(draft => { draft.templates.push(newTemplate); });
    } else if (editingTarget?.type === 'newTemplate') {
      setEditingTarget({ type: 'template', id: newTemplate.id });
      handleStateChange(draft => {
        draft.projectName = `Editing: ${name}`;
        // Add to its own list of available templates
        draft.templates.push(newTemplate);
      }, false);
    }
    
    setSaveTemplateModalOpen(false);
    alert(`Template "${name}" saved!`);
  };

  const saveCurrentPageAsTemplate = () => {
    if (!activeState) return;
    setSaveTemplateModalOpen(true);
  };
  
  const deleteTemplate = (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this template? This cannot be undone.")) {
      // Update main templates list and save to storage
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      setTemplates(updatedTemplates);
      saveCustomTemplatesToStorage(updatedTemplates);

      // Update the template list in the currently active project state, if any
      if (activeState) {
        handleStateChange(draft => {
          draft.templates = draft.templates.filter(t => t.id !== templateId);
        }, false);
      }

      // Also remove the template from all saved projects to prevent it from reappearing
      const updatedProjects = produce(projects, draft => {
        draft.forEach(project => {
          project.state.templates = project.state.templates.filter(t => t.id !== templateId);
        });
      });
      setProjects(updatedProjects);
      saveProjectsToStorage(updatedProjects);
    }
  };

  const addPageFromTemplate = (template: Template) => {
    handleStateChange(draft => {
        const pageData = JSON.parse(JSON.stringify(template.page));
        const newPage: Page = { id: `page-${Date.now()}`, name: `${template.name} Copy`, ...pageData };
        draft.pages.push(newPage);
        draft.currentPageIndex = draft.pages.length - 1;
        draft.selectedComponentId = null;
    });
    setTemplateModalOpen(false);
  };

  const addUserImage = (src: string) => {
      handleStateChange(draft => { draft.assets.images.push({ id: `image-asset-${Date.now()}`, src }); });
  };

  const setDocumentSettings = <K extends keyof EditorState['documentSettings']>(key: K, value: EditorState['documentSettings'][K]) => {
    handleStateChange(draft => { draft.documentSettings[key] = value; });
  };
  
  const setGridVisible = (isVisible: boolean) => handleStateChange(draft => { draft.isGridVisible = isVisible; }, false);
  const setSnapToGrid = (isEnabled: boolean) => handleStateChange(draft => { draft.isSnapToGridEnabled = isEnabled; }, false);
  const setGridSize = (size: number) => handleStateChange(draft => { draft.gridSize = size; }, false);

  useEffect(() => {
    if (!activeState) return;
    const PAGE_NUMBER_ID_PREFIX = 'auto-pagenumber-';
    handleStateChange(draft => {
        draft.pages.forEach(page => {
            page.footer = page.footer.filter(c => !c.isGenerated || !c.id.startsWith(PAGE_NUMBER_ID_PREFIX));
        });
        if (draft.documentSettings.showPageNumbers) {
            const { pageNumberAlign, pageNumberFormat, pageNumberFontSize, pageNumberColor, footerHeight } = draft.documentSettings;
            const PAGE_WIDTH = 816; const COMP_HEIGHT = 20; const MARGIN = 40;
            draft.pages.forEach((page, index) => {
                const text = pageNumberFormat.replace('{currentPage}', String(index + 1)).replace('{totalPages}', String(draft.pages.length));
                let x = MARGIN, width = 150;
                if (pageNumberAlign === 'center') { x = 0; width = PAGE_WIDTH; } 
                else if (pageNumberAlign === 'right') { x = PAGE_WIDTH - width - MARGIN; }
                const pageNumberComponent: Component = {
                    id: `${PAGE_NUMBER_ID_PREFIX}${page.id}`, type: ComponentType.Text, isGenerated: true, x,
                    y: footerHeight - COMP_HEIGHT - 5, width, height: COMP_HEIGHT,
                    props: { ...COMPONENT_LIBRARY.find(c => c.type === ComponentType.Text)?.defaultProps, text, fontSize: pageNumberFontSize, color: pageNumberColor, textAlign: pageNumberAlign }
                };
                page.footer.push(pageNumberComponent);
            });
        }
    }, false);
  }, [ activeState?.documentSettings.showPageNumbers, activeState?.pages.length, activeState?.documentSettings.footerHeight, activeState?.documentSettings.pageNumberAlign, activeState?.documentSettings.pageNumberColor, activeState?.documentSettings.pageNumberFontSize, activeState?.documentSettings.pageNumberFormat ]);

  const renderContent = () => {
    if (view === 'home') {
      return <HomeScreen 
        projects={projects}
        onNewManual={() => setView('creation')}
        onOpenTemplateManager={() => setView('templateManager')}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />;
    }
    
    if (view === 'creation') {
      return <CreationFlow onProjectCreate={handleCreateProject} onCancel={handleGoHome} templates={templates} onDeleteTemplate={deleteTemplate} />;
    }

    if (view === 'templateManager') {
        return <TemplateManagerScreen 
          templates={templates} 
          onDelete={deleteTemplate} 
          onClose={handleGoHome} 
          onEdit={handleEditTemplate}
          onCreate={handleCreateNewTemplate}
          onUpdateProperties={handleUpdateTemplateProperties}
        />;
    }
    
    if (view === 'editor' && activeState) {
      const page = activeState.pages[activeState.currentPageIndex];
      const selectedComponent = page ? [...page.header, ...page.body, ...page.footer].find(c => c.id === activeState.selectedComponentId) : undefined;

      return (
        <>
          {isSaveTemplateModalOpen && (
            <SaveTemplateModal 
              onClose={() => setSaveTemplateModalOpen(false)}
              onSave={handleSaveTemplate}
            />
          )}
          {isTemplateModalOpen && (
            <TemplateLibraryModal 
                templates={activeState.templates}
                onSelect={addPageFromTemplate}
                onDelete={deleteTemplate}
                onClose={() => setTemplateModalOpen(false)}
            />
          )}
          <div className="flex flex-col h-screen font-sans text-base-color">
            <Header 
                projectName={activeState.projectName} 
                editingTarget={editingTarget}
                onSaveAsTemplate={saveCurrentPageAsTemplate} 
                onGoHome={handleGoHome}
                onSaveChanges={handleSaveChanges}
                theme={theme}
                onToggleTheme={toggleTheme}
                onUndo={undo}
                onRedo={redo}
                canUndo={history.length > 0}
                canRedo={future.length > 0}
            />
            <div className="flex flex-1 overflow-hidden">
              <div style={{ width: `${panelWidths.left}px`, flexShrink: 0 }} className="flex flex-col h-full">
                <LeftPanel 
                  pages={activeState.pages} currentPageIndex={activeState.currentPageIndex} assets={activeState.assets}
                  onAddPage={addPage} onRenamePage={renamePage} onDeletePage={deletePage} onSwitchPage={switchPage}
                  onUserImageUpload={addUserImage} onOpenTemplateModal={() => setTemplateModalOpen(true)}
                />
              </div>
              <Resizer onMouseDown={handleResize('left')} />
              <CenterPanel
                pages={activeState.pages} currentPageIndex={activeState.currentPageIndex} selectedComponentId={activeState.selectedComponentId}
                gridSize={activeState.gridSize} onSetGridSize={setGridSize}
                isGridVisible={activeState.isGridVisible} onSetIsGridVisible={setGridVisible}
                isSnapToGridEnabled={activeState.isSnapToGridEnabled} onSetIsSnapToGridEnabled={setSnapToGrid}
                documentSettings={activeState.documentSettings} zoom={zoom} onSetZoom={setZoom}
                onAddComponent={addComponent} onUpdateComponent={updateComponent} onSelectComponent={selectComponent} onDeleteComponent={deleteComponent}
              />
              <Resizer onMouseDown={handleResize('right')} />
              <div style={{ width: `${panelWidths.right}px`, flexShrink: 0 }} className="flex flex-col h-full">
                <RightPanel
                  selectedComponent={selectedComponent} documentSettings={activeState.documentSettings} brandKit={activeState.assets.brandKit}
                  onUpdateComponent={updateComponent} onDeleteComponent={deleteComponent} onSetDocumentSettings={setDocumentSettings}
                />
              </div>
            </div>
          </div>
        </>
      );
    }

    // Fallback view
    return <div className="w-screen h-screen bg-canvas flex items-center justify-center text-dark-color">Loading application...</div>;
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      {renderContent()}
    </DndProvider>
  );
};

export default App;