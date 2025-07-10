"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import AuthGuard from "../../components/AuthGuard";

interface Item {
  id: number;
  property_no: string;
  article_type: string;
  specifications?: string;
}

interface BorrowRequest {
  item_ids: number[];
  pickup_date: string;
  return_date: string;
}

export default function SchedulePage() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [currentStep, setCurrentStep] = useState<'dates' | 'summary' | 'request'>('dates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    // Get selected items from localStorage (from home page)
    const selectedItemsStr = localStorage.getItem("selectedItems");
    if (selectedItemsStr) {
      const items = JSON.parse(selectedItemsStr);
      setSelectedItems(items);
    }
  }, []);

  const handleRequest = async () => {
    if (loading) return; // Prevent duplicate submissions
    if (!pickupDate || !returnDate) {
      setError("Please select both pickup and return dates");
      return;
    }
    if (new Date(returnDate) < new Date(pickupDate)) {
      setError("Return date cannot be before pickup date");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const request: BorrowRequest = {
        item_ids: selectedItems.map(item => item.id),
        pickup_date: pickupDate,
        return_date: returnDate
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create borrow request");
      }

      setSuccess("Borrow request submitted successfully!");
      localStorage.removeItem("selectedItems");
      
      // Redirect to my borrow items after 2 seconds
      setTimeout(() => {
        router.push("/my-borrow-items");
      }, 2000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    const updated = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updated);
    localStorage.setItem("selectedItems", JSON.stringify(updated));
  };

  const handleNextToSummary = () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item to schedule.");
      return;
    }
    if (!pickupDate || !returnDate) {
      setError("Please select both pickup and return dates");
      return;
    }
    if (new Date(returnDate) < new Date(pickupDate)) {
      setError("Return date cannot be before pickup date");
      return;
    }
    setError("");
    setCurrentStep('summary');
  };

  const handleBackToDates = () => {
    setCurrentStep('dates');
  };

  const handleProceedToRequest = () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item to schedule.");
      return;
    }
    setCurrentStep('request');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
            <div className="bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-l-8 border-[#162C49] border-2 border-black">
              <div className="mb-6 sm:mb-8 flex flex-col items-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#162C49] mb-2 tracking-tight drop-shadow-lg text-center">Schedule Items</h1>
                <p className="text-base sm:text-lg font-semibold text-[#162C49] text-center">Select dates and submit your borrow request</p>
              </div>

              {/* Progress Steps */}
              <div className="mb-6 sm:mb-8 flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                {["Select Dates", "Review Summary", "Submit Request"].map((label, idx) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shadow-xl font-bold text-sm sm:text-lg transition-all duration-300
                      ${currentStep === (idx === 0 ? 'dates' : idx === 1 ? 'summary' : 'request')
                        ? 'bg-[#162C49] border-[#162C49] text-white scale-110' : 'bg-white border-[#162C49] text-[#162C49] opacity-60'}`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold text-center ${currentStep === (idx === 0 ? 'dates' : idx === 1 ? 'summary' : 'request') ? 'text-[#162C49]' : 'text-[#162C49] opacity-60'}`}>{label}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-[#162C49]/10 border-2 border-[#162C49] text-[#162C49] px-4 py-3 rounded-2xl mb-6 text-center shadow">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-[#162C49]/10 border-2 border-[#162C49] text-[#162C49] px-4 py-3 rounded-2xl mb-6 flex flex-col items-center shadow">
                  <span>{success} Redirecting to My Borrow Items...</span>
                  <button
                    onClick={() => router.push('/my-borrow-items')}
                    className="mt-4 bg-[#162C49] text-white px-6 py-2 rounded-2xl font-semibold shadow-xl border-2 border-[#162C49] hover:bg-[#0F1F35] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#162C49]/50"
                  >
                    Go to My Borrow Items Now
                  </button>
                </div>
              )}

              {/* Main Schedule Container */}
              <div className="relative rounded-2xl shadow-xl mb-8 border-2 border-[#162C49] bg-white/95 p-6">
                {/* Selected Items - Always Visible */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-[#162C49]">Selected Items</h2>
                  {selectedItems.length === 0 ? (
                    <>
                      <p className="text-[#162C49]">No items selected</p>
                      {(!pickupDate && !returnDate) && (
                        <p className="text-[#162C49] mt-2">No schedule set. Please select dates and items to create a schedule.</p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-[#162C49]/10 rounded-2xl border-2 border-[#162C49] shadow">
                          <div>
                            <h3 className="font-semibold text-[#162C49]">{item.article_type}</h3>
                            <p className="text-xs text-[#162C49]">Property No: {item.property_no}</p>
                            {item.specifications && (
                              <p className="text-xs text-[#162C49]">{item.specifications}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="ml-4 bg-[#162C49] text-white text-xs rounded-2xl px-4 py-2 border-2 border-[#162C49] shadow hover:bg-[#0F1F35] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#162C49]/50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
                      router.push("/");
                    }}
                    className="mt-4 bg-[#162C49] text-white text-sm px-5 py-2 rounded-2xl font-semibold border-2 border-[#162C49] shadow hover:bg-[#0F1F35] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#162C49]/50"
                  >
                    + Add More Items
                  </button>
                </div>

                {/* Step 1: Date Selection */}
                {currentStep === 'dates' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <label className="block text-sm font-semibold text-[#162C49] mb-2">
                          Pick-up Date
                        </label>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border-2 border-[#162C49]/30 rounded-2xl focus:ring-2 focus:ring-[#162C49] focus:border-[#162C49] bg-white/80 text-[#162C49] font-medium shadow"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#162C49] mb-2">
                          Return Date
                        </label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          min={pickupDate || new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border-2 border-[#162C49]/30 rounded-2xl focus:ring-2 focus:ring-[#162C49] focus:border-[#162C49] bg-white/80 text-[#162C49] font-medium shadow"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleNextToSummary}
                        className="bg-[#162C49] text-white py-3 px-12 rounded-2xl font-bold text-base shadow-xl border-2 border-[#162C49] hover:bg-[#0F1F35] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#162C49]/50"
                        disabled={selectedItems.length === 0}
                      >
                        Next
                      </button>
                    </div>
                    {selectedItems.length === 0 && (
                      <p className="text-[#162C49] mt-2 text-center">Please select at least one item to schedule.</p>
                    )}
                  </>
                )}

                {/* Step 2: Summary */}
                {currentStep === 'summary' && (
                  <>
                    <div className="bg-[#162C49]/5 p-8 rounded-2xl mb-8 border-2 border-[#162C49] shadow-xl">
                      <h3 className="font-bold mb-4 text-[#162C49] text-xl">Request Summary</h3>
                      <div className="space-y-3 text-[#162C49]">
                        <div className="flex justify-between">
                          <span className="font-semibold">Pick-up Date:</span>
                          <span>{pickupDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Return Date:</span>
                          <span>{returnDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Number of Items:</span>
                          <span>{selectedItems.length}</span>
                        </div>
                        <div className="border-t border-[#162C49]/20 pt-3">
                          <span className="font-semibold">Selected Items:</span>
                          <ul className="mt-2 space-y-1">
                            {selectedItems.map((item) => (
                              <li key={item.id} className="text-sm">• {item.article_type} ({item.property_no})</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleBackToDates}
                        className="flex-1 bg-[#162C49] text-white py-3 px-4 rounded-2xl font-semibold border-2 border-[#162C49] shadow-xl hover:bg-[#0F1F35] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#162C49]/50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleProceedToRequest}
                        className="flex-1 bg-[#162C49] text-white py-3 px-4 rounded-2xl font-semibold border-2 border-[#162C49] shadow-xl hover:bg-[#0F1F35] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#162C49]/50"
                        disabled={selectedItems.length === 0}
                      >
                        Proceed to Request
                      </button>
                    </div>
                    {selectedItems.length === 0 && (
                      <p className="text-[#162C49] mt-2 text-center">Please select at least one item to schedule.</p>
                    )}
                  </>
                )}

                {/* Step 3: Submit Request */}
                {currentStep === 'request' && (
                  <>
                    <div className="bg-[#162C49]/5 p-8 rounded-2xl mb-8 border-2 border-[#162C49] shadow-xl">
                      <h3 className="font-bold mb-4 text-[#162C49] text-xl">Ready to Submit</h3>
                      <p className="text-[#162C49] mb-4">Please review your request one final time before submitting to the admin.</p>
                      <div className="space-y-2 text-sm text-[#162C49]">
                        <div><strong>Pick-up Date:</strong> {pickupDate}</div>
                        <div><strong>Return Date:</strong> {returnDate}</div>
                        <div><strong>Items:</strong></div>
                        <ul className="ml-4">
                          {selectedItems.map((item) => (
                            <li key={item.id}>• {item.article_type} ({item.property_no})</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleBackToDates}
                        className="flex-1 bg-[#162C49] text-white py-3 px-4 rounded-2xl font-semibold border-2 border-[#162C49] shadow-xl hover:bg-[#0F1F35] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#162C49]/50"
                      >
                        Back to Dates
                      </button>
                      <button
                        onClick={handleRequest}
                        disabled={loading}
                        className="flex-1 bg-[#162C49] text-white py-3 px-4 rounded-2xl font-semibold border-2 border-[#162C49] shadow-xl hover:bg-[#0F1F35] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#162C49]/50 disabled:bg-[#162C49]/30 disabled:cursor-not-allowed"
                      >
                        {loading ? "Submitting..." : "Submit Request to Admin"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 