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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl p-3 sm:p-4 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-[#162C49]/20">
        {/* Compact Header */}
        <div className="mb-4 pb-3 border-b border-[#162C49]/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#162C49]">Approve Request</h3>
              <p className="text-xs text-[#162C49]/70 mt-1">
                {items.length} item{items.length !== 1 ? 's' : ''} to approve
              </p>
            </div>
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Approval
            </div>
          </div>
        </div>

        {/* Compact Items List */}
        <div className="space-y-2 mb-4">
          {items.map((item, index) => (
            <div key={item.id} className="border border-[#162C49]/10 rounded-lg p-2 sm:p-3 bg-[#162C49]/5">
              <div className="flex items-start space-x-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-[#162C49]/20 text-[#162C49] text-xs font-bold rounded-full flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#162C49] text-sm mb-1">{item.article_type}</h4>
                  <div className="space-y-0.5 text-xs text-[#162C49]">
                    <p><span className="font-medium">Property No.:</span> {item.property_no}</p>
                    {item.qr_code && (
                      <p>QR Code: {item.qr_code}</p>
                    )}
                    {item.location && (
                      <p>Location: {item.location}</p>
                    )}
                    {item.specifications && (
                      <p className="text-[#162C49]/70">{item.specifications}</p>
                    )}
                    {item.remarks && (
                      <p className="text-[#162C49]/70 italic">&ldquo;{item.remarks}&rdquo;</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            onClick={onConfirm}
            className="flex-1 bg-[#162C49] text-white py-2 px-3 rounded-lg hover:bg-[#0F1F35] transition-colors font-medium text-sm"
          >
            Confirm Approve
          </button>
        </div>
      </div>
    </div>
  );
} 