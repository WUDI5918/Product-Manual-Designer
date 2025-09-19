
import React from 'react';
import { produce } from 'immer';
import { useDrag } from 'react-dnd';
import { Component, ComponentType } from '../constants';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

declare global {
    interface Window {
        katex: any;
    }
}

// --- Component Renderers ---

const TextRenderer: React.FC<{ 
    isStatic?: boolean;
    onTextChange: (newText: string) => void; 
    [key: string]: any;
}> = ({ text, fontSize, color, fontWeight, fontStyle, textAlign, textDecorationLine, lineHeight, letterSpacing, textTransform, backgroundColor, padding, onTextChange, isStatic }) => (
    <div 
        style={{ 
            fontSize: `${fontSize}px`, 
            color, 
            fontWeight, 
            fontStyle, 
            textAlign, 
            textDecoration: textDecorationLine, 
            lineHeight,
            letterSpacing: `${letterSpacing}px`,
            textTransform,
            backgroundColor,
            padding: `${padding}px`,
            height: '100%', 
            width: '100%', 
            overflow: 'hidden', 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
        }} 
        contentEditable={!isStatic}
        suppressContentEditableWarning
        onBlur={e => onTextChange(e.currentTarget.innerText)}
        dangerouslySetInnerHTML={{ __html: text }}
    />
);

const ImageRenderer: React.FC<{ 
    src: string; 
    alt: string; 
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    opacity: number;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    boxShadow: boolean;
}> = ({ src, alt, objectFit = 'cover', opacity, borderRadius, borderWidth, borderColor, boxShadow }) => {
    
    return (
        <div 
            style={{
                width: '100%',
                height: '100%',
                borderRadius: `${borderRadius}px`,
                border: `${borderWidth}px solid ${borderColor}`,
                boxShadow: boxShadow ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' : 'none',
                overflow: 'hidden'
            }}
        >
            <img 
                src={src} 
                alt={alt} 
                className={`w-full h-full pointer-events-none`} 
                style={{ objectFit, opacity }} 
            />
        </div>
    );
};

const IconRenderer: React.FC<{ className: string; color: string; width: number; }> = ({ className, color, width }) => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <i 
                className={className} 
                style={{ 
                    color, 
                    fontSize: `${width * 0.8}px`,
                    lineHeight: 1, // Ensure the icon is vertically centered
                }}
            />
        </div>
    );
};

type Cell = { text: string; rowspan: number; colspan: number; };

