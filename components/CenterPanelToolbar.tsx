
import React from 'react';

interface CenterPanelToolbarProps {
    zoom: number;
    onSetZoom: (zoom: number) => void;
    isGridVisible: boolean;
    onSetIsGridVisible: (visible: boolean) => void;
    isSnapToGridEnabled: boolean;
    onSetIsSnapToGridEnabled: (enabled: boolean) => void;
    gridSize: number;
    onSetGridSize: (size: number) => void;
}

const IconButton: React.FC<{onClick: () => void, icon: string, active?: boolean, title?: string}> = ({ onClick, icon, active, title }) => (
    <button 
        onClick={onClick} 
        title={title}
        className={`icon-button w-10 h-10 ${active ? 'active' : ''}`}
    >
        <i className={`fas ${icon}`}></i>
    </button>
);

const CenterPanelToolbar: React.FC<CenterPanelToolbarProps> = (props) => {
    const { 
        zoom, onSetZoom, 
        isGridVisible, onSetIsGridVisible,
        isSnapToGridEnabled, onSetIsSnapToGridEnabled,
        gridSize, onSetGridSize
    } = props;
    
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-panel border border-color rounded-lg shadow-lg flex items-center space-x-4 p-2 z-20">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
                <button onClick={() => onSetZoom(Math.max(0.2, zoom - 0.1))} className="btn btn-secondary w-8 h-8 p-0" title="Zoom Out"><i className="fas fa-search-minus"></i></button>
                <span className="text-sm font-semibold text-base-color w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => onSetZoom(Math.min(2, zoom + 0.1))} className="btn btn-secondary w-8 h-8 p-0" title="Zoom In"><i className="fas fa-search-plus"></i></button>
            </div>
            
            <div className="w-px h-6 bg-border"></div>

            {/* Grid Controls */}
            <div className="flex items-center space-x-3">
                <IconButton 
                    icon="fa-border-all" 
                    active={isGridVisible} 
                    onClick={() => onSetIsGridVisible(!isGridVisible)} 
                    title={isGridVisible ? "Hide Grid" : "Show Grid"} 
                />
                 <IconButton 
                    icon="fa-magnet" 
                    active={isSnapToGridEnabled} 
                    onClick={() => onSetIsSnapToGridEnabled(!isSnapToGridEnabled)} 
                    title={isSnapToGridEnabled ? "Disable Snap" : "Enable Snap"} 
                />
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-light-color">Grid Size:</label>
                    <input 
                        type="number" 
                        value={gridSize} 
                        onChange={(e) => onSetGridSize(Math.max(5, parseInt(e.target.value, 10)))}
                        className="input w-16 text-sm p-1"
                        disabled={!isGridVisible}
                    />
                </div>
            </div>
        </div>
    );
};

export default CenterPanelToolbar;
