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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl p-3 sm:p-4 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-[#162C49]/20">
        {/* Compact Header */}
        <div className="mb-4 pb-3 border-b border-[#162C49]/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#162C49]">
                {type === 'borrow' ? 'Process Borrow' : 'Process Return'}
              </h3>
              <p className="text-xs text-[#162C49]/70 mt-1">
                {items.length} item{items.length !== 1 ? 's' : ''} • Review condition and add remarks
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              type === 'borrow' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {type === 'borrow' ? 'Borrow' : 'Return'}
            </div>
          </div>
        </div>

        {/* Compact Items List */}
        <div className="space-y-2 mb-4">
          {items.map((item, index) => {
            const checklistItem = checklist.find(c => c.itemId === item.id);
            return (
              <div key={item.id} className="border border-[#162C49]/10 rounded-lg p-2 sm:p-3 bg-[#162C49]/5">
                {/* Item Header - Compact */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-[#162C49]/20 text-[#162C49] text-xs font-bold rounded-full">
                        {index + 1}
                      </span>
                      <h4 className="font-medium text-[#162C49] text-sm truncate">
                        {item.article_type}
                      </h4>
                    </div>
                    <div className="ml-7 space-y-0.5">
                      <p className="text-xs text-[#162C49]">
                        <span className="font-medium">Property No.:</span> {item.property_no}
                      </p>
                      {item.qr_code && (
                        <p className="text-xs text-[#162C49]">
                          <span className="font-medium">QR Code:</span> {item.qr_code}
                        </p>
                      )}
                      {item.location && (
                        <p className="text-xs text-[#162C49]/70">Location: {item.location}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Compact Condition Selection */}
                  {!hideCondition && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="flex space-x-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`condition-${item.id}`}
                            value="Good"
                            checked={checklistItem?.condition === 'Good'}
                            onChange={() => handleConditionChange(item.id, 'Good')}
                            className="mr-1 w-3 h-3 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-xs text-[#162C49] font-medium">Good</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`condition-${item.id}`}
                            value="Bad"
                            checked={checklistItem?.condition === 'Bad'}
                            onChange={() => handleConditionChange(item.id, 'Bad')}
                            className="mr-1 w-3 h-3 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-xs text-[#162C49] font-medium">Bad</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Compact Remarks Section */}
                <div className="ml-7">
                  <textarea
                    value={checklistItem?.remarks || ''}
                    onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                    placeholder={`Remarks for ${type}...`}
                    className="w-full p-2 border border-[#162C49]/10 rounded text-xs text-[#162C49] resize-none focus:ring-1 focus:ring-[#162C49]/20 focus:border-[#162C49] transition-colors"
                    rows={1}
                  />
                </div>

                {/* Compact Condition Status */}
                {!hideCondition && checklistItem?.condition && (
                  <div className="ml-7 mt-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      checklistItem.condition === 'Good' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {checklistItem.condition}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Compact Action Buttons */}
        <div className="flex space-x-2 pt-3 border-t border-[#162C49]/10">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors font-medium text-sm ${
              type === 'borrow' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {type === 'borrow' ? 'Confirm Borrow' : 'Confirm Return'}
          </button>
        </div>
      </div>
    </div>
  );
} 