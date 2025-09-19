
import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { produce } from 'immer';
// FIX: Add FlowNodeShape to imports to support creating default flowchart nodes.
import { Component, ComponentType, EditorState, BrandKit, SUPPORTED_LANGUAGES } from '../../constants';

// FIX: Added missing Editable component to resolve import errors.
interface EditableProps {
    value: string;
    onChange: (value: string) => void;
    isEditable?: boolean;
    // FIX: Restrict the 'as' prop to HTML elements to fix onBlur event type incompatibility with SVG elements.
    // FIX: Using React.ElementType to fix compilation issues with dynamic tags.
    // The onBlur handler will only work correctly with HTMLElements.
    as?: React.ElementType;
    className?: string;
}

export const Editable: React.FC<EditableProps> = ({ value, onChange, isEditable = true, as: AsComponent = 'div', className }) => {
    if (!isEditable) {
        return <AsComponent className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    }

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
        onChange(e.currentTarget.innerText);
    };

    return (
        <AsComponent
            className={className}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            dangerouslySetInnerHTML={{ __html: value }}
        />
    );
};

// --- Custom Color Picker ---
const ColorPicker: React.FC<{ color: string; onChange: (color: string) => void; brandColors?: string[] }> = ({ color, onChange, brandColors = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const defaultColors = ['#0f172a', '#f8fafc', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [pickerRef]);

    const handleColorChange = (newColor: string) => {
        onChange(newColor);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={pickerRef}>
            <div className="w-full h-10 p-1 border border-color rounded-md bg-element flex items-center justify-between">
                <input 
                    type="text" 
                    value={color} 
                    onChange={e => onChange(e.target.value)} 
                    className="w-full bg-transparent outline-none text-base-color px-2 text-sm" 
                    onFocus={() => setIsOpen(true)}
                />
                <button
                    type="button"
                    className="w-8 h-full rounded border border-color flex-shrink-0"
                    style={{ backgroundColor: color }}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>
            {isOpen && (
                <div className="absolute z-10 top-full right-0 mt-2 w-60 bg-panel border border-color rounded-lg shadow-xl p-3">
                    {brandColors.length > 0 && (
                        <>
                            <p className="text-xs font-medium text-light-color mb-2 px-1">Brand Colors</p>
                            <div className="grid grid-cols-8 gap-2 mb-3">
                                {brandColors.map(c => <button key={c} onClick={() => handleColorChange(c)} className="w-6 h-6 rounded-full border border-color/50" style={{ backgroundColor: c }} title={c} />)}
                            </div>
                        </>
                    )}
                    <p className="text-xs font-medium text-light-color mb-2 px-1">Default Colors</p>
                     <div className="grid grid-cols-8 gap-2">
                        {defaultColors.map(c => <button key={c} onClick={() => handleColorChange(c)} className="w-6 h-6 rounded-full border border-color/50" style={{ backgroundColor: c }} title={c} />)}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Accordion Component ---
const Accordion: React.FC<{ title: string, children: ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-color">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 text-left font-semibold text-base-color hover-bg-element transition-colors">
                <span>{title}</span>
                <i className={`fas fa-chevron-down text-sm text-light-color transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && <div className="p-4 space-y-4 bg-contrast">{children}</div>}
        </div>
    );
};


interface RightPanelProps {
  selectedComponent: Component | undefined;
  documentSettings: EditorState['documentSettings'];
  brandKit: BrandKit;
  onUpdateComponent: (id: string, updates: Partial<Component> | { props: any }) => void;
  onDeleteComponent: (id: string) => void;
  onSetDocumentSettings: <K extends keyof EditorState['documentSettings']>(key: K, value: EditorState['documentSettings'][K]) => void;
}

const HEADING_STYLES = {
    paragraph: { fontSize: 16, fontWeight: 'normal' },
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 28, fontWeight: 'bold' },
    h3: { fontSize: 24, fontWeight: 'bold' },
    h4: { fontSize: 20, fontWeight: 'bold' },
    h5: { fontSize: 18, fontWeight: 'bold' },
    h6: { fontSize: 16, fontWeight: 'bold' },
};

const PropertyInput: React.FC<{label: string; children: React.ReactNode, className?: string}> = ({ label, children, className }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-light-color mb-1">{label}</label>
        {children}
    </div>
);

const IconButton: React.FC<{onClick: () => void, icon: string, active?: boolean, title?: string}> = ({ onClick, icon, active, title }) => (
    <button 
        onClick={onClick} 
        title={title}
        className={`icon-button ${active ? 'active' : ''}`}
    >
        <i className={`fas ${icon}`}></i>
    </button>
);

const ToggleSwitch: React.FC<{label: string; checked: boolean; onChange: (checked: boolean) => void}> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-base-color" htmlFor={`toggle-${label}`}>{label}</label>
        <label htmlFor={`toggle-${label}`} className="flex items-center cursor-pointer">
            <div className="relative">
                <input type="checkbox" id={`toggle-${label}`} className="sr-only toggle-switch-input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <div className="block toggle-switch-bg w-12 h-6 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 toggle-switch-dot w-4 h-4 rounded-full transition-transform`}></div>
            </div>
        </label>
    </div>
);


const RightPanel: React.FC<RightPanelProps> = ({ selectedComponent, documentSettings, brandKit, onUpdateComponent, onDeleteComponent, onSetDocumentSettings }) => {
  const handleSetDoc = onSetDocumentSettings;
    
  if (!selectedComponent) {
    return (
      <aside className="w-full h-full bg-panel border-l border-color overflow-y-auto">
        <div className="p-3 text-center border-b border-color">
            <h2 className="text-md font-bold text-dark-color">Document Settings</h2>
        </div>
        <Accordion title="Page Setup" defaultOpen>
            <PropertyInput label="Left Margin (px)">
                <input type="number" step="5" min="0" className="input" value={documentSettings.pageMarginLeft} onChange={e => handleSetDoc('pageMarginLeft', parseInt(e.target.value, 10))} />
            </PropertyInput>
            <PropertyInput label="Right Margin (px)">
                <input type="number" step="5" min="0" className="input" value={documentSettings.pageMarginRight} onChange={e => handleSetDoc('pageMarginRight', parseInt(e.target.value, 10))} />
            </PropertyInput>
        </Accordion>
         <Accordion title="Header">
            <ToggleSwitch label="Show Header" checked={documentSettings.showHeaders} onChange={(c) => handleSetDoc('showHeaders', c)} />
            {documentSettings.showHeaders && <>
                <PropertyInput label="Header Height (px)">
                    <input type="number" step="10" min="30" className="input" value={documentSettings.headerHeight} onChange={e => handleSetDoc('headerHeight', parseInt(e.target.value, 10))} />
                </PropertyInput>
            </>}
        </Accordion>
        <Accordion title="Footer">
            <ToggleSwitch label="Show Footer" checked={documentSettings.showFooters} onChange={(c) => handleSetDoc('showFooters', c)} />
            {documentSettings.showFooters && <>
                 <PropertyInput label="Footer Height (px)">
                    <input type="number" step="10" min="30" className="input" value={documentSettings.footerHeight} onChange={e => handleSetDoc('footerHeight', parseInt(e.target.value, 10))} />
                </PropertyInput>
            </>}
        </Accordion>
        <Accordion title="Page Numbers">
            <ToggleSwitch label="Show Page Numbers" checked={documentSettings.showPageNumbers} onChange={(c) => handleSetDoc('showPageNumbers', c)} />
            {documentSettings.showPageNumbers && (
                <>
                    <PropertyInput label="Format">
                        <input type="text" className="input" value={documentSettings.pageNumberFormat} onChange={e => handleSetDoc('pageNumberFormat', e.target.value)} />
                        <p className="text-xs text-light-color mt-1">Use {'{currentPage}'} and {'{totalPages}'}</p>
                    </PropertyInput>
                    <PropertyInput label="Alignment">
                        <div className="flex space-x-1">
                            <IconButton title="Align Left" icon="fa-align-left" active={documentSettings.pageNumberAlign === 'left'} onClick={() => handleSetDoc('pageNumberAlign', 'left')} />
                            <IconButton title="Align Center" icon="fa-align-center" active={documentSettings.pageNumberAlign === 'center'} onClick={() => handleSetDoc('pageNumberAlign', 'center')} />
                            <IconButton title="Align Right" icon="fa-align-right" active={documentSettings.pageNumberAlign === 'right'} onClick={() => handleSetDoc('pageNumberAlign', 'right')} />
                        </div>
                    </PropertyInput>
                    <div className="grid grid-cols-2 gap-4">
                        <PropertyInput label="Font Size">
                            <input type="number" className="input" value={documentSettings.pageNumberFontSize} onChange={e => handleSetDoc('pageNumberFontSize', parseInt(e.target.value, 10))} />
                        </PropertyInput>
                        <PropertyInput label="Color">
                             <ColorPicker color={documentSettings.pageNumberColor} onChange={c => handleSetDoc('pageNumberColor', c)} brandColors={brandKit.colors} />
                        </PropertyInput>
                    </div>
                </>
            )}
        </Accordion>
      </aside>
    );
  }

  const handlePropChange = (propUpdates: object) => {
      onUpdateComponent(selectedComponent.id, { props: propUpdates });
  };
  
  const handleTextTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as keyof typeof HEADING_STYLES;
    const style = HEADING_STYLES[type] || HEADING_STYLES.paragraph;
    onUpdateComponent(selectedComponent.id, {
        props: {
            ...selectedComponent.props,
            textType: type,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
        }
    });
  };

  const handleSizeChange = (propName: 'width' | 'height', value: number) => {
    onUpdateComponent(selectedComponent.id, { [propName]: value });
  };

  const renderTextProperties = (props: any) => (
    <>
        <Accordion title="Typography" defaultOpen>
            <PropertyInput label="Text Type">
              <select className="input" value={props.textType || 'paragraph'} onChange={handleTextTypeChange}>
                  <option value="paragraph">Paragraph</option>
                  <option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option><option value="h5">Heading 5</option><option value="h6">Heading 6</option>
              </select>
            </PropertyInput>
             <div className="grid grid-cols-2 gap-4">
                <PropertyInput label="Font Size">
                    <input type="number" className="input" value={props.fontSize} onChange={e => handlePropChange({ fontSize: parseInt(e.target.value, 10) })} />
                </PropertyInput>
                <PropertyInput label="Line Height">
                    <input type="number" step="0.1" className="input" value={props.lineHeight} onChange={e => handlePropChange({ lineHeight: parseFloat(e.target.value) })} />
                </PropertyInput>
            </div>
             <PropertyInput label="Style">
              <div className="flex space-x-1">
                  <IconButton title="Bold" icon="fa-bold" active={props.fontWeight === 'bold'} onClick={() => handlePropChange({ fontWeight: props.fontWeight === 'bold' ? 'normal' : 'bold' })} />
                  <IconButton title="Italic" icon="fa-italic" active={props.fontStyle === 'italic'} onClick={() => handlePropChange({ fontStyle: props.fontStyle === 'italic' ? 'normal' : 'italic' })} />
                  <IconButton title="Underline" icon="fa-underline" active={props.textDecorationLine === 'underline'} onClick={() => handlePropChange({ textDecorationLine: props.textDecorationLine === 'underline' ? 'none' : 'underline' })} />
              </div>
            </PropertyInput>
            <PropertyInput label="Alignment">
              <div className="flex space-x-1">
                  <IconButton title="Align Left" icon="fa-align-left" active={props.textAlign === 'left'} onClick={() => handlePropChange({ textAlign: 'left' })} />
                  <IconButton title="Align Center" icon="fa-align-center" active={props.textAlign === 'center'} onClick={() => handlePropChange({ textAlign: 'center' })} />
                  <IconButton title="Align Right" icon="fa-align-right" active={props.textAlign === 'right'} onClick={() => handlePropChange({ textAlign: 'right' })} />
              </div>
            </PropertyInput>
        </Accordion>
        <Accordion title="Color & Appearance">
             <PropertyInput label="Text Color">
                <ColorPicker color={props.color} onChange={c => handlePropChange({ color: c })} brandColors={brandKit.colors} />
            </PropertyInput>
             <PropertyInput label="Background Color">
                 <ColorPicker color={props.backgroundColor} onChange={c => handlePropChange({ backgroundColor: c })} brandColors={brandKit.colors} />
            </PropertyInput>
             <PropertyInput label="Padding (px)">
                <input type="number" className="input" value={props.padding} onChange={e => handlePropChange({ padding: parseInt(e.target.value, 10) })} />
            </PropertyInput>
        </Accordion>
      </>
  );

  const renderImageProperties = (props: any) => (
      <>
        <Accordion title="Style" defaultOpen>
            <PropertyInput label="Display Mode">
                <select className="input" value={props.objectFit || 'cover'} onChange={e => handlePropChange({ objectFit: e.target.value })}>
                    <option value="cover">Fill</option>
                    <option value="contain">Fit</option>
                    <option value="fill">Stretch</option>
                    <option value="none">Center</option>
                </select>
            </PropertyInput>
            <PropertyInput label={`Opacity: ${Math.round(props.opacity * 100)}%`}>
                 <input type="range" min="0" max="1" step="0.05" className="w-full" value={props.opacity} onChange={e => handlePropChange({ opacity: parseFloat(e.target.value) })} />
            </PropertyInput>
        </Accordion>
        <Accordion title="Border & Shadow">
            <div className="grid grid-cols-2 gap-4">
                <PropertyInput label="Corner Radius">
                    <input type="number" className="input" value={props.borderRadius} onChange={e => handlePropChange({ borderRadius: parseInt(e.target.value, 10) })} />
                </PropertyInput>
                 <PropertyInput label="Border Width">
                    <input type="number" className="input" value={props.borderWidth} onChange={e => handlePropChange({ borderWidth: parseInt(e.target.value, 10) })} />
                </PropertyInput>
            </div>
            <PropertyInput label="Border Color">
                <ColorPicker color={props.borderColor} onChange={c => handlePropChange({ borderColor: c })} brandColors={brandKit.colors} />
            </PropertyInput>
             <ToggleSwitch label="Box Shadow" checked={props.boxShadow} onChange={(c) => handlePropChange({ boxShadow: c })} />
        </Accordion>
      </>
  );
  
  const renderIconProperties = (props: any) => (
      <Accordion title="Appearance" defaultOpen>
        <PropertyInput label="Color">
            <ColorPicker color={props.color} onChange={c => handlePropChange({ color: c })} brandColors={brandKit.colors} />
        </PropertyInput>
        <p className="text-xs text-light-color text-center mt-2">Icon size is controlled by resizing the component on the canvas.</p>
      </Accordion>
  );

  const renderDividerProperties = (props: any) => (
    <Accordion title="Appearance" defaultOpen>
        <PropertyInput label="Line Style">
            <select className="input" value={props.lineStyle} onChange={e => handlePropChange({ lineStyle: e.target.value })}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
            </select>
        </PropertyInput>
        <div className="grid grid-cols-2 gap-4">
            <PropertyInput label="Thickness">
                <input type="number" min="1" className="input" value={props.weight} onChange={e => handlePropChange({ weight: parseInt(e.target.value, 10) })} />
            </PropertyInput>
            <PropertyInput label="Color">
                <ColorPicker color={props.color} onChange={c => handlePropChange({ color: c })} brandColors={brandKit.colors} />
            </PropertyInput>
        </div>
    </Accordion>
  );

  const renderListProperties = (props: any) => (
    <>
        <Accordion title="List Items" defaultOpen>
            {props.items.map((item: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                    <input type="text" className="input" value={item} onChange={e => {
                        const newItems = produce(props.items, (draft: string[]) => { draft[index] = e.target.value });
                        handlePropChange({ items: newItems });
                    }} />
                    <button onClick={() => {
                        const newItems = produce(props.items, (draft: string[]) => { draft.splice(index, 1) });
                        handlePropChange({ items: newItems });
                    }} className="text-red-500 hover:text-red-700 p-1"><i className="fas fa-trash"></i></button>
                </div>
            ))}
             <button onClick={() => handlePropChange({ items: [...props.items, 'New Item'] })} className="btn btn-secondary mt-2 w-full text-sm">Add Item</button>
        </Accordion>
        <Accordion title="Appearance">
             <div className="grid grid-cols-2 gap-4">
                <PropertyInput label="Font Size">
                    <input type="number" className="input" value={props.fontSize} onChange={e => handlePropChange({ fontSize: parseInt(e.target.value, 10) })} />
                </PropertyInput>
                <PropertyInput label="Line Spacing">
                    <input type="number" step="0.1" className="input" value={props.lineSpacing} onChange={e => handlePropChange({ lineSpacing: parseFloat(e.target.value) })} />
                </PropertyInput>
            </div>
            <PropertyInput label="Text Color">
                <ColorPicker color={props.textColor} onChange={c => handlePropChange({ textColor: c })} brandColors={brandKit.colors} />
            </PropertyInput>
        </Accordion>
    </>
  );

  const renderQuoteProperties = (props: any) => (
    <Accordion title="Appearance" defaultOpen>
        <PropertyInput label="Quote Type">
            <select className="input" value={props.quoteType} onChange={e => handlePropChange({ quoteType: e.target.value })}>
                <option value="default">Default</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
            </select>
        </PropertyInput>
    </Accordion>
  );

  const renderTableProperties = (props: any) => {
    const { selectedCell, rows, headers } = props;
    const activeCell = selectedCell && selectedCell.row > -1 
        ? rows[selectedCell.row]?.[selectedCell.col]
        : headers[selectedCell?.col];

    const handleSpanChange = (type: 'rowspan' | 'colspan', valueStr: string) => {
        const value = parseInt(valueStr, 10);
        if (!selectedCell || isNaN(value) || value < 1) return;

        const updatePath = selectedCell.row > -1 ? 'rows' : 'headers';
        const updatedCollection = produce(props[updatePath], (draft: any[]) => {
            const cell = selectedCell.row > -1 ? draft[selectedCell.row][selectedCell.col] : draft[selectedCell.col];
            if (cell) cell[type] = value;
        });
        handlePropChange({ [updatePath]: updatedCollection });
    };

    const handleSplitCell = () => {
        if (!activeCell || !selectedCell) return;
        const updatePath = selectedCell.row > -1 ? 'rows' : 'headers';
        const updatedCollection = produce(props[updatePath], (draft: any[]) => {
            const cell = selectedCell.row > -1 ? draft[selectedCell.row][selectedCell.col] : draft[selectedCell.col];
            if (cell) {
                cell.rowspan = 1;
                cell.colspan = 1;
            }
        });
        handlePropChange({ [updatePath]: updatedCollection, selectedCell: null });
    };

    const handleTableResize = (newRowCountStr: string, newColCountStr: string) => {
        const newRowCount = parseInt(newRowCountStr, 10);
        const newColCount = parseInt(newColCountStr, 10);
        
        const currentRows = props.rows.length;
        const currentCol = props.headers.length;

        let newHeaders = [...props.headers];
        let newRows = JSON.parse(JSON.stringify(props.rows));

        if (!isNaN(newColCount) && newColCount > 0 && newColCount !== currentCol) {
            if (newColCount > currentCol) {
                for (let i = currentCol; i < newColCount; i++) {
                    newHeaders.push({ text: `Header ${i+1}`, rowspan: 1, colspan: 1 });
                    newRows.forEach((row: any[]) => row.push({ text: 'Cell', rowspan: 1, colspan: 1 }));
                }
            } else {
                newHeaders.splice(newColCount);
                newRows.forEach((row: any[]) => row.splice(newColCount));
            }
        }
        
        if (!isNaN(newRowCount) && newRowCount > 0 && newRowCount !== currentRows) {
            if (newRowCount > currentRows) {
                const cols = newHeaders.length;
                for (let i = currentRows; i < newRowCount; i++) {
                    newRows.push(Array(cols).fill(0).map(() => ({ text: 'Cell', rowspan: 1, colspan: 1 })));
                }
            } else {
                newRows.splice(newRowCount);
            }
        }
        
        handlePropChange({ headers: newHeaders, rows: newRows, selectedCell: null });
    };


    return (
    <>
        <Accordion title="Structure" defaultOpen>
             <div className="grid grid-cols-2 gap-4">
                <PropertyInput label="Rows">
                    <input type="number" min="1" className="input" value={rows.length} onChange={e => handleTableResize(e.target.value, String(headers.length))} />
                </PropertyInput>
                <PropertyInput label="Columns">
                    <input type="number" min="1" className="input" value={headers.length} onChange={e => handleTableResize(String(rows.length), e.target.value)} />
                </PropertyInput>
            </div>
        </Accordion>
        {activeCell && (
            <Accordion title="Selected Cell Tools">
                 <div className="grid grid-cols-2 gap-4">
                    <PropertyInput label="Row Span">
                        <input type="number" min="1" className="input" value={activeCell.rowspan || 1} onChange={e => handleSpanChange('rowspan', e.target.value)} />
                    </PropertyInput>
                    <PropertyInput label="Column Span">
                        <input type="number" min="1" className="input" value={activeCell.colspan || 1} onChange={e => handleSpanChange('colspan', e.target.value)} />
                    </PropertyInput>
                </div>
                <button onClick={handleSplitCell} className="btn btn-secondary text-sm w-full mt-3"><i className="fas fa-th mr-2"></i>Split Cell</button>
            </Accordion>
        )}
        <Accordion title="Appearance & Typography">
            <div className="grid grid-cols-2 gap-4">
                 <PropertyInput label="Header Bg">
                    <ColorPicker color={props.headerColor} onChange={c => handlePropChange({ headerColor: c })} brandColors={brandKit.colors} />
                </PropertyInput>
                <PropertyInput label="Header Text">
                    <ColorPicker color={props.headerTextColor} onChange={c => handlePropChange({ headerTextColor: c })} brandColors={brandKit.colors} />
                </PropertyInput>
                <PropertyInput label="Alt Row Bg">
                    <ColorPicker color={props.alternateRowColor} onChange={c => handlePropChange({ alternateRowColor: c })} brandColors={brandKit.colors} />
                </PropertyInput>
                 <PropertyInput label="Border">
                    <ColorPicker color={props.borderColor} onChange={c => handlePropChange({ borderColor: c })} brandColors={brandKit.colors} />
                </PropertyInput>
            </div>
            <PropertyInput label="Header Style">
                <div className="flex space-x-1">
                    <IconButton title="Bold" icon="fa-bold" active={props.headerFontWeight === 'bold'} onClick={() => handlePropChange({ headerFontWeight: props.headerFontWeight === 'bold' ? 'normal' : 'bold' })} />
                </div>
            </PropertyInput>
            <div className="grid grid-cols-2 gap-4">
                <PropertyInput label="Cell Font Size">
                    <input type="number" className="input" value={props.cellFontSize} onChange={e => handlePropChange({ cellFontSize: parseInt(e.target.value, 10) })} />
                </PropertyInput>
                <PropertyInput label="Cell Text Color">
                    <ColorPicker color={props.cellTextColor} onChange={c => handlePropChange({ cellTextColor: c })} brandColors={brandKit.colors} />
                </PropertyInput>
            </div>
        </Accordion>
        <Accordion title="Layout">
             <div className="grid grid-cols-2 gap-4">
                <PropertyInput label="Cell Padding">
                    <input type="number" className="input" value={props.cellPadding} onChange={e => handlePropChange({ cellPadding: parseInt(e.target.value, 10) })} />
                </PropertyInput>
                 <PropertyInput label="Border Width">
                    <input type="number" className="input" value={props.borderWidth} onChange={e => handlePropChange({ borderWidth: parseInt(e.target.value, 10) })} />
                </PropertyInput>
            </div>
        </Accordion>
    </>
    )
  }
  
  const renderAdvancedBlockProperties = (props: any) => (
    <Accordion title="Block Settings" defaultOpen>
        <PropertyInput label="Block Type">
            <select className="input" value={props.blockType} onChange={e => handlePropChange({ blockType: e.target.value })}>
                <option value="code">Code Block</option>
                <option value="collapsible">Collapsible</option>
            </select>
        </PropertyInput>
        {props.blockType === 'code' && (
             <PropertyInput label="Language">
                <select className="input" value={props.language} onChange={e => handlePropChange({ language: e.target.value })}>
                    {SUPPORTED_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
            </PropertyInput>
        )}
    </Accordion>
  );

  const renderFormulaProperties = (props: any) => (
      <Accordion title="Formula" defaultOpen>
        <PropertyInput label="LaTeX Formula">
            <textarea 
                className="input font-mono" 
                rows={4} 
                value={props.formula} 
                onChange={e => handlePropChange({ formula: e.target.value })}
            />
        </PropertyInput>
        <div className="grid grid-cols-2 gap-4">
            <PropertyInput label="Font Size">
                <input type="number" className="input" value={props.fontSize} onChange={e => handlePropChange({ fontSize: parseInt(e.target.value, 10) })} />
            </PropertyInput>
            <PropertyInput label="Color">
                <ColorPicker color={props.color} onChange={c => handlePropChange({ color: c })} brandColors={brandKit.colors} />
            </PropertyInput>
        </div>
      </Accordion>
  )

  const renderProperties = () => {
      const { props } = selectedComponent;
      switch(selectedComponent.type) {
          case ComponentType.Text: return renderTextProperties(props);
          case ComponentType.Image: return renderImageProperties(props);
          case ComponentType.Icon: return renderIconProperties(props);
          case ComponentType.Divider: return renderDividerProperties(props);
          case ComponentType.List: return renderListProperties(props);
          case ComponentType.Quote: return renderQuoteProperties(props);
          case ComponentType.Table: return renderTableProperties(props);
          case ComponentType.Formula: return renderFormulaProperties(props);
          case ComponentType.AdvancedBlock: return renderAdvancedBlockProperties(props);
          default:
              return <div className="p-4"><p>No editable properties for this component.</p></div>;
      }
  }

  return (
    <aside className="w-full h-full bg-panel border-l border-color flex flex-col">
       <div className="p-3 text-center border-b border-color">
            <h2 className="text-md font-bold text-dark-color">{selectedComponent.type} Properties</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
            <Accordion title="Layout" defaultOpen>
                <div className="grid grid-cols-2 gap-4">
                    <PropertyInput label="Width">
                        <input type="number" className="input" value={Math.round(selectedComponent.width)} onChange={e => handleSizeChange('width', Math.max(10, parseInt(e.target.value, 10)))} />
                    </PropertyInput>
                    <PropertyInput label="Height">
                        <input type="number" className="input" value={Math.round(selectedComponent.height)} onChange={e => handleSizeChange('height', Math.max(10, parseInt(e.target.value, 10)))} />
                    </PropertyInput>
                     <PropertyInput label="X Position">
                        <input type="number" className="input" value={Math.round(selectedComponent.x)} onChange={e => onUpdateComponent(selectedComponent.id, { x: parseInt(e.target.value, 10) })} />
                    </PropertyInput>
                    <PropertyInput label="Y Position">
                        <input type="number" className="input" value={Math.round(selectedComponent.y)} onChange={e => onUpdateComponent(selectedComponent.id, { y: parseInt(e.target.value, 10) })} />
                    </PropertyInput>
                </div>
            </Accordion>
            {renderProperties()}
        </div>

        <div className="p-4 border-t border-color">
            <button onClick={() => onDeleteComponent(selectedComponent.id)} className="w-full btn bg-red-500 text-white hover:bg-red-600">
                <i className="fas fa-trash-alt mr-2"></i>Delete Component
            </button>
        </div>
    </aside>
  );
};

export default RightPanel;
