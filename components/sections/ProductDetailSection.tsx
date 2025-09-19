
import React from 'react';
// FIX: Import missing section data type.
import { ProductDetailSectionData, TableData } from '../../constants';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from '../ui/Editable';
import ImageUploader from '../ui/ImageUploader';
import EditableTable from '../ui/EditableTable';

interface ProductDetailSectionProps {
  data: ProductDetailSectionData;
  onUpdate: (data: Partial<ProductDetailSectionData>) => void;
  isEditable?: boolean;
}

const ProductDetailSection: React.FC<ProductDetailSectionProps> = ({ data, onUpdate, isEditable = true }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <Editable value={data.title} onChange={value => onUpdate({ title: value })} isEditable={isEditable}/>
      </h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
            <ImageUploader 
                src={data.image}
                alt="Product detail"
                onImageChange={base64 => onUpdate({ image: base64 })}
                className="w-full h-auto object-cover rounded-lg shadow-md"
                isEditable={isEditable}
            />
        </div>
        <div className="md:w-1/2 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-700">
                    <Editable value={data.productName} onChange={value => onUpdate({ productName: value })} isEditable={isEditable}/>
                </h3>
                <p className="mt-2 text-gray-600">
                    <Editable value={data.productDescription} onChange={value => onUpdate({ productDescription: value })} isEditable={isEditable}/>
                </p>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-700">Application Domain</h3>
                 <p className="mt-2 text-gray-600">
                    <Editable value={data.applicationDomain} onChange={value => onUpdate({ applicationDomain: value })} isEditable={isEditable}/>
                </p>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-700">Product Advantages</h3>
                <div className="mt-2 text-gray-600">
                    <Editable value={data.productAdvantages} onChange={value => onUpdate({ productAdvantages: value })} isEditable={isEditable} as="div"/>
                </div>
            </div>
        </div>
      </div>
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
            <Editable value={data.parametersTitle} onChange={value => onUpdate({ parametersTitle: value })} isEditable={isEditable}/>
        </h3>
        <EditableTable data={data.parametersTable} onUpdate={(tableData: TableData) => onUpdate({ parametersTable: tableData })} isEditable={isEditable}/>
      </div>
    </div>
  );
};

export default ProductDetailSection;
