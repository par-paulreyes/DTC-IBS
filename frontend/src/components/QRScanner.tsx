"use client";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  title?: string;
}

export default function QRScanner({ onScan, onClose, title = "Scan QR Code" }: QRScannerProps) {
  const scannerRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        
        if (!scannerRef.current) {
          scannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            false
          );

          scannerRef.current.render(
            (decodedText: string) => {
              setIsScanning(false);
              onScan(decodedText);
            },
            (error: any) => {
              // Handle scan error silently
            }
          );

          setIsScanning(true);
        }
      } catch (error) {
        console.error("Failed to load QR scanner:", error);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div id="qr-reader" className="w-full"></div>
        
        {isScanning && (
          <p className="text-center text-sm text-gray-600 mt-4">
            Point camera at QR code...
          </p>
        )}
      </div>
    </div>
  );
} 