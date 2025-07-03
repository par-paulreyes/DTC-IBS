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
  const [summary, setSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get selected item from localStorage (from home page)
    const selectedItemStr = localStorage.getItem("selectedItem");
    if (selectedItemStr) {
      const item = JSON.parse(selectedItemStr);
      setSelectedItems([item]);
    }
  }, []);

  const handleRequest = async () => {
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

      const response = await fetch("http://localhost:5000/api/borrow", {
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
      localStorage.removeItem("selectedItem");
      
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

  const addMoreItems = () => {
    router.push("/");
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

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-black">Selected Items</h2>
              {selectedItems.length === 0 ? (
                <p className="text-black">No items selected</p>
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
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={addMoreItems}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add More Items
              </button>
            </div>

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
              onClick={() => setSummary(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors mb-4"
            >
              Proceed to Summary
            </button>

            {summary && (
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-semibold mb-3 text-black">Request Summary</h3>
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
            )}

            <button
              onClick={handleRequest}
              disabled={loading || !summary}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Request to Admin"}
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 