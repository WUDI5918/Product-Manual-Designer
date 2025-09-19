
import React from 'react';
import { produce } from 'immer';
// FIX: Import missing section data type.
import { GallerySectionData } from '../../constants';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from '../ui/Editable';
import ImageUploader from '../ui/ImageUploader';

interface GallerySectionProps {
  data: GallerySectionData;
  onUpdate: (data: GallerySectionData) => void;
  isEditable?: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({ data, onUpdate, isEditable = true }) => {

  const handleItemChange = (index: number, field: string, value: string) => {
    onUpdate(produce(data, draft => {
      (draft.items[index] as any)[field] = value;
    }));
  };

  const addItem = () => {
    onUpdate(produce(data, draft => {
        draft.items.push({
            id: `gallery-item-${Date.now()}`,
            image: 'https://picsum.photos/seed/newItem/600/400',
            title: 'New Product',
            description: 'A brief description of the new product.'
        });
    }));
  };

  const removeItem = (index: number) => {
    onUpdate(produce(data, draft => {
        draft.items.splice(index, 1);
    }));
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
            <Editable value={data.title} onChange={value => onUpdate({ ...data, title: value })} isEditable={isEditable}/>
        </h2>
        {isEditable && (
             <button onClick={addItem} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                <i className="fas fa-plus mr-2"></i>Add Item
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.items.map((item, index) => (
          <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden group relative">
            <ImageUploader
              src={item.image}
              alt={item.title}
              onImageChange={base64 => handleItemChange(index, 'image', base64)}
              className="w-full h-56 object-cover"
              isEditable={isEditable}
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                <Editable value={item.title} onChange={value => handleItemChange(index, 'title', value)} isEditable={isEditable}/>
              </h3>
              <p className="text-gray-600">
                <Editable value={item.description} onChange={value => handleItemChange(index, 'description', value)} isEditable={isEditable}/>
              </p>
            </div>
            {isEditable && (
                <button onClick={() => removeItem(index)} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-times"></i>
                </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GallerySection;
