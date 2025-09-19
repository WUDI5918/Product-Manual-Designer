
import React, { useState, useRef, ReactNode, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { COMPONENT_LIBRARY, Template, Assets, Page, ComponentType } from '../constants';

// --- Accordion Component ---
const Accordion: React.FC<{ title: string; icon: string; children: ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-color">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 text-left font-semibold text-base-color hover-bg-element">
                <span><i className={`fas ${icon} w-6 text-center text-light-color mr-2`}></i>{title}</span>
                <i className={`fas fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && <div className="p-2 bg-contrast">{children}</div>}
        </div>
    );
};


// --- Draggable Items ---
const DraggableItem: React.FC<{ itemData: any; type: string; children: ReactNode }> = ({ itemData, type, children }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type,
        item: itemData,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));
    return <div ref={drag as any} className={`cursor-grab ${isDragging ? 'opacity-50' : ''}`}>{children}</div>;
};

const ComponentItem: React.FC<{ type: ComponentType; icon: string; label: string; }> = ({ type, icon, label }) => (
    <DraggableItem itemData={{ type }} type="component">
        <div className="flex items-center p-2 rounded-lg transition-colors hover-bg-element" title={`Drag to add a ${label}`}>
            <i className={`${icon} w-6 text-center text-lg text-light-color`}></i>
            <span className="ml-3 font-medium text-base-color text-sm">{label}</span>
        </div>
    </DraggableItem>
);

// --- Main Panel and Tabs ---
interface LeftPanelProps {
    pages: Page[];
    currentPageIndex: number;
    assets: Assets;
    onUserImageUpload: (base64: string) => void;
    onAddPage: () => void;
    onRenamePage: (index: number, newName: string) => void;
    onDeletePage: (index: number) => void;
    onSwitchPage: (index: number) => void;
    onOpenTemplateModal: () => void;
}

type MainTab = 'pages' | 'add';

const LeftPanel: React.FC<LeftPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<MainTab>('add');

    const TabButton = ({ id, label, icon }: { id: MainTab, label: string, icon: string }) => (
        <button onClick={() => setActiveTab(id)} title={label} className={`flex-1 p-3 text-sm font-semibold flex flex-col items-center justify-center transition-colors border-b-2 ${activeTab === id ? 'text-primary-color border-primary-color bg-contrast' : 'text-light-color border-transparent hover-bg-element'}`}>
            <i className={`fas ${icon} text-lg mb-1`}></i>
            <span>{label}</span>
        </button>
    );

    return (
        <aside className="w-full h-full bg-panel border-r border-color flex flex-col">
            <div className="flex-shrink-0 flex border-b border-color">
                <TabButton id="pages" label="Pages" icon="fa-copy" />
                <TabButton id="add" label="Add" icon="fa-plus-square" />
            </div>
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'pages' && <PageManager {...props} />}
                {activeTab === 'add' && <AddPanel {...props} />}
            </div>
        </aside>
    );
};

// --- Page Manager with Editable Names ---
const PageManager: React.FC<LeftPanelProps> = ({ pages, currentPageIndex, onAddPage, onRenamePage, onDeletePage, onSwitchPage }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draftName, setDraftName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingIndex !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingIndex]);

    const handleDoubleClick = (index: number, name: string) => {
        setEditingIndex(index);
        setDraftName(name);
    };

    const handleNameChange = () => {
        if (editingIndex !== null && draftName.trim()) {
            onRenamePage(editingIndex, draftName.trim());
        }
        setEditingIndex(null);
        setDraftName('');
    };
    
    return (
    <div className="p-4 space-y-3">
        {pages.map((page, index) => (
            <div key={page.id} className={`relative group border-2 rounded-lg p-2 cursor-pointer transition-all ${currentPageIndex === index ? 'border-primary-color bg-element' : 'border-transparent hover-border-color hover:bg-element'}`} onClick={() => onSwitchPage(index)} onDoubleClick={() => handleDoubleClick(index, page.name)}>
                <div className="flex items-center">
                    <div className="w-12 h-16 bg-contrast rounded flex-shrink-0 border border-color flex items-center justify-center">
                        <span className="text-light-color font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="ml-3">
                        {editingIndex === index ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={draftName}
                                onChange={(e) => setDraftName(e.target.value)}
                                onBlur={handleNameChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
                                className="font-semibold text-base-color bg-panel border border-primary-color rounded px-1 -ml-1 w-full"
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (
                            <p className="font-semibold text-base-color">{page.name}</p>
                        )}
                        <p className="text-xs text-light-color">{page.body.length} components</p>
                    </div>
                </div>
                {pages.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); onDeletePage(index); }} title={`Delete ${page.name}`} className="absolute top-2 right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <i className="fas fa-times text-xs"></i>
                    </button>
                )}
            </div>
        ))}
         <button onClick={onAddPage} className="w-full btn btn-secondary mt-4"><i className="fas fa-plus mr-2"></i>Add New Page</button>
    </div>
)};


const AddPanel: React.FC<LeftPanelProps> = ({ assets, onUserImageUpload, onOpenTemplateModal }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onUserImageUpload(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div>
            <Accordion title="Templates" icon="fa-file-alt" defaultOpen>
                <div className="p-2">
                    <button onClick={onOpenTemplateModal} className="w-full btn btn-secondary">
                        <i className="fas fa-plus mr-2"></i>Add Page from Template
                    </button>
                </div>
            </Accordion>
            <Accordion title="Elements" icon="fa-pencil-ruler">
                <div className="space-y-1">
                    {COMPONENT_LIBRARY.filter(c => c.category === 'element').map((comp) => <ComponentItem key={comp.type} {...comp} />)}
                </div>
            </Accordion>
            <Accordion title="Blocks" icon="fa-th-large">
                 <div className="space-y-1">
                    {COMPONENT_LIBRARY.filter(c => c.category === 'block').map((comp) => <ComponentItem key={comp.type} {...comp} />)}
                </div>
            </Accordion>
             <Accordion title="Media" icon="fa-photo-video">
                 <div className="p-2 space-y-4">
                    <button onClick={() => fileInputRef.current?.click()} className="w-full btn btn-secondary"><i className="fas fa-upload mr-2"></i>Upload Image</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <div className="grid grid-cols-3 gap-2">
                         {assets.images.map(image => (
                             <DraggableItem key={image.id} itemData={{ assetType: 'image', src: image.src }} type="asset">
                                 <div className="aspect-square bg-element rounded-md overflow-hidden border border-color" title="Drag to add image">
                                     <img src={image.src} className="w-full h-full object-cover"/>
                                 </div>
                             </DraggableItem>
                         ))}
                    </div>
                     {assets.images.length === 0 && <p className="text-center text-sm text-light-color py-4">No images uploaded.</p>}
                 </div>
            </Accordion>
            <Accordion title="Icons" icon="fa-icons">
                 <div className="p-2 space-y-4">
                    <div className="grid grid-cols-5 gap-2 text-center">
                        {assets.icons.map(icon => (
                             <DraggableItem key={icon.id} itemData={{ type: ComponentType.Icon, initialProps: { className: icon.className } }} type="component">
                                <div className="p-3 bg-element rounded-md hover:bg-orange-900/50 flex flex-col items-center" title={`Drag to add ${icon.name}`}>
                                    <i className={`${icon.className} text-2xl text-light-color`}></i>
                                </div>
                            </DraggableItem>
                        ))}
                    </div>
                </div>
            </Accordion>
             <Accordion title="Brand Kit" icon="fa-palette">
                 <div className="p-2 space-y-4">
                    <div>
                        <h4 className="font-semibold text-base-color mb-2 text-sm">Logo</h4>
                        {assets.brandKit.logo ? (
                            <DraggableItem itemData={{ assetType: 'image', src: assets.brandKit.logo }} type="asset">
                                <div className="w-32 p-2 border border-color rounded-md bg-element" title="Drag logo to canvas">
                                    <img src={assets.brandKit.logo} alt="Brand Logo"/>
                                </div>
                            </DraggableItem>
                        ) : <button className="text-sm text-orange-400">Upload Logo</button>}
                    </div>
                     <div>
                        <h4 className="font-semibold text-base-color mb-2 text-sm">Colors</h4>
                        <div className="flex flex-wrap gap-2">
                            {assets.brandKit.colors.map(color => (
                                <div key={color} className="w-8 h-8 rounded-full border border-color" style={{ backgroundColor: color }} title={color}></div>
                            ))}
                        </div>
                    </div>
                 </div>
            </Accordion>
        </div>
    );
};

export default LeftPanel;