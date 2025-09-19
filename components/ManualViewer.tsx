
import React, { useRef } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { Page, Component, ComponentType, EditorState } from '../constants';
import DraggableComponent from './SectionWrapper';
import CenterPanelToolbar from './CenterPanelToolbar';

const Grid: React.FC<{size: number}> = ({ size }) => {
    const gridColor = 'rgba(203, 213, 225, 0.5)'; // Tailwind's gray-300 with opacity
    const backgroundSize = `${size}px ${size}px`;
    const backgroundImage = `
      linear-gradient(to right, ${gridColor} 1px, transparent 1px),
      linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
    `;
    return <div className="absolute inset-0 pointer-events-none" style={{ backgroundSize, backgroundImage }} />;
};

type DropItem = 
    | { type: ComponentType, initialProps?: any }
    | { assetType: 'image', src: string }

interface CenterPanelProps {
  pages: Page[];
  currentPageIndex: number;
  selectedComponentId: string | null;
  gridSize: number;
  isGridVisible: boolean;
  isSnapToGridEnabled: boolean;
  documentSettings: EditorState['documentSettings'];
  zoom: number;
  onSetZoom: (zoom: number) => void;
  onAddComponent: (type: ComponentType, position: { x: number; y: number }, section: 'header' | 'body' | 'footer', initialProps?: any) => void;
  onUpdateComponent: (id: string, updates: Partial<Component> | { props: any }) => void;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onSetGridSize: (size: number) => void;
  onSetIsGridVisible: (visible: boolean) => void;
  onSetIsSnapToGridEnabled: (enabled: boolean) => void;
}

const CenterPanel: React.FC<CenterPanelProps> = (props) => {
  const { 
    pages, currentPageIndex, selectedComponentId, 
    gridSize, isGridVisible, isSnapToGridEnabled, 
    documentSettings, zoom, onSetZoom, 
    onAddComponent, onUpdateComponent, onSelectComponent, onDeleteComponent,
    onSetGridSize, onSetIsGridVisible, onSetIsSnapToGridEnabled,
  } = props;

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const page = pages[currentPageIndex];

  const handleDrop = (item: DropItem, monitor: DropTargetMonitor, section: 'header' | 'body' | 'footer') => {
      const offset = monitor.getClientOffset();
      const canvasBounds = pageContainerRef.current?.getBoundingClientRect();
      if (offset && canvasBounds) {
        const x = (offset.x - canvasBounds.left) / zoom;
        const y = (offset.y - canvasBounds.top) / zoom;
        
        let sectionYOffset = 0;
        if (section === 'body') sectionYOffset = documentSettings.showHeaders ? documentSettings.headerHeight : 0;
        if (section === 'footer') sectionYOffset = (documentSettings.showHeaders ? documentSettings.headerHeight : 0) + (pageContainerRef.current?.querySelector('.page-body')?.clientHeight || 0);

        const finalX = x - documentSettings.pageMarginLeft;
        const finalY = y - sectionYOffset;
        
        if ('assetType' in item) {
             if (item.assetType === 'image') {
                onAddComponent(ComponentType.Image, { x: finalX, y: finalY }, section, { src: item.src });
             }
        } else {
             onAddComponent(item.type, { x: finalX, y: finalY }, section, item.initialProps);
        }
      }
  };

  const useSectionDrop = (section: 'header' | 'body' | 'footer') => {
      return useDrop(() => ({
          accept: ['component', 'asset'],
          drop: (item: DropItem, monitor) => handleDrop(item, monitor, section),
      }), [onAddComponent, documentSettings.pageMarginLeft, zoom, documentSettings.headerHeight]);
  }

  const [, headerDrop] = useSectionDrop('header');
  const [, bodyDrop] = useSectionDrop('body');
  const [, footerDrop] = useSectionDrop('footer');


  const renderComponents = (components: Component[], isStatic: boolean = false) => {
    return components.map((comp) => (
      <DraggableComponent
        key={comp.id}
        component={comp}
        isSelected={comp.id === selectedComponentId}
        onUpdate={onUpdateComponent}
        onSelect={onSelectComponent}
        onDelete={onDeleteComponent}
        gridSize={gridSize}
        isSnapToGridEnabled={isSnapToGridEnabled}
        isStatic={isStatic}
      />
    ));
  };

  return (
    <main className="flex-1 flex flex-col bg-canvas overflow-hidden relative">
        <div className="flex-1 overflow-auto p-8 flex justify-center" onClick={() => onSelectComponent(null)}>
            <div 
                className="relative"
                style={{
                    width: '8.5in',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                }}
            >
                <div
                    ref={pageContainerRef}
                    className="relative flex-shrink-0 bg-white shadow-2xl flex flex-col w-full h-[11in]"
                >
                    {isGridVisible && <Grid size={gridSize} />}

                     {/* Margin Guides */}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${documentSettings.pageMarginLeft}px`, borderLeft: '1px dashed rgba(0,0,0,0.2)' }} className="pointer-events-none" />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, right: `${documentSettings.pageMarginRight}px`, borderRight: '1px dashed rgba(0,0,0,0.2)' }} className="pointer-events-none" />
                    
                    {documentSettings.showHeaders && (
                      <div 
                        ref={headerDrop as any} 
                        className="relative flex-shrink-0"
                        style={{ 
                            height: `${documentSettings.headerHeight}px`, 
                            borderBottom: '1px dashed var(--color-border)',
                            paddingLeft: `${documentSettings.pageMarginLeft}px`,
                            paddingRight: `${documentSettings.pageMarginRight}px`,
                        }}
                      >
                          {page && renderComponents(page.header)}
                      </div>
                    )}

                    <div ref={bodyDrop as any} className="relative flex-1 page-body" style={{
                      paddingLeft: `${documentSettings.pageMarginLeft}px`,
                      paddingRight: `${documentSettings.pageMarginRight}px`,
                    }}>
                        {page && renderComponents(page.body)}
                    </div>

                    {documentSettings.showFooters && (
                      <div 
                        ref={footerDrop as any} 
                        className="relative flex-shrink-0" 
                        style={{ 
                            height: `${documentSettings.footerHeight}px`,
                            borderTop: '1px dashed var(--color-border)',
                            paddingLeft: `${documentSettings.pageMarginLeft}px`,
                            paddingRight: `${documentSettings.pageMarginRight}px`,
                        }}
                      >
                          {page && renderComponents(page.footer)}
                      </div>
                    )}
                </div>
            </div>
        </div>
        <CenterPanelToolbar 
            zoom={zoom} onSetZoom={onSetZoom}
            isGridVisible={isGridVisible} onSetIsGridVisible={onSetIsGridVisible}
            isSnapToGridEnabled={isSnapToGridEnabled} onSetIsSnapToGridEnabled={onSetIsSnapToGridEnabled}
            gridSize={gridSize} onSetGridSize={onSetGridSize}
        />
    </main>
  );
};

export default CenterPanel;
