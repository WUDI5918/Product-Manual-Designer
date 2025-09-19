
import React from 'react';
import { produce } from 'immer';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from './Editable';
// FIX: Imported TableData from constants.
import { TableData } from '../../constants';

// FIX: Removed local interface definition, now imported from constants.ts
/*
export interface TableData {
  headers: string[];
  rows: string[][];
  headerColor?: string;
}
*/

interface EditableTableProps {
  data: TableData;
  onUpdate: (data: TableData) => void;
  isEditable?: boolean;
}

const EditableTable: React.FC<EditableTableProps> = ({ data, onUpdate, isEditable=true }) => {

  const handleHeaderChange = (colIndex: number, value: string) => {
    onUpdate(produce(data, draft => {
      draft.headers[colIndex] = value;
    }));
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    onUpdate(produce(data, draft => {
      draft.rows[rowIndex][colIndex] = value;
    }));
  };

  const addRow = () => {
    onUpdate(produce(data, draft => {
      draft.rows.push(Array(data.headers.length).fill('New Cell'));
    }));
  };

  const deleteRow = () => {
    if (data.rows.length > 1) {
      onUpdate(produce(data, draft => {
        draft.rows.pop();
      }));
    }
  };

  const addColumn = () => {
    onUpdate(produce(data, draft => {
      draft.headers.push('New Header');
      draft.rows.forEach(row => row.push('New Cell'));
    }));
  };

  const deleteColumn = () => {
    if (data.headers.length > 1) {
      onUpdate(produce(data, draft => {
        draft.headers.pop();
        draft.rows.forEach(row => row.pop());
      }));
    }
  };
  
  const headerColors = ['bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-gray-700', 'bg-red-500'];
  const changeHeaderColor = () => {
      const currentColor = data.headerColor || headerColors[0];
      const currentIndex = headerColors.indexOf(currentColor);
      const nextColor = headerColors[(currentIndex + 1) % headerColors.length];
      onUpdate(produce(data, draft => {
          draft.headerColor = nextColor;
      }));
  };

  return (
    <div className="w-full">
      {isEditable && (
        <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-100 rounded-md">
          <button onClick={addRow} className="btn-table-control"><i className="fas fa-plus mr-1"></i>Row</button>
          <button onClick={deleteRow} className="btn-table-control"><i className="fas fa-minus mr-1"></i>Row</button>
          <button onClick={addColumn} className="btn-table-control"><i className="fas fa-plus mr-1"></i>Column</button>
          <button onClick={deleteColumn} className="btn-table-control"><i className="fas fa-minus mr-1"></i>Column</button>
          <button onClick={changeHeaderColor} className="btn-table-control"><i className="fas fa-palette mr-1"></i>Color</button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={`${data.headerColor || 'bg-yellow-500'} text-white`}>
              {data.headers.map((header, colIndex) => (
                <th key={colIndex} className="border border-gray-300 p-3 font-semibold text-left">
                  <Editable value={header} onChange={value => handleHeaderChange(colIndex, value)} as="div" isEditable={isEditable} className="text-white"/>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white hover:bg-gray-50">
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-gray-200 p-3">
                    <Editable value={cell} onChange={value => handleCellChange(rowIndex, colIndex, value)} isEditable={isEditable}/>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* FIX: Removed non-standard `jsx` prop from style tag. */}
       <style>{`
        .btn-table-control {
          background-color: #fff;
          border: 1px solid #ccc;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-table-control:hover {
          background-color: #f0f0f0;
          border-color: #aaa;
        }
      `}</style>
    </div>
  );
};

export default EditableTable;
