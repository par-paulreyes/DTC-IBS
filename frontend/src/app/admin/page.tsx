"use client";
import { useState, useEffect, useCallback } from "react";
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
  const [viewItems, setViewItems] = useState<{ logId: number, items: Item[] } | null>(null);
  const [deleteLogId, setDeleteLogId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchAllRequests = useCallback(async () => {
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

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const fetchAllLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/admin/logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) setLogs(await response.json());
    } catch {}
  }, [apiUrl]);

  useEffect(() => {
    fetchAllRequests();
    fetchAllLogs();
  }, [fetchAllRequests, fetchAllLogs]);

  const handleApprove = async (id: number) => {
    // Get items for this request
    const request = pending.find(r => r.id === id);
    if (!request) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/items/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ids: parseItemIds(request.item_ids) })
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleScanBorrow = async (id: number) => {
    // Get items for this request
    const request = approved.find(r => r.id === id);
    if (!request) return;
    try {
      const token = localStorage.getItem("token");
      // First, get the items for this request
      const response = await fetch(`${apiUrl}/api/items/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ids: parseItemIds(request.item_ids) })
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
    // Get items for this request
    const request = borrowed.find(r => r.id === id);
    if (!request) return;
    try {
      const token = localStorage.getItem("token");
      // First, get the items for this request
      const response = await fetch(`${apiUrl}/api/items/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ids: parseItemIds(request.item_ids) })
      });
      if (response.ok) {
        const requestItems = await response.json();
        setChecklistData({ items: requestItems, type: 'return', requestId: id });
        setShowChecklist(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleChecklistCancel = () => {
    setShowChecklist(false);
    setChecklistData(null);
  };

  const handleDeleteLog = (id: number) => {
    setDeleteLogId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteLog = async () => {
    if (!deleteLogId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/borrow/${deleteLogId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) fetchAllLogs();
    } catch {}
    setShowDeleteModal(false);
    setDeleteLogId(null);
  };

  const cancelDeleteLog = () => {
    setShowDeleteModal(false);
    setDeleteLogId(null);
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

  // Mobile card component for requests
  const renderMobileCard = (request: BorrowRequest, type: string) => (
    <div key={request.id} className="bg-white rounded-xl shadow-md border border-[#162C49]/10 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-[#162C49] text-sm">
            {request.user_email || `User ${request.user_id}`}
          </h3>
          <p className="text-xs text-[#162C49]/70">ID: #{request.id}</p>
        </div>
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="font-medium text-[#162C49] w-16">Items:</span>
          <div className="flex flex-wrap gap-1">
            {parseItemIds(request.item_ids).map((itemId: number, index: number) => (
              <span key={index} className="inline-block bg-[#162C49]/10 rounded px-2 py-1 text-xs text-[#162C49]">
                #{itemId}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-[#162C49] w-16">Pick-up:</span>
          <span className="text-[#162C49]">{formatDate(request.pickup_date)}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-[#162C49] w-16">Return:</span>
          <span className="text-[#162C49]">{formatDate(request.return_date)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {type === 'pending' && (
          <>
            <button 
              className="bg-[#162C49] text-white px-3 py-2 rounded-lg text-xs hover:bg-[#0F1F35] transition-all duration-200 shadow flex-1" 
              onClick={() => handleApprove(request.id)}
            >
              Approve
            </button>
            <button 
              className="bg-[#C1121F] text-white px-3 py-2 rounded-lg text-xs hover:bg-[#a00e18] transition-all duration-200 shadow flex-1" 
              onClick={() => handleDecline(request.id)}
            >
              Decline
            </button>
          </>
        )}
        {type === 'approved' && (
          <button 
            className="bg-[#162C49] text-white px-3 py-2 rounded-lg text-xs hover:bg-[#0F1F35] transition-all duration-200 shadow w-full" 
            onClick={() => handleScanBorrow(request.id)}
          >
            Process Borrow
          </button>
        )}
        {type === 'borrowed' && (
          <button 
            className="bg-[#162C49] text-white px-3 py-2 rounded-lg text-xs hover:bg-[#0F1F35] transition-all duration-200 shadow w-full" 
            onClick={() => handleScanReturn(request.id)}
          >
            Process Return
          </button>
        )}
        {type === 'logs' && (
          <>
            <button 
              className="bg-orange-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-orange-600 transition-all duration-200 shadow flex-1" 
              onClick={() => openEditModal(request)}
            >
              Edit
            </button>
            <button 
              className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-700 transition-all duration-200 shadow flex-1" 
              onClick={() => handleDeleteLog(request.id)}
            >
              Delete
            </button>
            <button 
              className="bg-[#162C49] text-white px-3 py-2 rounded-lg text-xs hover:bg-[#0F1F35] transition-all duration-200 shadow w-full mt-2" 
              onClick={() => handleViewItems(request)}
            >
              View Items
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Desktop table component
  const renderDesktopTable = (requests: BorrowRequest[], type: string) => (
    <div className="w-full bg-white rounded-2xl shadow border-2 border-[#162C49]/10 overflow-x-auto" style={{ minHeight: '600px' }}>
      <table className="w-full min-w-[1100px]">
        <thead className="bg-[#162C49]/10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#162C49] uppercase tracking-wider" style={{ width: '20%' }}>User</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#162C49] uppercase tracking-wider" style={{ width: '15%' }}>Items</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#162C49] uppercase tracking-wider" style={{ width: '15%' }}>Pick-up</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#162C49] uppercase tracking-wider" style={{ width: '15%' }}>Return</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#162C49] uppercase tracking-wider" style={{ width: '15%' }}>Status</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#162C49] uppercase tracking-wider" style={{ width: '20%' }}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#162C49]/10">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-[#162C49]/5 whitespace-nowrap">
              <td className="px-4 py-4 text-sm text-[#162C49] whitespace-nowrap">
                <div className="flex items-center whitespace-nowrap">{request.user_email || `User ${request.user_id}`}</div>
              </td>
              <td className="px-4 py-4 text-sm text-[#162C49] whitespace-nowrap">
                <div className="flex flex-row gap-1 whitespace-nowrap">
                  {parseItemIds(request.item_ids).map((itemId: number, index: number) => (
                    <span key={index} className="inline-block bg-[#162C49]/10 rounded px-2 py-1 text-xs text-[#162C49] whitespace-nowrap">
                      #{itemId}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-[#162C49] whitespace-nowrap">
                <div className="whitespace-nowrap">{formatDate(request.pickup_date)}</div>
              </td>
              <td className="px-4 py-4 text-sm text-[#162C49] whitespace-nowrap">
                <div className="whitespace-nowrap">{formatDate(request.return_date)}</div>
              </td>
              <td className="px-4 py-4 text-sm text-[#162C49] whitespace-nowrap">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)} whitespace-nowrap`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                <div className="flex flex-row gap-1 whitespace-nowrap">
                  {type === 'pending' && (
                    <>
                      <button 
                        className="bg-[#162C49] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#0F1F35] transition-all duration-200 shadow whitespace-nowrap" 
                        onClick={() => handleApprove(request.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="bg-[#C1121F] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#a00e18] transition-all duration-200 shadow whitespace-nowrap" 
                        onClick={() => handleDecline(request.id)}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {type === 'approved' && (
                    <button 
                      className="bg-[#162C49] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#0F1F35] transition-all duration-200 shadow whitespace-nowrap" 
                      onClick={() => handleScanBorrow(request.id)}
                    >
                      Process Borrow
                    </button>
                  )}
                  {type === 'borrowed' && (
                    <button 
                      className="bg-[#162C49] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#0F1F35] transition-all duration-200 shadow whitespace-nowrap" 
                      onClick={() => handleScanReturn(request.id)}
                    >
                      Process Return
                    </button>
                  )}
                  {type === 'logs' && (
                    <>
                      <button 
                        className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-orange-600 transition-all duration-200 shadow whitespace-nowrap" 
                        onClick={() => openEditModal(request)}
                      >
                        Edit
                      </button>
                      <button 
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700 transition-all duration-200 shadow whitespace-nowrap" 
                        onClick={() => handleDeleteLog(request.id)}
                      >
                        Delete
                      </button>
                      <button 
                        className="bg-[#162C49] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#0F1F35] transition-all duration-200 shadow whitespace-nowrap" 
                        onClick={() => handleViewItems(request)}
                      >
                        View Items
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTable = (requests: BorrowRequest[], type: string) => (
    <>
      {/* Mobile view */}
      <div className="block lg:hidden">
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => renderMobileCard(request, type))}
          </div>
        ) : (
          renderEmptyState("No requests found")
        )}
      </div>
      
      {/* Desktop view */}
      <div className="hidden lg:block">
        {requests.length > 0 ? renderDesktopTable(requests, type) : renderEmptyState("No requests found")}
      </div>
    </>
  );

  const renderEmptyState = (message: string) => (
    <div className="w-full bg-white rounded-2xl shadow border-2 border-[#162C49]/10 flex items-center justify-center" style={{ minHeight: '600px' }}>
      <p className="text-[#162C49] text-lg font-semibold">{message}</p>
    </div>
  );

  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-[#e9ecf4] flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10 flex-1">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-[#162C49] mb-2 tracking-tight drop-shadow-lg">Admin Dashboard</h1>
          </div>

          {error && (
            <div className="bg-[#C1121F]/10 border-2 border-[#C1121F] text-[#C1121F] px-4 py-3 rounded-2xl mb-6 text-center shadow">
              {error}
            </div>
          )}

          <div className="bg-white/90 rounded-2xl shadow-xl border-l-8 border-[#162C49] border-2 border-black">
            <div className="border-b border-[#162C49]/20">
              {/* Mobile navigation */}
              <div className="block lg:hidden">
                <nav className="flex flex-col space-y-2 p-4">
                  {[
                    { key: "pending", label: "Pending for Approval", count: pending.length },
                    { key: "approved", label: "Approved", count: approved.length },
                    { key: "borrowed", label: "Borrowed", count: borrowed.length },
                    { key: "logs", label: "All Logs", count: logs.length }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 text-left
                        ${tab === key
                          ? "bg-[#162C49] text-white shadow-lg"
                          : "bg-[#162C49]/5 text-[#162C49] hover:bg-[#162C49]/10"}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <span>{label}</span>
                        <span className={`py-0.5 px-2 rounded-full text-xs font-bold ${
                          tab === key ? 'bg-white/20 text-white' : 'bg-[#162C49]/10 text-[#162C49]'
                        }`}>
                          {count}
                        </span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Desktop navigation */}
              <nav className="hidden lg:flex space-x-4 px-8 pt-6 overflow-x-auto">
                {[
                  { key: "pending", label: "Pending for Approval", count: pending.length },
                  { key: "approved", label: "Approved", count: approved.length },
                  { key: "borrowed", label: "Borrowed", count: borrowed.length },
                  { key: "logs", label: "All Logs", count: logs.length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`py-3 px-4 border-b-4 font-semibold text-sm transition-all duration-200 whitespace-nowrap
                      ${tab === key
                        ? "border-[#162C49] text-[#162C49] bg-[#162C49]/10 rounded-t-xl"
                        : "border-transparent text-[#162C49]/70 hover:text-[#162C49] hover:border-[#162C49]/40"}
                    `}
                  >
                    {label}
                    <span className="ml-2 bg-[#162C49]/10 text-[#162C49] py-0.5 px-2 rounded-full text-xs font-bold">
                      {count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-3 sm:p-4 lg:p-8">
              {loading ? (
                <div className="flex justify-center items-center" style={{ minHeight: '600px' }}>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#162C49]"></div>
                </div>
              ) : (
                <>
                  {tab === "pending" && renderTable(pending, "pending")}
                  {tab === "approved" && renderTable(approved, "approved")}
                  {tab === "borrowed" && renderTable(borrowed, "borrowed")}
                  {tab === "logs" && (logs.length > 0 ? renderTable(logs, "logs") : renderEmptyState("No logs found"))}
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
          />
        )}

        {/* Edit Modal */}
        {editLog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 sm:p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl p-3 sm:p-4 w-full max-w-sm shadow-2xl border border-[#162C49]/20 max-h-[85vh] overflow-y-auto">
              {/* Compact Header */}
              <div className="mb-4 pb-3 border-b border-[#162C49]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#162C49]">Edit Log #{editLog.id}</h2>
                    <p className="text-xs text-[#162C49]/70 mt-1">Update log details</p>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Edit
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#162C49] mb-1">Status</label>
                  <select 
                    name="status" 
                    value={editFields.status} 
                    onChange={handleEditFieldChange} 
                    className="w-full border border-[#162C49]/20 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#162C49]/20 focus:border-[#162C49]"
                  >
                    <option value="">Select status</option>
                    <option value="To be Borrowed">To be Borrowed</option>
                    <option value="approved">Approved</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="returned">Returned</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#162C49] mb-1">Pick-up Date</label>
                  <input 
                    type="date" 
                    name="pickup_date" 
                    value={editFields.pickup_date} 
                    onChange={handleEditFieldChange} 
                    className="w-full border border-[#162C49]/20 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#162C49]/20 focus:border-[#162C49]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#162C49] mb-1">Return Date</label>
                  <input 
                    type="date" 
                    name="return_date" 
                    value={editFields.return_date} 
                    onChange={handleEditFieldChange} 
                    className="w-full border border-[#162C49]/20 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#162C49]/20 focus:border-[#162C49]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#162C49] mb-1">Remarks</label>
                  <textarea 
                    name="remarks" 
                    value={editFields.remarks} 
                    onChange={handleEditFieldChange} 
                    className="w-full border border-[#162C49]/20 rounded-lg px-2 py-1.5 resize-none text-xs focus:ring-1 focus:ring-[#162C49]/20 focus:border-[#162C49]" 
                    rows={2} 
                    placeholder="Add remarks here..." 
                  />
                </div>
              </div>
              
              {/* Compact Action Buttons */}
              <div className="flex space-x-2 pt-3 border-t border-[#162C49]/10 mt-4">
                <button className="flex-1 px-3 py-2 bg-gray-300 rounded-lg text-[#162C49] font-medium hover:bg-gray-400 transition-colors text-xs" onClick={closeEditModal}>Cancel</button>
                <button className="flex-1 px-3 py-2 bg-[#162C49] text-white rounded-lg font-medium hover:bg-[#0F1F35] transition-colors text-xs" onClick={handleSaveEdit}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* View Items Modal */}
        {viewItems && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 sm:p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl p-3 sm:p-4 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-[#162C49]/20">
              {/* Compact Header */}
              <div className="mb-4 pb-3 border-b border-[#162C49]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#162C49]">Items for Log #{viewItems.logId}</h2>
                    <p className="text-xs text-[#162C49]/70 mt-1">
                      {viewItems.items.length} item{viewItems.items.length !== 1 ? 's' : ''} in this log
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-[#162C49]/10 text-[#162C49]">
                    View
                  </div>
                </div>
              </div>

              {/* Show remarks if present for this log */}
              {logs.find(l => l.id === viewItems.logId)?.remarks && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-xs">
                  <span className="font-medium">Remarks:</span> {logs.find(l => l.id === viewItems.logId)?.remarks}
                </div>
              )}
              
              {/* Compact Items List */}
              <div className="space-y-2 mb-4">
                {viewItems.items.map((item, index) => (
                  <div key={item.id} className="border border-[#162C49]/10 rounded-lg p-2 sm:p-3 bg-[#162C49]/5">
                    <div className="flex items-start space-x-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-[#162C49]/20 text-[#162C49] text-xs font-bold rounded-full flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-[#162C49] text-sm">{item.article_type}</h4>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            item.item_status === 'Available' ? 'bg-green-100 text-green-700' :
                            item.item_status === 'Borrowed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.item_status}
                          </span>
                        </div>
                                                 <div className="space-y-0.5 text-xs text-[#162C49]">
                           <p><span className="font-medium">Property No.:</span> {item.property_no}</p>
                           {item.qr_code && (
                             <p>QR Code: {item.qr_code}</p>
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
              
              {/* Compact Action Button */}
              <div className="flex justify-end pt-3 border-t border-[#162C49]/10">
                <button className="px-4 py-2 bg-gray-300 rounded-lg text-[#162C49] font-medium hover:bg-gray-400 transition-colors text-sm" onClick={closeViewItems}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 sm:p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl p-3 sm:p-4 w-full max-w-sm shadow-2xl border border-[#162C49]/20">
              {/* Compact Header */}
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-red-100 mb-3">
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-base sm:text-lg font-bold mb-1 text-[#162C49]">Confirm Delete</h2>
                <p className="text-xs text-[#162C49]/70">This action cannot be undone.</p>
              </div>
              
              {/* Compact Action Buttons */}
              <div className="flex space-x-2 pt-3 border-t border-[#162C49]/10">
                <button className="flex-1 px-3 py-2 bg-gray-300 rounded-lg text-[#162C49] font-medium hover:bg-gray-400 transition-colors text-xs" onClick={cancelDeleteLog}>Cancel</button>
                <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-xs" onClick={confirmDeleteLog}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}