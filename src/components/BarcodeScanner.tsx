import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Camera } from 'lucide-react';
import Quagga from '@ericblade/quagga2';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const { t } = useTranslation();
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        },
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          setError(t('barcode.camera_error', 'Could not access camera'));
          return;
        }
        Quagga.start();
      },
    );

    Quagga.onDetected((result) => {
      const code = result.codeResult?.code;
      if (code) {
        Quagga.stop();
        onScan(code);
      }
    });

    return () => {
      Quagga.stop();
    };
  }, [onScan, t]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold">{t('barcode.scan_title', 'Scan Barcode')}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={onClose} className="btn-primary text-sm">
              {t('common.close', 'Close')}
            </button>
          </div>
        ) : (
          <div ref={scannerRef} className="relative w-full aspect-[4/3] bg-black">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-white/50 rounded-lg" />
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 p-3">
          {t('barcode.instructions', 'Point camera at barcode')}
        </p>
      </div>
    </div>
  );
}
