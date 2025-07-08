"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import AuthGuard from "../components/AuthGuard";

interface Item {
  id: number;
  property_no: string;
  article_type: string;
  specifications?: string;
  location?: string;
  status?: string;
  item_status?: string;
  qr_code?: string;
  remarks?: string;
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [articleTypeFilter, setArticleTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Load selectedItems from localStorage
    const selectedItemsStr = localStorage.getItem("selectedItems");
    let selectedSet = new Set<number>();
    if (selectedItemsStr) {
      try {
        const selectedArr = JSON.parse(selectedItemsStr);
        if (Array.isArray(selectedArr)) {
          selectedSet = new Set(selectedArr.map((item: any) => item.id));
        }
      } catch {}
    }
    setSelectedItems(selectedSet);

    const fetchItems = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/items`);
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        let data = await response.json();
        // Filter out items with item_status === 'Bad Condition' and only show electronics and utility
        data = data.filter((item: Item) => 
          item.item_status !== 'Bad Condition' && 
          (item.article_type.toLowerCase().includes('laptop') || 
           item.article_type.toLowerCase().includes('projector') || 
           item.article_type.toLowerCase().includes('tablet') || 
           item.article_type.toLowerCase().includes('camera') || 
           item.article_type.toLowerCase().includes('microphone') ||
           item.article_type.toLowerCase().includes('utility'))
        );
        setItems(data);
        setFilteredItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Apply filters whenever search term, article type filter, or status filter changes
  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.article_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.property_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.specifications && item.specifications.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply article type filter
    if (articleTypeFilter) {
      filtered = filtered.filter(item =>
        item.article_type.toLowerCase().includes(articleTypeFilter.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(item =>
        item.item_status === statusFilter
      );
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, articleTypeFilter, statusFilter]);

  const handleItemToggle = (itemId: number) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleProceedToSchedule = () => {
    // Store selected items in localStorage for the schedule page
    const selectedItemsData = items.filter(item => selectedItems.has(item.id));
    localStorage.setItem("selectedItems", JSON.stringify(selectedItemsData));
    router.push("/schedule");
  };

  const getSelectedItems = () => {
    return items.filter(item => selectedItems.has(item.id));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setArticleTypeFilter("");
    setStatusFilter("");
  };

  const handleShowDetails = async (item: Item) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/items/details", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ids: [item.id] })
      });
      if (response.ok) {
        const itemDetails = await response.json();
        if (itemDetails.length > 0) {
          setSelectedItemDetails(itemDetails[0]);
          setShowDetailsModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedItemDetails(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Inventory Items</h1>
            <p className="text-black">Select items you want to borrow</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-black mb-4">Filters</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Article Type Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Article Type</label>
                <select
                  value={articleTypeFilter}
                  onChange={(e) => setArticleTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="laptop">Laptop</option>
                  <option value="projector">Projector</option>
                  <option value="tablet">Tablet</option>
                  <option value="camera">Camera</option>
                  <option value="microphone">Microphone</option>
                  <option value="utility">Utility</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Borrowed">Borrowed</option>
                  <option value="To be Borrowed">To be Borrowed</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Selected Items Display */}
          {selectedItems.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-black mb-4">Selected Items ({selectedItems.size})</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {getSelectedItems().map((item) => (
                  <div key={item.id} className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-black">{item.article_type}</h3>
                        <p className="text-sm text-black">Property No: {item.property_no}</p>
                      </div>
                      <button
                        onClick={() => handleItemToggle(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <button
                  onClick={handleProceedToSchedule}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Proceed to Schedule ({selectedItems.size} items)
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={item.item_status !== 'Available'}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-black">{item.article_type}</h3>
                          <p className="text-sm text-black">Property No: {item.property_no}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.item_status === 'Available' ? 'bg-green-100 text-green-800' : 
                          item.item_status === 'Borrowed' ? 'bg-red-100 text-red-800' : 
                          item.item_status === 'To be Borrowed' ? 'bg-yellow-100 text-yellow-800' :
                          item.item_status === 'Bad Condition' ? 'bg-gray-400 text-black' :
                          'bg-gray-100 text-black'
                        }`}>
                          {item.item_status || 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {item.specifications && (
                    <p className="text-sm text-black mb-4">{item.specifications}</p>
                  )}
                  
                  {item.location && (
                    <p className="text-sm text-black mb-4">Location: {item.location}</p>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleShowDetails(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Show Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-black text-lg">
                {items.length === 0 
                  ? "No items available at the moment." 
                  : "No items match your current filters. Try adjusting your search criteria."
                }
              </p>
            </div>
          )}
        </div>

        {/* Item Details Modal */}
        {showDetailsModal && selectedItemDetails && (
          <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Item Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-black">Article Type</label>
                  <p className="text-sm text-black">{selectedItemDetails.article_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Property No</label>
                  <p className="text-sm text-black">{selectedItemDetails.property_no}</p>
                </div>
                {selectedItemDetails.qr_code && (
                  <div>
                    <label className="block text-sm font-medium text-black">QR Code</label>
                    <p className="text-sm text-black">{selectedItemDetails.qr_code}</p>
                  </div>
                )}
                {selectedItemDetails.location && (
                  <div>
                    <label className="block text-sm font-medium text-black">Location</label>
                    <p className="text-sm text-black">{selectedItemDetails.location}</p>
                  </div>
                )}
                {selectedItemDetails.specifications && (
                  <div>
                    <label className="block text-sm font-medium text-black">Specifications</label>
                    <p className="text-sm text-black">{selectedItemDetails.specifications}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-black">Status</label>
                  <p className="text-sm text-black">{selectedItemDetails.item_status || 'Available'}</p>
                </div>
                {selectedItemDetails.remarks && (
                  <div>
                    <label className="block text-sm font-medium text-black">Remarks</label>
                    <p className="text-sm text-black">{selectedItemDetails.remarks}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
    </AuthGuard>
  );
}
