
import React from 'react';
import { produce } from 'immer';
// FIX: Import missing section data type.
import { CaseStudySectionData } from '../../constants';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from '../ui/Editable';
import ImageUploader from '../ui/ImageUploader';

interface CaseStudySectionProps {
  data: CaseStudySectionData;
  onUpdate: (data: CaseStudySectionData) => void;
  isEditable?: boolean;
}

const CaseStudySection: React.FC<CaseStudySectionProps> = ({ data, onUpdate, isEditable = true }) => {

  const handleCaseChange = (index: number, field: 'title' | 'description' | 'image', value: string) => {
    onUpdate(produce(data, draft => {
      (draft.cases[index] as any)[field] = value;
    }));
  };

  const addCase = () => {
    onUpdate(produce(data, draft => {
      draft.cases.push({
        id: `case-${Date.now()}`,
        image: 'https://picsum.photos/seed/newCase/600/400',
        title: 'New Case Study',
        description: 'Detailed description of the new application case.'
      });
    }));
  };

  const removeCase = (index: number) => {
    onUpdate(produce(data, draft => {
      draft.cases.splice(index, 1);
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <Editable value={data.title} onChange={value => onUpdate({ ...data, title: value })} isEditable={isEditable} />
        </h2>
        {isEditable && (
          <button onClick={addCase} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
            <i className="fas fa-plus mr-2"></i>Add Case
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.cases.map((caseItem, index) => (
          <div key={caseItem.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden group relative">
            <ImageUploader
              src={caseItem.image}
              alt={caseItem.title}
              onImageChange={base64 => handleCaseChange(index, 'image', base64)}
              className="w-full h-64 object-cover"
              isEditable={isEditable}
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                <Editable value={caseItem.title} onChange={value => handleCaseChange(index, 'title', value)} isEditable={isEditable} />
              </h3>
              <p className="text-gray-600">
                <Editable value={caseItem.description} onChange={value => handleCaseChange(index, 'description', value)} isEditable={isEditable} />
              </p>
            </div>
            {isEditable && (
              <button onClick={() => removeCase(index)} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudySection;
