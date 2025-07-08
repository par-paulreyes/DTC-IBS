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
    if (new Date(pickupDate) >= new Date(returnDate)) {
      setError("Return date must be after pickup date");
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

      const response = await fetch("http://localhost:5001/api/borrow", {
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

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    const updated = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updated);
    localStorage.setItem("selectedItems", JSON.stringify(updated));
  };

  const addMoreItems = () => {
    router.push("/");
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
    if (new Date(pickupDate) >= new Date(returnDate)) {
      setError("Return date must be after pickup date");
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Schedule Items</h1>
            <p className="text-black">Select dates and submit your borrow request</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${currentStep === 'dates' ? 'text-blue-600' : currentStep === 'summary' || currentStep === 'request' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'dates' ? 'border-blue-600 bg-blue-600 text-white' : currentStep === 'summary' || currentStep === 'request' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Select Dates</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep === 'summary' || currentStep === 'request' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${currentStep === 'summary' ? 'text-blue-600' : currentStep === 'request' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'summary' ? 'border-blue-600 bg-blue-600 text-white' : currentStep === 'request' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Review Summary</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep === 'request' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${currentStep === 'request' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'request' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-gray-300 text-gray-600'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Submit Request</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex flex-col items-center">
              <span>{success} Redirecting to My Borrow Items...</span>
              <button
                onClick={() => router.push('/my-borrow-items')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to My Borrow Items Now
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Selected Items - Always Visible */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-black">Selected Items</h2>
              {selectedItems.length === 0 ? (
                <>
                  <p className="text-black">No items selected</p>
                  {(!pickupDate && !returnDate) && (
                    <p className="text-gray-500 mt-2">No schedule set. Please select dates and items to create a schedule.</p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <h3 className="font-medium text-black">{item.article_type}</h3>
                        <p className="text-sm text-black">Property No: {item.property_no}</p>
                        {item.specifications && (
                          <p className="text-sm text-black">{item.specifications}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-4 text-red-600 hover:text-red-800 text-xs border border-red-200 rounded px-2 py-1"
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
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add More Items
              </button>
            </div>

            {/* Step 1: Date Selection */}
            {currentStep === 'dates' && (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Pick-up Date
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={pickupDate || new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  onClick={handleNextToSummary}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={selectedItems.length === 0}
                >
                  Next
                </button>
                {selectedItems.length === 0 && (
                  <p className="text-red-600 mt-2">Please select at least one item to schedule.</p>
                )}
              </>
            )}

            {/* Step 2: Summary */}
            {currentStep === 'summary' && (
              <>
                <div className="bg-blue-50 p-6 rounded-md mb-6">
                  <h3 className="font-semibold mb-4 text-black text-lg">Request Summary</h3>
                  <div className="space-y-3 text-black">
                    <div className="flex justify-between">
                      <span className="font-medium">Pick-up Date:</span>
                      <span>{pickupDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Return Date:</span>
                      <span>{returnDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Number of Items:</span>
                      <span>{selectedItems.length}</span>
                    </div>
                    <div className="border-t pt-3">
                      <span className="font-medium">Selected Items:</span>
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
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProceedToRequest}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={selectedItems.length === 0}
                  >
                    Proceed to Request
                  </button>
                </div>
                {selectedItems.length === 0 && (
                  <p className="text-red-600 mt-2">Please select at least one item to schedule.</p>
                )}
              </>
            )}

            {/* Step 3: Submit Request */}
            {currentStep === 'request' && (
              <>
                <div className="bg-green-50 p-6 rounded-md mb-6">
                  <h3 className="font-semibold mb-4 text-black text-lg">Ready to Submit</h3>
                  <p className="text-black mb-4">Please review your request one final time before submitting to the admin.</p>
                  <div className="space-y-2 text-sm text-black">
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
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Back to Dates
                  </button>
                  <button
                    onClick={handleRequest}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Request to Admin"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 