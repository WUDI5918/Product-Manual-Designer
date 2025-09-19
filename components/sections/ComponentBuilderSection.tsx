
import React, { useRef } from 'react';
import { produce } from 'immer';
import { useDrag, useDrop } from 'react-dnd';
// FIX: Use specific types for component builder to resolve type conflicts.
import { ComponentBuilderSectionData, BuilderComponent, BuilderComponentType } from '../../constants';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from '../ui/Editable';
import ImageUploader from '../ui/ImageUploader';
import EditableTable from '../ui/EditableTable';

interface ComponentBuilderSectionProps {
  data: ComponentBuilderSectionData;
  onUpdate: (data: Partial<ComponentBuilderSectionData>) => void;
  isEditable?: boolean;
}

const ItemTypes = {
  COMPONENT: 'component',
};

const DraggableComponent: React.FC<{
  component: BuilderComponent;
  onUpdate: (id: string, data: any) => void;
  onMove: (id: string, left: number, top: number) => void;
  onRemove: (id: string) => void;
  isEditable: boolean;
}> = ({ component, onUpdate, onMove, onRemove, isEditable }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { id: component.id, left: component.position.x, top: component.position.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditable,
  }), [component.id, component.position.x, component.position.y, isEditable]);

  drag(ref);

  const renderComponent = () => {
    switch (component.type) {
      case 'card':
        return (
          <div className="w-64 bg-white rounded-lg shadow-md overflow-hidden">
            <ImageUploader
              src={component.data.image}
              alt={component.data.title}
              onImageChange={base64 => onUpdate(component.id, { ...component.data, image: base64 })}
              className="w-full h-32 object-cover"
              isEditable={isEditable}
            />
            <div className="p-4">
              <h3 className="font-bold"><Editable value={component.data.title} onChange={v => onUpdate(component.id, {...component.data, title: v})} isEditable={isEditable} /></h3>
              <p className="text-sm text-gray-600"><Editable value={component.data.text} onChange={v => onUpdate(component.id, {...component.data, text: v})} isEditable={isEditable} /></p>
            </div>
          </div>
        );
      case 'quote':
        return (
            <blockquote className="w-80 border-l-4 border-yellow-400 bg-yellow-50 p-4 italic">
                <p className="mb-2"><Editable value={component.data.text} onChange={v => onUpdate(component.id, {...component.data, text: v})} isEditable={isEditable} /></p>
                <footer className="text-sm not-italic">- <Editable as="span" value={component.data.author} onChange={v => onUpdate(component.id, {...component.data, author: v})} isEditable={isEditable} /></footer>
            </blockquote>
        );
      case 'text':
        return (
            <div className="w-96">
                <h3 className="text-xl font-bold"><Editable value={component.data.title} onChange={v => onUpdate(component.id, {...component.data, title: v})} isEditable={isEditable} /></h3>
                <p><Editable value={component.data.text} onChange={v => onUpdate(component.id, {...component.data, text: v})} isEditable={isEditable} /></p>
            </div>
        )
      default: return null;
    }
  };

  return (
    <div
      ref={ref}
      style={{ left: component.position.x, top: component.position.y, position: 'absolute' }}
      className={`p-1 group ${isDragging ? 'opacity-50' : ''} ${isEditable ? 'cursor-move' : 'cursor-default'}`}
    >
      {isEditable && (
        <button onClick={() => onRemove(component.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <i className="fas fa-times text-xs"></i>
        </button>
      )}
      {renderComponent()}
    </div>
  );
};


const ComponentBuilderSection: React.FC<ComponentBuilderSectionProps> = ({ data, onUpdate, isEditable = true }) => {
  const dropRef = useRef<HTMLDivElement>(null);

  const addComponent = (type: BuilderComponentType) => {
    let newComponentData: any;
    switch(type) {
        case 'card': newComponentData = { image: 'https://picsum.photos/seed/card/300/200', title: 'Card Title', text: 'Card content...'}; break;
        case 'quote': newComponentData = { text: 'This is a quote.', author: 'Author'}; break;
        case 'text': newComponentData = { title: 'Text Title', text: 'Some descriptive text here.' }; break;
    }

    const newComponent: BuilderComponent = {
      id: `${type}-${Date.now()}`,
      type,
      data: newComponentData,
      position: { x: 20, y: 20 },
    };
    onUpdate({ components: [...data.components, newComponent] });
  };
  
  const updateComponentData = (id: string, newData: any) => {
    onUpdate(produce(data, draft => {
        const comp = draft.components.find(c => c.id === id);
        if(comp) comp.data = newData;
    }));
  };

  const moveComponent = (id: string, left: number, top: number) => {
     onUpdate(produce(data, draft => {
        const comp = draft.components.find(c => c.id === id);
        if(comp) {
            comp.position = { x: left, y: top };
        }
    }));
  };
  
  const removeComponent = (id: string) => {
      onUpdate({ components: data.components.filter(c => c.id !== id)});
  };
  
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.COMPONENT,
    drop(item: { id: string, left: number, top: number }, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;
      const left = Math.round(item.left + delta.x);
      const top = Math.round(item.top + delta.y);
      moveComponent(item.id, left, top);
      return undefined;
    },
  }), [moveComponent]);

  drop(dropRef);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        <Editable value={data.title} onChange={value => onUpdate({ title: value })} isEditable={isEditable}/>
      </h2>
      {isEditable && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-100 rounded-md">
            <button onClick={() => addComponent('card')} className="btn-add-comp"><i className="fas fa-id-card mr-2"></i>Card</button>
            <button onClick={() => addComponent('quote')} className="btn-add-comp"><i className="fas fa-quote-left mr-2"></i>Quote</button>
            <button onClick={() => addComponent('text')} className="btn-add-comp"><i className="fas fa-paragraph mr-2"></i>Text</button>
          </div>
      )}
      <div ref={dropRef} className="relative w-full h-[600px] bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg overflow-hidden">
        {data.components.map(component => (
          <DraggableComponent 
            key={component.id} 
            component={component} 
            onUpdate={updateComponentData} 
            onMove={moveComponent}
            onRemove={removeComponent}
            isEditable={isEditable}
          />
        ))}
      </div>
      {/* FIX: Removed non-standard `jsx` prop from style tag. */}
      <style>{`
        .btn-add-comp {
            background-color: #fff;
            border: 1px solid #ccc;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-add-comp:hover {
            background-color: #f0f0f0;
            border-color: #aaa;
        }
      `}</style>
    </div>
  );
};

export default ComponentBuilderSection;
