"use client";
import { useState, useEffect, useCallback } from "react";
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
  const [itemDetails, setItemDetails] = useState<Record<number, { id: number; article_type: string }>>({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchRequests = useCallback(async () => {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const fetchItemDetails = useCallback(async (ids: number[]) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/items/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ids })
      });
      if (response.ok) {
        const details = await response.json();
        const detailsMap: Record<number, { id: number; article_type: string }> = {};
        details.forEach((item: { id: number; [key: string]: unknown }) => {
          detailsMap[item.id] = { id: item.id, article_type: item.article_type as string };
        });
        setItemDetails(detailsMap);
      }
    } catch {
      // Optionally handle error
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    // After requests are loaded, fetch all unique item details
    if (requests.length > 0) {
      const allItemIds = Array.from(new Set(requests.flatMap(r => parseItemIds(r.item_ids))));
      if (allItemIds.length > 0) {
        fetchItemDetails(allItemIds);
      }
    }
  }, [requests, fetchItemDetails]);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 flex-1 w-full">
          {/* Main Container with Legend */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="bg-white/90 border-l-6 border-[#162C49] border-2 border-black rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-2 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#162C49] mb-1 tracking-tight">My Borrow Items</h1>
                  <p className="text-base text-[#162C49] font-medium">Track your item borrowing requests</p>
                </div>
                {/* Legend */}
                <div className="lg:text-right">
                  <h3 className="text-lg font-semibold text-[#162C49] mb-2">Status Legend</h3>
                  <div className="flex flex-wrap gap-3 sm:gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                      <span className="text-sm text-gray-700 font-normal">Approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-200 rounded-full"></span>
                      <span className="text-sm text-gray-700 font-normal">Declined</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#162C49] rounded-full"></span>
                      <span className="text-sm text-gray-700 font-normal">Cancelled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-2xl mb-8 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#162C49] border-t-transparent"></div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: My Borrow Requests */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#162C49] mb-6">My Borrow Requests</h2>
                <div className="grid gap-8">
                  {topRequests
                    .map((request) => (
                      <div key={request.id} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-3 border-l-8 border-[#162C49] border-2 border-black hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                              <span className={`px-6 py-2 rounded-full text-sm font-bold shadow-lg border-2 transition-all duration-300
                                ${request.status === 'approved' ? 'bg-green-600 text-black border-green-600' :
                                  request.status === 'declined' ? 'bg-yellow-200 text-black border-yellow-200' :
                                  request.status === 'cancelled' ? 'bg-[#162C49] text-white border-[#162C49]' :
                                  request.status === 'To be Borrowed' ? 'bg-yellow-200 text-black border-yellow-200' :
                                  'bg-gray-100 text-black border-gray-100'}
                              `}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                              <span className="text-sm text-[#162C49] font-medium bg-blue-50 px-3 py-1 rounded-lg">
                                Requested on {formatDate(request.created_at)}
                              </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 text-sm mb-4">
                              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <div className="font-semibold text-[#162C49] mb-1">Pick-up Date</div>
                                <div className="text-[#162C49]">{formatDate(request.pickup_date)}</div>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <div className="font-semibold text-[#162C49] mb-1">Return Date</div>
                                <div className="text-[#162C49]">{formatDate(request.return_date)}</div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                              <div className="font-bold text-[#162C49] mb-3">Items</div>
                              <div className="flex flex-wrap gap-2">
                                {parseItemIds(request.item_ids).map((itemId: number, index: number) => (
                                  <span key={index} className="inline-block bg-white rounded-xl px-3 py-1 text-xs font-semibold text-[#162C49] border-2 border-[#162C49] shadow-md hover:shadow-lg transition-all duration-300">
                                    Item #{itemId} - {itemDetails[itemId]?.article_type || 'Loading...'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          {request.status === 'To be Borrowed' && (
                            <button
                              onClick={() => handleCancel(request.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-2xl font-bold text-xs border-2 border-red-600 shadow-xl hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 ml-4"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              {/* Right: Returned Items */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#162C49] mb-6">Returned Items</h2>
                <div className="grid gap-8">
                  {requests.filter(r => r.status === 'returned').map((request) => (
                    <div key={request.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-3 border-l-8 border-gray-400 border-2 border-gray-300 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <span className="px-6 py-2 rounded-full text-sm font-bold shadow-lg border-2 bg-gradient-to-r from-gray-300 to-gray-400 text-black border-gray-400">
                              Returned
                            </span>
                            <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-lg">
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6 text-sm mb-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <div className="font-bold text-gray-700 mb-1">Pick-up Date</div>
                              <div className="text-gray-600">{formatDate(request.pickup_date)}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <div className="font-bold text-gray-700 mb-1">Return Date</div>
                              <div className="text-gray-600">{formatDate(request.return_date)}</div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                            <div className="font-bold text-gray-700 mb-3">Items</div>
                            <div className="flex flex-wrap gap-2">
                              {parseItemIds(request.item_ids).map((itemId: number, index: number) => (
                                <span key={index} className="inline-block bg-white rounded-xl px-3 py-1 text-xs font-semibold text-gray-600 border-2 border-gray-300 shadow-md">
                                  Item #{itemId} - {itemDetails[itemId]?.article_type || 'Loading...'}
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
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 