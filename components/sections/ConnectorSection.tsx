
import React from 'react';
import { produce } from 'immer';
// FIX: Import missing section data type.
import { ConnectorSectionData, TableData } from '../../constants';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from '../ui/Editable';
import ImageUploader from '../ui/ImageUploader';
import EditableTable from '../ui/EditableTable';

interface ConnectorSectionProps {
  data: ConnectorSectionData;
  onUpdate: (data: Partial<ConnectorSectionData>) => void;
  isEditable?: boolean;
}

const ConnectorSection: React.FC<ConnectorSectionProps> = ({ data, onUpdate, isEditable = true }) => {
  const addListItem = () => {
    onUpdate(produce(data, draft => {
        draft.listItems.push('New list item.');
    }));
  };
  
  const handleListItemChange = (index: number, value: string) => {
      onUpdate(produce(data, draft => {
          draft.listItems[index] = value;
      }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        <Editable value={data.title} onChange={value => onUpdate({ title: value })} isEditable={isEditable} />
      </h2>
      <p className="text-gray-600 mb-6">
        <Editable value={data.description} onChange={value => onUpdate({ description: value })} isEditable={isEditable} />
      </p>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
             <ImageUploader 
                src={data.image}
                alt="Connector"
                onImageChange={base64 => onUpdate({ image: base64 })}
                className="w-full h-auto object-contain rounded-lg shadow-md"
                isEditable={isEditable}
            />
        </div>
        <div className="md:w-2/3">
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
                <p className="font-bold">NOTICE</p>
                <Editable value={data.notice} onChange={value => onUpdate({ notice: value })} isEditable={isEditable} />
            </div>
            
            <ul className="list-disc list-inside space-y-2 mb-4">
               {data.listItems.map((item, index) => (
                   <li key={index}>
                       <Editable value={item} onChange={value => handleListItemChange(index, value)} as="span" isEditable={isEditable}/>
                   </li>
               ))}
            </ul>
            {isEditable && (
                 <button onClick={addListItem} className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">
                    <i className="fas fa-plus mr-1"></i>Add List Item
                </button>
            )}
        </div>
      </div>
      
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          <Editable value={data.pinoutTitle} onChange={value => onUpdate({ pinoutTitle: value })} isEditable={isEditable}/>
        </h3>
        <EditableTable data={data.pinoutTable} onUpdate={(tableData: TableData) => onUpdate({ pinoutTable: tableData })} isEditable={isEditable} />
      </div>
    </div>
  );
};

export default ConnectorSection;
