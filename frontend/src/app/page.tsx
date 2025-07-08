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
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 flex-1">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-primaryBlue mb-2 tracking-tight drop-shadow-lg">Inventory Items</h1>
            <p className="text-lg text-primaryRed font-medium">Select items you want to borrow</p>
          </div>

          {error && (
            <div className="bg-primaryRed/10 border border-primaryRed text-primaryRed px-4 py-3 rounded-xl mb-6 shadow-md">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white/80 rounded-3xl shadow-xl p-8 mb-10 border-l-8 border-primaryRed">
            <h2 className="text-xl font-bold text-primaryBlue mb-6">Filters</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-primaryBlue mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primaryRed rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryRed/60 bg-white/60 text-primaryBlue font-medium transition"
                />
              </div>

              {/* Article Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-primaryBlue mb-2">Article Type</label>
                <select
                  value={articleTypeFilter}
                  onChange={(e) => setArticleTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primaryRed rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryRed/60 bg-white/60 text-primaryBlue font-medium transition"
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
                <label className="block text-sm font-semibold text-primaryBlue mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primaryRed rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryRed/60 bg-white/60 text-primaryBlue font-medium transition"
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
                  className="w-full px-4 py-2 bg-primaryRed text-white rounded-xl font-bold shadow-lg border-2 border-primaryRed hover:bg-primaryBlue hover:border-primaryBlue hover:scale-105 transition-all duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Selected Items Display */}
          {selectedItems.size > 0 && (
            <div className="bg-primaryBlue/10 border-l-8 border-primaryBlue rounded-3xl p-6 mb-8 shadow-xl">
              <h2 className="text-2xl font-bold text-primaryRed mb-4">Selected Items ({selectedItems.size})</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {getSelectedItems().map((item) => (
                  <div key={item.id} className="bg-white/90 rounded-2xl p-3 border-l-4 border-primaryBlue shadow-md flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-primaryBlue">{item.article_type}</h3>
                        <p className="text-xs text-primaryRed">Property No: {item.property_no}</p>
                      </div>
                      <button
                        onClick={() => handleItemToggle(item.id)}
                        className="text-primaryRed hover:text-primaryBlue text-xs font-bold px-2 py-1 rounded-lg bg-primaryRed/10 hover:bg-primaryBlue/10 border-2 border-primaryRed hover:border-primaryBlue transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-primaryBlue flex justify-end">
                <button
                  onClick={handleProceedToSchedule}
                  className="bg-primaryBlue text-white py-2 px-6 rounded-2xl font-bold shadow-xl border-2 border-primaryBlue hover:bg-primaryRed hover:border-primaryRed hover:scale-105 transition-all duration-200 text-base tracking-wide"
                >
                  Proceed to Schedule ({selectedItems.size} items)
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primaryRed"></div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white/90 rounded-3xl shadow-2xl p-5 hover:shadow-primaryRed/30 border-l-8 border-primaryRed transition-all duration-200 flex flex-col gap-1">
                  <div className="flex items-start gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="mt-1 h-4 w-4 accent-primaryRed focus:ring-primaryBlue border-primaryRed rounded-xl shadow-sm"
                      disabled={item.item_status !== 'Available'}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-primaryBlue mb-0.5">{item.article_type}</h3>
                          <p className="text-xs text-primaryRed">Property No: {item.property_no}</p>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold shadow-md border-2 transition-all duration-200
                          ${item.item_status === 'Available' ? 'bg-primaryBlue text-white border-primaryBlue' :
                            item.item_status === 'Borrowed' ? 'bg-primaryRed text-white border-primaryRed' :
                            item.item_status === 'To be Borrowed' ? 'bg-yellow-500 text-yellow-900 border-yellow-500' :
                            'bg-gray-100 text-gray-500 border-gray-300'}
                        `}>
                          {item.item_status || 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.specifications && (
                    <p className="text-xs text-primaryBlue/80 mb-1">{item.specifications}</p>
                  )}
                  {item.location && (
                    <p className="text-xs text-primaryRed/80 mb-1">Location: {item.location}</p>
                  )}
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-primaryRed">
                    <button
                      onClick={() => handleShowDetails(item)}
                      className="text-primaryBlue hover:text-primaryRed text-xs font-bold px-2 py-1 rounded-lg bg-primaryBlue/10 hover:bg-primaryRed/10 border-2 border-primaryBlue hover:border-primaryRed transition"
                    >
                      Show Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-primaryBlue text-xl font-bold">
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
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl border-l-8 border-primaryRed">
              <h2 className="text-2xl font-extrabold mb-6 text-primaryBlue">Item Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primaryRed">Article Type</label>
                  <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.article_type}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primaryRed">Property No</label>
                  <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.property_no}</p>
                </div>
                {selectedItemDetails.qr_code && (
                  <div>
                    <label className="block text-xs font-semibold text-primaryRed">QR Code</label>
                    <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.qr_code}</p>
                  </div>
                )}
                {selectedItemDetails.location && (
                  <div>
                    <label className="block text-xs font-semibold text-primaryRed">Location</label>
                    <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.location}</p>
                  </div>
                )}
                {selectedItemDetails.specifications && (
                  <div>
                    <label className="block text-xs font-semibold text-primaryRed">Specifications</label>
                    <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.specifications}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-primaryRed">Status</label>
                  <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.item_status || 'Available'}</p>
                </div>
                {selectedItemDetails.remarks && (
                  <div>
                    <label className="block text-xs font-semibold text-primaryRed">Remarks</label>
                    <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.remarks}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={closeDetailsModal}
                  className="px-6 py-2 bg-primaryBlue text-white rounded-xl font-bold shadow-lg border-2 border-primaryBlue hover:bg-primaryRed hover:border-primaryRed hover:scale-105 transition-all duration-200"
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