const TableRenderer: React.FC<{ 
    headers: Cell[], 
    rows: Cell[][], 
    headerColor?: string; 
    headerTextColor?: string;
    headerFontWeight?: string;
    alternateRowColor?: string;
    cellPadding?: number;
    borderColor?: string;
    borderWidth?: number;
    cellFontSize?: number;
    cellTextColor?: string;
    isStatic?: boolean;
    onUpdate: (props: any) => void; 
}> = ({ headers, rows, headerColor, headerTextColor, headerFontWeight, alternateRowColor, cellPadding, borderColor, borderWidth, cellFontSize, cellTextColor, isStatic, onUpdate }) => {
  
  const handleHeaderChange = (colIndex: number, value: string) => {
    onUpdate({ headers: produce(headers, draft => { draft[colIndex].text = value; }) });
  };
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    onUpdate({ rows: produce(rows, draft => { draft[rowIndex][colIndex].text = value; }) });
  };
  
  const handleCellFocus = (rowIndex: number, colIndex: number) => {
    if (isStatic) return;
    onUpdate({ selectedCell: { row: rowIndex, col: colIndex } });
  };
  
  const cellStyle = {
      padding: `${cellPadding}px`,
      border: `${borderWidth}px solid ${borderColor}`,
  };

  const coveredCells = Array(rows.length).fill(0).map(() => Array(headers.length).fill(false));

  return (
    <div className="w-full h-full">
      <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed', borderColor }}>
        <thead>
          <tr style={{ backgroundColor: headerColor }}>
            {headers.map((h, i) => 
              <th key={i} className="p-0 text-left font-semibold" 
                  style={{ ...cellStyle, color: headerTextColor, fontWeight: headerFontWeight }}
                  rowSpan={h.rowspan || 1}
                  colSpan={h.colspan || 1}
              >
                <div 
                    contentEditable={!isStatic} 
                    suppressContentEditableWarning 
                    onFocus={() => handleCellFocus(-1, i)}
                    onBlur={e => handleHeaderChange(i, e.currentTarget.innerText)} 
                    dangerouslySetInnerHTML={{ __html: h.text }} 
                    className="p-2 w-full h-full outline-none" style={{ wordBreak: 'break-word' }}
                />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            for (let y = 0; y < i; y++) {
                for (let x = 0; x < headers.length; x++) {
                    if(rows[y][x]) {
                        const rSpan = (rows[y][x].rowspan || 1);
                        if(rSpan > 1 && y + rSpan > i) {
                            const cSpan = (rows[y][x].colspan || 1);
                            for(let cs=0; cs<cSpan; cs++) {
                                coveredCells[i][x+cs] = true;
                            }
                        }
                    }
                }
            }
            return (
            <tr key={i} style={{ backgroundColor: i % 2 !== 0 ? alternateRowColor : 'white' }}>
              {row.map((cell, j) => {
                  if (coveredCells[i][j]) return null;
                  
                  if(cell) {
                      const cSpan = (cell.colspan || 1);
                      if (cSpan > 1) {
                        for(let k=1; k<cSpan; k++) {
                            coveredCells[i][j+k] = true;
                        }
                      }
                  }

                return cell && (
                <td key={j} className="p-0" 
                    style={{...cellStyle, fontSize: `${cellFontSize}px`, color: cellTextColor}}
                    rowSpan={cell.rowspan || 1}
                    colSpan={cell.colspan || 1}
                >
                  <div 
                    contentEditable={!isStatic}
                    suppressContentEditableWarning 
                    onFocus={() => handleCellFocus(i, j)}
                    onBlur={e => handleCellChange(i, j, e.currentTarget.innerText)} 
                    dangerouslySetInnerHTML={{ __html: cell.text }} 
                    className="p-2 w-full h-full outline-none" style={{ wordBreak: 'break-word' }}
                  />
                </td>
              )})}
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
};

const QuoteRenderer: React.FC<{ 
    text: string; 
    author: string; 
    quoteType: 'default' | 'info' | 'success' | 'warning' | 'danger';
    isStatic?: boolean;
    onUpdate: (props: any) => void 
}> = ({ text, author, quoteType, isStatic, onUpdate }) => {
    
    const quoteStyles = {
        default: { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-800', icon: 'fas fa-quote-left' },
        info: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', icon: 'fas fa-info-circle' },
        success: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: 'fas fa-check-circle' },
        warning: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: 'fas fa-exclamation-triangle' },
        danger: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: 'fas fa-exclamation-circle' },
    };
    const styles = quoteStyles[quoteType] || quoteStyles.default;

    return (
        <blockquote 
            className={`w-full h-full border-l-4 p-4 flex flex-col justify-center ${styles.bg} ${styles.border} ${styles.text}`}
        >
            <div className="flex">
                <i className={`${styles.icon} mr-4 mt-1 text-xl opacity-80`}></i>
                <div className="flex-1">
                     <p 
                        className="mb-2" 
                        contentEditable={!isStatic}
                        suppressContentEditableWarning 
                        onBlur={e => onUpdate({ text: e.currentTarget.innerText })}
                        dangerouslySetInnerHTML={{ __html: text }}
                    />
                    <footer 
                        className="text-sm not-italic self-end"
                        contentEditable={!isStatic}
                        suppressContentEditableWarning
                        onBlur={e => onUpdate({ author: e.currentTarget.innerText })}
                    >- <span dangerouslySetInnerHTML={{ __html: author }} /></footer>
                </div>
            </div>
        </blockquote>
    );
};


const ListRenderer: React.FC<{ 
    type: 'ordered' | 'unordered'; 
    items: string[]; 
    fontSize: number; 
    lineSpacing: number; 
    textColor: string;
    isStatic?: boolean;
    onUpdate: (props: any) => void; 
}> = ({ type, items, fontSize, lineSpacing, textColor, isStatic, onUpdate }) => {
    const ListTag = type === 'ordered' ? 'ol' : 'ul';
    const listStyle = type === 'ordered' ? 'list-decimal' : 'list-disc';

    return (
        <ListTag 
            className={`w-full h-full ${listStyle} list-inside p-4 text-slate-800`}
            style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing, color: textColor }}
        >
            {items.map((item, index) => (
                <li 
                    key={index} 
                    contentEditable={!isStatic}
                    suppressContentEditableWarning
                    onBlur={e => {
                        const newItems = produce(items, draft => {
                            draft[index] = e.currentTarget.innerText;
                        });
                        onUpdate({ items: newItems });
                    }}
                    dangerouslySetInnerHTML={{ __html: item }}
                />
            ))}
        </ListTag>
    );
};

