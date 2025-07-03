"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import AuthGuard from "../../components/AuthGuard";

interface BorrowRequest {
  id: number;
  user_id: number;
  item_ids: string;
  status: string;
  pickup_date: string;
  return_date: string;
  created_at: string;
  user_email?: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState<BorrowRequest[]>([]);
  const [approved, setApproved] = useState<BorrowRequest[]>([]);
  const [borrowed, setBorrowed] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      const [pendingRes, approvedRes, borrowedRes] = await Promise.all([
        fetch("http://localhost:5001/api/admin/pending", { headers }),
fetch("http://localhost:5001/api/admin/approved", { headers }),
fetch("http://localhost:5001/api/admin/borrowed", { headers })
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

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/admin/approve/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to approve request");
      
      fetchAllRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDecline = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/admin/decline/${id}`, {
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
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/admin/scan-borrow/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to scan borrow");
      
      fetchAllRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleScanReturn = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/admin/scan-return/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to scan return");
      
      fetchAllRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'borrowed': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-gray-100 text-black';
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
                    Scan to Borrow
                  </button>
                )}
                {type === 'borrowed' && (
                  <button
                    onClick={() => handleScanReturn(request.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                  >
                    Scan to Return
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AuthGuard requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
            <p className="text-black">Manage borrow requests and inventory</p>
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
                  { key: "borrowed", label: "Borrowed", count: borrowed.length }
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 