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
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/items");
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleProceed = (itemId: number) => {
    // Store selected item in localStorage for the schedule page
    localStorage.setItem("selectedItem", JSON.stringify(items.find(item => item.id === itemId)));
    router.push("/schedule");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Inventory Items</h1>
            <p className="text-black">Browse available items for borrowing</p>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black">{item.article_type}</h3>
                      <p className="text-sm text-black">Property No: {item.property_no}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Available' ? 'bg-green-100 text-green-800' : 
                      item.status === 'Borrowed' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-black'
                    }`}>
                      {item.status || 'Available'}
                    </span>
                  </div>
                  
                  {item.specifications && (
                    <p className="text-sm text-black mb-4">{item.specifications}</p>
                  )}
                  
                  {item.location && (
                    <p className="text-sm text-black mb-4">Location: {item.location}</p>
                  )}
                  
                  <button
                    onClick={() => handleProceed(item.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Schedule
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-black text-lg">No items available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
