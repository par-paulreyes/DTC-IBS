"use client";

interface Item {
  id: number;
  property_no: string;
  article_type: string;
  specifications?: string;
  qr_code?: string;
  location?: string;
  item_status?: string;
  remarks?: string;
}

interface ApproveConfirmModalProps {
  items: Item[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ApproveConfirmModal({ items, onConfirm, onCancel }: ApproveConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-transparent rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <h3 className="text-xl font-semibold text-black mb-4">Approve Request - Item List</h3>
        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
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
          ))}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Confirm Approve
          </button>
        </div>
      </div>
    </div>
  );
} 