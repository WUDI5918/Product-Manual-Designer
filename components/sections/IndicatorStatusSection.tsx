
import React from 'react';
import { produce } from 'immer';
// FIX: Import missing section data type.
import { IndicatorStatusSectionData } from '../../constants';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from '../ui/Editable';
import ImageUploader from '../ui/ImageUploader';

interface IndicatorStatusSectionProps {
  data: IndicatorStatusSectionData;
  onUpdate: (data: Partial<IndicatorStatusSectionData>) => void;
  isEditable?: boolean;
}

const IndicatorStatusSection: React.FC<IndicatorStatusSectionProps> = ({ data, onUpdate, isEditable = true }) => {
  const allColors = ["bg-yellow-400", "bg-green-500", "bg-red-500", "bg-blue-500", "bg-gray-700", "bg-white border"];

  const handleHeaderChange = (colIndex: number, value: string) => {
    onUpdate(produce(data, draft => {
      draft.table.headers[colIndex] = value;
    }));
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    onUpdate(produce(data, draft => {
      draft.table.rows[rowIndex][colIndex] = value;
    }));
  };
  
  const handleColorChange = (rowIndex: number) => {
    if (!isEditable) return;
    const currentColor = data.table.colors[rowIndex];
    const currentIndex = allColors.indexOf(currentColor);
    const nextColor = allColors[(currentIndex + 1) % allColors.length];
    onUpdate(produce(data, draft => {
      draft.table.colors[rowIndex] = nextColor;
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <Editable value={data.title} onChange={value => onUpdate({ title: value })} isEditable={isEditable} />
      </h2>
       <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl mb-8">
            <ImageUploader 
                src={data.image}
                alt="Indicator status reference"
                onImageChange={base64 => onUpdate({ image: base64 })}
                className="w-full h-auto object-contain rounded-lg shadow-md"
                isEditable={isEditable}
            />
        </div>
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-yellow-500 text-white">
                        {data.table.headers.map((header, colIndex) => (
                            <th key={colIndex} className="border border-gray-300 p-3 font-semibold text-left">
                                <Editable value={header} onChange={value => handleHeaderChange(colIndex, value)} isEditable={isEditable} className="text-white"/>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="bg-white hover:bg-gray-50">
                            {row.map((cell, colIndex) => (
                                <td key={colIndex} className="border border-gray-200 p-3">
                                    {colIndex === 1 ? (
                                        <div className="flex justify-center items-center">
                                            <div 
                                                className={`w-6 h-6 rounded-full ${data.table.colors[rowIndex]} ${isEditable ? 'cursor-pointer' : ''}`}
                                                onClick={() => handleColorChange(rowIndex)}
                                            ></div>
                                        </div>
                                    ) : (
                                        <Editable value={cell} onChange={value => handleCellChange(rowIndex, colIndex, value)} isEditable={isEditable} />
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default IndicatorStatusSection;
