
import React from 'react';
import { Template } from '../constants';
import DraggableComponent from './SectionWrapper';

interface TemplatePreviewProps {
    template: Template;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
    const { page } = template;
    const PAGE_WIDTH = 816; // 8.5in * 96dpi
    const PAGE_HEIGHT = 1056; // 11in * 96dpi

    const renderComponents = (components: any[]) => {
        return components.map(comp => (
            <DraggableComponent
                key={comp.id}
                component={comp}
                isSelected={false}
                onUpdate={() => {}}
                onSelect={() => {}}
                onDelete={() => {}}
                gridSize={20}
                isSnapToGridEnabled={false}
                isStatic={true}
            />
        ));
    };

    return (
        <div className="relative w-full h-full bg-white overflow-hidden">
            <div 
                className="absolute top-0 left-0"
                style={{
                    width: `${PAGE_WIDTH}px`,
                    height: `${PAGE_HEIGHT}px`,
                    transform: `scale(calc(100% / ${PAGE_WIDTH}px))`, // Scale to fit width
                    transformOrigin: 'top left',
                }}
            >
                <div className="relative w-full h-full">
                    {page.header && renderComponents(page.header)}
                    {page.body && renderComponents(page.body)}
                    {page.footer && renderComponents(page.footer)}
                </div>
            </div>
        </div>
    );
};

export default TemplatePreview;
