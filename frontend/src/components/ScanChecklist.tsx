"use client";
import { useState } from "react";

interface Item {
  id: number;
  property_no: string;
  article_type: string;
  specifications?: string;
  remarks?: string;
  qr_code?: string;
  location?: string;
  item_status?: string;
}

interface ChecklistItem {
  itemId: number;
  condition: 'Good' | 'Bad';
  remarks: string;
}

interface ScanChecklistProps {
  items: Item[];
  type: 'borrow' | 'return';
  onComplete: (checklist: ChecklistItem[]) => void;
  onCancel: () => void;
  hideCondition?: boolean;
}

export default function ScanChecklist({ items, type, onComplete, onCancel, hideCondition }: ScanChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    items.map(item => ({
      itemId: item.id,
      condition: 'Good' as const,
      remarks: item.remarks || ''
    }))
  );

  const handleConditionChange = (itemId: number, condition: 'Good' | 'Bad') => {
    setChecklist(prev => 
      prev.map(item => 
        item.itemId === itemId ? { ...item, condition } : item
      )
    );
  };

  const handleRemarksChange = (itemId: number, remarks: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.itemId === itemId ? { ...item, remarks } : item
      )
    );
  };

  const handleSubmit = () => {
    onComplete(checklist);
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black mb-2">
            {type === 'borrow' ? 'Process Borrow' : 'Process Return'} - Item Checklist
          </h3>
          <p className="text-sm text-black">
            Review each item and add remarks about its condition.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item) => {
            const checklistItem = checklist.find(c => c.itemId === item.id);
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-black">{item.article_type}</h4>
                    <p className="text-sm text-black">Property No: {item.property_no}</p>
                    {item.qr_code && (
                      <p className="text-sm text-black">QR Code: {item.qr_code}</p>
                    )}
                    {item.location && (
                      <p className="text-sm text-black">Location: {item.location}</p>
                    )}
                    {item.specifications && (
                      <p className="text-sm text-black">{item.specifications}</p>
                    )}
                  </div>
                  {!hideCondition && (
                  <div className="flex space-x-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`condition-${item.id}`}
                        value="Good"
                        checked={checklistItem?.condition === 'Good'}
                        onChange={() => handleConditionChange(item.id, 'Good')}
                        className="mr-2"
                      />
                      <span className="text-sm text-black">Good</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`condition-${item.id}`}
                        value="Bad"
                        checked={checklistItem?.condition === 'Bad'}
                        onChange={() => handleConditionChange(item.id, 'Bad')}
                        className="mr-2"
                      />
                      <span className="text-sm text-black">Bad</span>
                    </label>
                  </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Remarks:
                  </label>
                  <textarea
                    value={checklistItem?.remarks || ''}
                    onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                    placeholder="Add any remarks about the item's condition..."
                    className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            {type === 'borrow' ? 'Confirm Borrow' : 'Confirm Return'}
          </button>
        </div>
      </div>
    </div>
  );
} 