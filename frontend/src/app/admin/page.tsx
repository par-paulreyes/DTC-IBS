"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import AuthGuard from "../../components/AuthGuard";
import ScanChecklist from "../../components/ScanChecklist";
import ApproveConfirmModal from "../../components/ApproveConfirmModal";

interface BorrowRequest {
  id: number;
  user_id: number;
  item_ids: string;
  status: string;
  pickup_date: string;
  return_date: string;
  created_at: string;
  user_email?: string;
  remarks?: string;
}

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

interface ChecklistItem {
  itemId: number;
  condition: 'Good' | 'Bad';
  remarks: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState<BorrowRequest[]>([]);
  const [approved, setApproved] = useState<BorrowRequest[]>([]);
  const [borrowed, setBorrowed] = useState<BorrowRequest[]>([]);
  const [logs, setLogs] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistData, setChecklistData] = useState<{ items: Item[]; type: 'borrow' | 'return'; requestId: number } | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveItems, setApproveItems] = useState<Item[]>([]);
  const [approveRequestId, setApproveRequestId] = useState<number | null>(null);
  const [editLog, setEditLog] = useState<BorrowRequest | null>(null);
  const [editFields, setEditFields] = useState({ status: '', pickup_date: '', return_date: '', remarks: '' });
  const [viewItems, setViewItems] = useState<{ logId: number, items: any[] } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAllRequests();
    fetchAllLogs();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      const [pendingRes, approvedRes, borrowedRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/pending`, { headers }),
        fetch(`${apiUrl}/api/admin/approved`, { headers }),
        fetch(`${apiUrl}/api/admin/borrowed`, { headers })
      ]);

      if (pendingRes.ok) setPending(await pendingRes.json());
      if (approvedRes.ok) setApproved(await approvedRes.json());
      if (borrowedRes.ok) setBorrowed(await borrowedRes.json());

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/admin/logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) setLogs(await response.json());
    } catch {}
  };

  const handleApprove = async (id: number) => {
    // Get items for this request
    const request = pending.find(r => r.id === id);
    if (!request) return;
    const itemIds = parseItemIds(request.item_ids);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/items/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ids: itemIds })
      });
      if (response.ok) {
        const requestItems = await response.json();
        setApproveItems(requestItems);
        setApproveRequestId(id);
        setShowApproveModal(true);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const confirmApprove = async () => {
    if (!approveRequestId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/admin/approve/${approveRequestId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to approve request");
      setShowApproveModal(false);
      setApproveRequestId(null);
      setApproveItems([]);
      fetchAllRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cancelApprove = () => {
    setShowApproveModal(false);
    setApproveRequestId(null);
    setApproveItems([]);
  };

  const handleDecline = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/admin/decline/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to decline request");
      
      fetchAllRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleScanBorrow = async (id: number) => {
    // Get items for this request
    const request = approved.find(r => r.id === id);
    if (!request) return;
    const itemIds = parseItemIds(request.item_ids);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/admin/scan-borrow/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const requestItems = await response.json();
        setChecklistData({ items: requestItems, type: 'borrow', requestId: id });
        setShowChecklist(true);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleScanReturn = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/admin/scan-return/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const requestItems = await response.json();
        setChecklistData({ items: requestItems, type: 'return', requestId: id });
        setShowChecklist(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To be Borrowed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'borrowed': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-gray-100 text-black';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-black';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const parseItemIds = (itemIds: string) => {
    try {
      return JSON.parse(itemIds);
    } catch {
      return [];
    }
  };

  const handleChecklistComplete = async (checklist: ChecklistItem[]) => {
    if (!checklistData) return;

    try {
      const token = localStorage.getItem("token");
      let endpoint: string;
      
      if (checklistData.type === 'borrow') {
        endpoint = `${apiUrl}/api/admin/scan-borrow/${checklistData.requestId}`;
      } else if (checklistData.type === 'return') {
        endpoint = `${apiUrl}/api/admin/scan-return/${checklistData.requestId}`;
      } else {
        throw new Error('Invalid checklist type');
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ checklist })
      });

      if (!response.ok) throw new Error(`Failed to ${checklistData.type} items`);
      
      setShowChecklist(false);
      setChecklistData(null);
      fetchAllRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChecklistCancel = () => {
    setShowChecklist(false);
    setChecklistData(null);
  };

  const renderTable = (requests: BorrowRequest[], type: string) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Items</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Pick-up</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Return</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {request.user_email || `User ${request.user_id}`}
              </td>
              <td className="px-6 py-4 text-sm text-black">
                {parseItemIds(request.item_ids).map((itemId: number, index: number) => (
                  <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 text-black">
                    #{itemId}
                  </span>
                ))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {formatDate(request.pickup_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {formatDate(request.return_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {type === 'pending' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {type === 'approved' && (
                  <button
                    onClick={() => handleScanBorrow(request.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Process Borrow
                  </button>
                )}
                {type === 'borrowed' && (
                  <button
                    onClick={() => handleScanReturn(request.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                  >
                    Process Return
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleDeleteLog = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/borrow/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) fetchAllLogs();
    } catch {}
  };

  const openEditModal = (log: BorrowRequest) => {
    setEditLog(log);
    setEditFields({
      status: log.status || '',
      pickup_date: log.pickup_date ? log.pickup_date.slice(0, 10) : '',
      return_date: log.return_date ? log.return_date.slice(0, 10) : '',
      remarks: log.remarks || ''
    });
  };

  const closeEditModal = () => setEditLog(null);

  const handleEditFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    if (!editLog) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/admin/logs/${editLog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(editFields)
      });
      if (response.ok) {
        fetchAllLogs();
        closeEditModal();
      }
    } catch {}
  };

  const handleViewItems = async (log: BorrowRequest) => {
    console.log('View Items button clicked for log:', log);
    try {
      const token = localStorage.getItem("token");
      const ids = parseItemIds(log.item_ids);
      console.log('Fetching items for IDs:', ids);
      const response = await fetch(`${apiUrl}/api/items/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ids })
      });
      if (response.ok) {
        const items = await response.json();
        console.log('Received items:', items);
        setViewItems({ logId: log.id, items });
      } else {
        console.error('Failed to fetch items:', response.status);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const closeViewItems = () => {
    console.log('Closing view items modal');
    setViewItems(null);
  };

  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: "pending", label: "Pending for Approval", count: pending.length },
                  { key: "approved", label: "Approved", count: approved.length },
                  { key: "borrowed", label: "Borrowed", count: borrowed.length },
                  { key: "logs", label: "All Logs", count: logs.length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      tab === key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-black hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {label}
                    <span className="ml-2 bg-gray-100 text-black py-0.5 px-2.5 rounded-full text-xs">
                      {count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {tab === "pending" && renderTable(pending, "pending")}
                  {tab === "approved" && renderTable(approved, "approved")}
                  {tab === "borrowed" && renderTable(borrowed, "borrowed")}
                  {tab === "logs" && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg shadow">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Pick-up</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Return</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{log.user_email || `User ${log.user_id}`}</td>
                              <td className="px-6 py-4 text-sm text-black">{parseItemIds(log.item_ids).map((itemId: number, index: number) => (<span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 text-black">#{itemId}</span>))}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{log.status}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{formatDate(log.pickup_date)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{formatDate(log.return_date)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-wrap gap-2">
                                  <button className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600" onClick={() => openEditModal(log)}>Edit</button>
                                  <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700" onClick={() => handleDeleteLog(log.id)}>Delete</button>
                                  <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700" onClick={() => handleViewItems(log)}>View Items</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {tab === "pending" && pending.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-black">No pending requests</p>
                    </div>
                  )}
                  {tab === "approved" && approved.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-black">No approved requests</p>
                    </div>
                  )}
                  {tab === "borrowed" && borrowed.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-black">No borrowed items</p>
                    </div>
                  )}
                  {tab === "logs" && logs.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-black">No logs found</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Approve Confirm Modal */}
        {showApproveModal && (
          <ApproveConfirmModal
            items={approveItems}
            onConfirm={confirmApprove}
            onCancel={cancelApprove}
          />
        )}

        {/* Scan Checklist for Approved Tab */}
        {showChecklist && checklistData && (
          <ScanChecklist
            items={checklistData.items}
            type={checklistData.type}
            onComplete={handleChecklistComplete}
            onCancel={handleChecklistCancel}
            hideCondition={checklistData.type === 'borrow'}
          />
        )}

        {/* Edit Modal */}
        {editLog && (
          <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Edit Log #{editLog.id}</h2>
              <div className="mb-2">
                <label className="block text-sm font-medium">Status</label>
                <select name="status" value={editFields.status} onChange={handleEditFieldChange} className="w-full border rounded px-2 py-1">
                  <option value="">Select status</option>
                  <option value="To be Borrowed">To be Borrowed</option>
                  <option value="approved">Approved</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="returned">Returned</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Pick-up Date</label>
                <input type="date" name="pickup_date" value={editFields.pickup_date} onChange={handleEditFieldChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Return Date</label>
                <input type="date" name="return_date" value={editFields.return_date} onChange={handleEditFieldChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Remarks</label>
                <textarea name="remarks" value={editFields.remarks} onChange={handleEditFieldChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeEditModal}>Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSaveEdit}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* View Items Modal */}
        {viewItems && (
          <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Items for Log #{viewItems.logId}</h2>
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Property No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Article Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">QR Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItems.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-black">{item.property_no}</td>
                      <td className="px-4 py-2 text-sm text-black">{item.article_type}</td>
                      <td className="px-4 py-2 text-sm text-black">{item.qr_code || '-'}</td>
                      <td className="px-4 py-2 text-sm text-black">{item.item_status}</td>
                      <td className="px-4 py-2 text-sm text-black">{item.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeViewItems}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 