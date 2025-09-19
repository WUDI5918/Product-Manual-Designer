
import React from 'react';
// FIX: Import missing section data type.
import { InterfaceSpecSectionData, TableData } from '../../constants';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from '../ui/Editable';
import ImageUploader from '../ui/ImageUploader';
import EditableTable from '../ui/EditableTable';

interface InterfaceSpecSectionProps {
  data: InterfaceSpecSectionData;
  onUpdate: (data: Partial<InterfaceSpecSectionData>) => void;
  isEditable?: boolean;
}

const InterfaceSpecSection: React.FC<InterfaceSpecSectionProps> = ({ data, onUpdate, isEditable=true }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <Editable value={data.title} onChange={value => onUpdate({ title: value })} isEditable={isEditable} />
      </h2>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl mb-8">
            <ImageUploader 
                src={data.image}
                alt="Interface specification"
                onImageChange={base64 => onUpdate({ image: base64 })}
                className="w-full h-auto object-contain rounded-lg shadow-md"
                isEditable={isEditable}
            />
        </div>
        <div className="w-full">
            <EditableTable data={data.table} onUpdate={(tableData: TableData) => onUpdate({ table: tableData })} isEditable={isEditable} />
        </div>
      </div>
    </div>
  );
};

export default InterfaceSpecSection;
