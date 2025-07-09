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
            {/* Status Legend with Inventory Items */}
            <div className="bg-white/90 border-l-6 border-[#162C49] border-2 border-black rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-primaryBlue mb-2 tracking-tight drop-shadow-lg">Inventory Items</h1>
                  <p className="text-lg text-[#162C49] font-medium">Select items you want to borrow</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-[#162C49] mb-3">Status Legend</h3>
                                    <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                      <span className="text-xs text-gray-700">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-200 rounded-full"></span>
                      <span className="text-xs text-gray-700">To be Borrowed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#162C49] rounded-full"></span>
                      <span className="text-xs text-gray-700">Borrowed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-800 px-4 py-3 rounded-lg mb-6 shadow-md">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-10 border-l-6 border-[#162C49] border-2 border-black">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162C49]/60 focus:border-[#162C49] bg-white text-primaryBlue font-medium transition-all duration-300 hover:border-[#162C49]"
                />
              </div>

              {/* Article Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-primaryBlue mb-2">Article Type</label>
                <select
                  value={articleTypeFilter}
                  onChange={(e) => setArticleTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162C49]/60 focus:border-[#162C49] bg-white text-primaryBlue font-medium transition-all duration-300 hover:border-[#162C49]"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162C49]/60 focus:border-[#162C49] bg-white text-primaryBlue font-medium transition-all duration-300 hover:border-[#162C49]"
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
                  className="w-full px-5 py-2 bg-[#162C49] text-white !important rounded-lg font-semibold shadow-md border border-[#162C49] hover:bg-[#0F1F35] hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
                  style={{ color: 'white' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Selected Items Display */}
          {selectedItems.size > 0 && (
            <div className="bg-blue-50/80 border-l-6 border-[#162C49] border-2 border-black rounded-2xl p-6 mb-8 shadow-xl">
              <h2 className="text-2xl font-bold text-[#162C49] mb-4">Selected Items ({selectedItems.size})</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {getSelectedItems().map((item) => (
                  <div key={item.id} className="bg-white/95 rounded-2xl p-4 border-l-4 border-[#162C49] border-2 border-black shadow-xl flex flex-col gap-2 hover:translate-y-[-2px] hover:shadow-2xl transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-primaryBlue">{item.article_type}</h3>
                        <p className="text-xs text-[#162C49]">Property No: {item.property_no}</p>
                      </div>
                      <button
                        onClick={() => handleItemToggle(item.id)}
                        className="text-white !important text-xs font-semibold px-3 py-1 rounded-lg bg-[#162C49] hover:bg-[#0F1F35] border border-[#162C49] transition-all duration-300 ease-in-out cursor-pointer"
                        style={{ color: 'white' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#162C49] flex justify-end">
                <button
                  onClick={handleProceedToSchedule}
                  className="bg-[#162C49] text-white !important py-2 px-6 rounded-lg font-semibold shadow-md border border-[#162C49] hover:bg-[#0F1F35] hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer text-base tracking-wide"
                  style={{ color: 'white' }}
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
                <div key={item.id} className="bg-white/95 rounded-2xl shadow-xl p-5 hover:translate-y-[-2px] hover:shadow-2xl border-l-6 border-[#162C49] border-2 border-black transition-all duration-300 flex flex-col gap-2 group hover:scale-[1.01]">
                  <div className="flex items-start gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="mt-1 h-4 w-4 accent-[#162C49] focus:ring-[#162C49] border-[#162C49] rounded shadow-sm"
                      disabled={item.item_status !== 'Available'}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-primaryBlue mb-1 group-hover:text-[#162C49] transition-colors duration-300">{item.article_type}</h3>
                          <p className="text-xs text-[#162C49]">Property No: {item.property_no}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border transition-all duration-300
                          ${item.item_status === 'Available' ? 'bg-green-600 text-black border-green-600' :
                            item.item_status === 'Borrowed' ? 'bg-[#162C49] text-white border-[#162C49]' :
                            item.item_status === 'To be Borrowed' ? 'bg-yellow-200 text-black border-yellow-200' :
                            'bg-gray-300 text-gray-600 border-gray-300'}
                        `}>
                          {item.item_status || 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.specifications && (
                    <p className="text-xs text-primaryBlue/80 mb-1 bg-blue-50/50 p-2 rounded">{item.specifications}</p>
                  )}
                  {item.location && (
                    <p className="text-xs text-[#162C49]/80 mb-1 bg-blue-50/50 p-2 rounded">📍 Location: {item.location}</p>
                  )}
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#162C49]">
                    <button
                      onClick={() => handleShowDetails(item)}
                      className="text-[#162C49] !important text-xs font-semibold px-3 py-2 rounded-lg bg-transparent hover:bg-[#162C49] hover:!text-white border border-[#162C49] transition-all duration-300 ease-in-out cursor-pointer"
                      style={{ color: '#162C49' }}
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
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border-l-6 border-[#162C49] border-2 border-black">
              <h2 className="text-2xl font-extrabold mb-6 text-primaryBlue">Item Details</h2>
              <div className="space-y-4">
                <div className="bg-blue-50/30 p-3 rounded-lg">
                  <label className="block text-xs font-semibold text-[#162C49]">Article Type</label>
                  <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.article_type}</p>
                </div>
                <div className="bg-blue-50/30 p-3 rounded-lg">
                  <label className="block text-xs font-semibold text-[#162C49]">Property No</label>
                  <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.property_no}</p>
                </div>
                {selectedItemDetails.qr_code && (
                  <div className="bg-blue-50/30 p-3 rounded-lg">
                    <label className="block text-xs font-semibold text-[#162C49]">QR Code</label>
                    <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.qr_code}</p>
                  </div>
                )}
                {selectedItemDetails.location && (
                  <div className="bg-blue-50/30 p-3 rounded-lg">
                    <label className="block text-xs font-semibold text-[#162C49]">Location</label>
                    <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.location}</p>
                  </div>
                )}
                {selectedItemDetails.specifications && (
                  <div className="bg-blue-50/30 p-3 rounded-lg">
                    <label className="block text-xs font-semibold text-[#162C49]">Specifications</label>
                    <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.specifications}</p>
                  </div>
                )}
                <div className="bg-blue-50/30 p-3 rounded-lg">
                  <label className="block text-xs font-semibold text-[#162C49]">Status</label>
                  <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.item_status || 'Available'}</p>
                </div>
                {selectedItemDetails.remarks && (
                  <div className="bg-blue-50/30 p-3 rounded-lg">
                    <label className="block text-xs font-semibold text-[#162C49]">Remarks</label>
                    <p className="text-base text-primaryBlue font-bold">{selectedItemDetails.remarks}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={closeDetailsModal}
                  className="px-6 py-2 bg-[#162C49] text-white !important rounded-lg font-semibold shadow-md border border-[#162C49] hover:bg-[#0F1F35] hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
                  style={{ color: 'white' }}
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