const DividerRenderer: React.FC<{ weight: number; color: string; lineStyle: 'solid' | 'dashed' | 'dotted' }> = ({ weight, color, lineStyle }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        borderTopStyle: lineStyle,
        borderTopWidth: `${weight}px`,
        borderTopColor: color,
      }} />
    </div>
  );
};

const FormulaRenderer: React.FC<{ formula: string; fontSize: number; color: string; }> = ({ formula, fontSize, color }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (ref.current && window.katex) {
            try {
                ref.current.innerHTML = ''; // Clear previous render
                window.katex.render(formula, ref.current, {
                    throwOnError: false,
                    displayMode: true,
                });
            } catch (error) {
                console.error('KaTeX Error:', error);
                ref.current.innerText = 'Error rendering formula';
            }
        }
    }, [formula]);
    
    return (
      <div 
        ref={ref} 
        style={{ fontSize: `${fontSize}px`, color, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      />
    );
};


const AdvancedBlockRenderer: React.FC<{ onUpdate: (props: any) => void; isStatic?: boolean; [key: string]: any; }> = 
({ onUpdate, blockType, code, language, alertType, alertTitle, alertText, collapsibleTitle, collapsibleContent, isCollapsed, isStatic }) => {
  
  const handleContentEditableUpdate = (propName: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({ [propName]: e.currentTarget.innerText });
  };

  switch(blockType) {
    case 'code':
      return (
        <div className="w-full h-full text-sm">
          <SyntaxHighlighter language={language} style={materialDark as any} customStyle={{ margin: 0, height: '100%', width: '100%' }} codeTagProps={{style: {fontFamily: '"Fira Code", "Fira Mono", monospace'}}}>
            {code}
          </SyntaxHighlighter>
        </div>
      );
    
    case 'alert': // This is now handled by the Quote component
        return (
             <div className="p-4 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md">
                The 'Alert' block is now part of the 'Quote' component. Please use the 'Quote' component and select an appropriate type from the properties panel.
            </div>
        );

    case 'collapsible':
      return (
        <div className="w-full h-full border border-gray-300 rounded-md bg-white text-slate-800">
          <div 
            className="p-3 font-semibold flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => !isStatic && onUpdate({ isCollapsed: !isCollapsed })}
          >
            <span
              contentEditable={!isStatic}
              suppressContentEditableWarning
              onClick={e => e.stopPropagation()}
              onBlur={(e) => handleContentEditableUpdate('collapsibleTitle', e)}
              dangerouslySetInnerHTML={{ __html: collapsibleTitle }}
            />
            <i className={`fas fa-chevron-down transition-transform ${!isCollapsed && 'rotate-180'}`}></i>
          </div>
          {!isCollapsed && (
            <div className="p-3 border-t border-gray-200 bg-gray-50/50">
               <p
                  contentEditable={!isStatic}
                  suppressContentEditableWarning
                  onBlur={(e) => handleContentEditableUpdate('collapsibleContent', e)}
                  dangerouslySetInnerHTML={{ __html: collapsibleContent }}
                />
            </div>
          )}
        </div>
      );

    default:
      return <div className="p-4 bg-gray-200">Select a block type from the properties panel.</div>
  }
};


// --- Main Draggable Component Wrapper ---

interface DraggableComponentProps {
  component: Component;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<Component> | { props: any }) => void;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  gridSize: number;
  isSnapToGridEnabled: boolean;
  isStatic?: boolean;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component, isSelected, onUpdate, onSelect, onDelete, gridSize, isSnapToGridEnabled, isStatic = false }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'canvas-component',
      item: { id: component.id, x: component.x, y: component.y },
      canDrag: !component.isGenerated && !isStatic,
      end: (item, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta) {
          const newX = item.x + delta.x;
          const newY = item.y + delta.y;
          const snappedX = isSnapToGridEnabled ? Math.round(newX / gridSize) * gridSize : newX;
          const snappedY = isSnapToGridEnabled ? Math.round(newY / gridSize) * gridSize : newY;
          onUpdate(item.id, { x: snappedX, y: snappedY });
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [component.id, component.x, component.y, onUpdate, gridSize, isSnapToGridEnabled, component.isGenerated, isStatic]
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!component.isGenerated && !isStatic) {
      onSelect(component.id);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(component.id);
  }

  const handleImageDoubleClick = () => {
    if (component.type === ComponentType.Image && !isStatic) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(component.id, { props: { ...component.props, src: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.width;
    const startHeight = component.height;

    const doDrag = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      let newWidth = Math.max(gridSize, startWidth + dx);
      let newHeight = Math.max(gridSize, startHeight + dy);

      if (component.type === ComponentType.Icon) {
        const newSize = Math.max(newWidth, newHeight);
        newWidth = newSize;
        newHeight = newSize;
      }

      onUpdate(component.id, { 
        width: newWidth,
        height: newHeight
      });
    };

    const stopDrag = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);

      const dx = upEvent.clientX - startX;
      const dy = upEvent.clientY - startY;
      
      const rawWidth = startWidth + dx;
      const rawHeight = startHeight + dy;

      let finalWidth = isSnapToGridEnabled ? Math.max(gridSize, Math.round(rawWidth / gridSize) * gridSize) : Math.max(gridSize, rawWidth);
      let finalHeight = isSnapToGridEnabled ? Math.max(gridSize, Math.round(rawHeight / gridSize) * gridSize) : Math.max(gridSize, rawHeight);
      
      if (component.type === ComponentType.Icon) {
          const finalSize = Math.max(finalWidth, finalHeight);
          finalWidth = finalSize;
          finalHeight = finalSize;
      }

      onUpdate(component.id, {
          width: finalWidth,
          height: finalHeight
      });
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };


  const renderContent = () => {
    const updateProps = (newProps: any) => onUpdate(component.id, { props: { ...component.props, ...newProps } });

    switch (component.type) {
      case ComponentType.Text:
        return <TextRenderer {...component.props} isStatic={isStatic} onTextChange={(newText) => onUpdate(component.id, { props: { ...component.props, text: newText } })} />;
      case ComponentType.Image:
        return <ImageRenderer {...component.props} />;
      case ComponentType.Icon:
        return <IconRenderer {...component.props} width={component.width} />;
      case ComponentType.Table:
        return <TableRenderer {...component.props} isStatic={isStatic} onUpdate={updateProps} />;
      case ComponentType.Quote:
        return <QuoteRenderer {...component.props} isStatic={isStatic} onUpdate={updateProps} />;
      case ComponentType.List:
        return <ListRenderer {...component.props} isStatic={isStatic} onUpdate={updateProps} />;
      case ComponentType.Divider:
        return <DividerRenderer {...component.props} />;
      case ComponentType.Formula:
        return <FormulaRenderer {...component.props} />;
      case ComponentType.AdvancedBlock:
        return <AdvancedBlockRenderer {...component.props} isStatic={isStatic} onUpdate={updateProps} />;
      default:
        return <div className="bg-red-200">Unknown Component</div>;
    }
  };

  const isInteractive = isSelected && !component.isGenerated && !isStatic;

  const POINTER_EVENTS_AUTO_TYPES = [
    ComponentType.Text, ComponentType.Quote, ComponentType.List, ComponentType.Table, ComponentType.AdvancedBlock
  ];

  return (
    <div
      ref={!isStatic ? (drag as any) : null}
      onClick={handleClick}
      onDoubleClick={handleImageDoubleClick}
      style={{
        position: 'absolute',
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
        opacity: isDragging ? 0.4 : 1,
        cursor: component.isGenerated || isStatic ? 'default' : 'move',
        outline: isInteractive ? `2px solid var(--color-primary)` : 'none',
        border: !isStatic && !isSelected ? `1px dashed transparent` : 'none',
        outlineOffset: '2px',
        transition: 'outline 0.1s ease-in-out, border 0.1s ease-in-out',
        userSelect: component.isGenerated || isStatic ? 'none' : 'auto',
      }}
    >
      <div className="w-full h-full" style={{ pointerEvents: isInteractive && POINTER_EVENTS_AUTO_TYPES.includes(component.type) ? 'auto' : 'none'}}>
        {renderContent()}
      </div>
      
      {isInteractive && (
        <>
          <button onClick={handleDelete} title="Delete Component" className="absolute -top-3 -right-3 z-20 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 shadow-lg">
             <i className="fas fa-times text-xs"></i>
          </button>
          
          <div 
            onMouseDown={handleResize} 
            title="Resize"
            className="absolute -bottom-2 -right-2 z-20 w-4 h-4 bg-orange-500 border-2 border-white rounded-full cursor-se-resize shadow"
          ></div>
        </>
      )}

      {component.type === ComponentType.Image && (
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      )}
    </div>
  );
};

export default DraggableComponent;
