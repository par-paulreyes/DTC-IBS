"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import AuthGuard from "../../components/AuthGuard";

interface BorrowRequest {
  id: number;
  item_ids: string;
  status: string;
  pickup_date: string;
  return_date: string;
  created_at: string;
}

export default function MyBorrowItemsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/borrow`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch borrow requests");
      }

      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/borrow/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to cancel request");
      }

      // Refresh the list
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/borrow/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to delete request");
      }
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To be Borrowed':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'borrowed':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-gray-100 text-black';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-black';
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

  // Group and order requests
  const topRequests = [
    ...requests.filter(r => r.status === 'approved'),
    ...requests.filter(r => r.status === 'To be Borrowed')
  ];
  const otherRequests = requests.filter(r => r.status !== 'approved' && r.status !== 'To be Borrowed' && r.status !== 'returned');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">My Borrow Requests</h1>
            <p className="text-black">Track your item borrowing requests</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {topRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className="text-sm text-black">
                            Requested on {formatDate(request.created_at)}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Pick-up Date:</strong> {formatDate(request.pickup_date)}
                          </div>
                          <div>
                            <strong>Return Date:</strong> {formatDate(request.return_date)}
                          </div>
                        </div>
                        <div className="mt-3">
                          <strong>Items:</strong>
                          <div className="mt-1">
                            {parseItemIds(request.item_ids).map((itemId: number, index: number) => (
                              <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-2 mb-1 text-black">
                                Item #{itemId}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {request.status === 'To be Borrowed' && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors ml-4"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {otherRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className="text-sm text-black">
                            Requested on {formatDate(request.created_at)}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Pick-up Date:</strong> {formatDate(request.pickup_date)}
                          </div>
                          <div>
                            <strong>Return Date:</strong> {formatDate(request.return_date)}
                          </div>
                        </div>
                        <div className="mt-3">
                          <strong>Items:</strong>
                          <div className="mt-1">
                            {parseItemIds(request.item_ids).map((itemId: number, index: number) => (
                              <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-2 mb-1 text-black">
                                Item #{itemId}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {request.status === 'To be Borrowed' && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors ml-4"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Returned Items Section */}
              {requests.some(r => r.status === 'returned') && (
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-black mb-4">Returned Items</h2>
                  <div className="space-y-6">
                    {requests.filter(r => r.status === 'returned').map((request) => (
                      <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                              <span className="text-sm text-black">
                                Requested on {formatDate(request.created_at)}
                              </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Pick-up Date:</strong> {formatDate(request.pickup_date)}
                              </div>
                              <div>
                                <strong>Return Date:</strong> {formatDate(request.return_date)}
                              </div>
                            </div>
                            <div className="mt-3">
                              <strong>Items:</strong>
                              <div className="mt-1">
                                {parseItemIds(request.item_ids).map((itemId: number, index: number) => (
                                  <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-2 mb-1 text-black">
                                    Item #{itemId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 