import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';

interface UseBarcodeScannerOptions {
  onDetected: (barcode: string) => void;
}

/** Check if native BarcodeDetector API is available (Chrome only) */
const hasNativeDetector = (): boolean =>
  typeof (window as any).BarcodeDetector === 'function';

export const useBarcodeScanner = ({ onDetected }: UseBarcodeScannerOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const nativeDetectorRef = useRef<any>(null);
  const scanTimerRef = useRef<number | null>(null);
  const lastValueRef = useRef<string>('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    zxingControlsRef.current?.stop();
    zxingControlsRef.current = null;
    nativeDetectorRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    lastValueRef.current = '';
    setCameraEnabled(false);
  }, []);

  /** Native BarcodeDetector scan (Chrome – fast, offline) */
  const scanNative = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    if (!nativeDetectorRef.current) {
      nativeDetectorRef.current = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code'],
      });
    }

    try {
      const detected = await nativeDetectorRef.current.detect(videoRef.current);
      const nextValue = detected[0]?.rawValue?.trim();
      if (nextValue && nextValue !== lastValueRef.current) {
        lastValueRef.current = nextValue;
        onDetected(nextValue);
      }
    } catch {
      // native detector error – silently ignore
    }
  }, [onDetected]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      stopCamera(); // ensure clean state

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Route 1: Native BarcodeDetector (Chrome, fast)
      if (hasNativeDetector()) {
        scanTimerRef.current = window.setInterval(() => {
          void scanNative();
        }, 600);
        void scanNative();
        return;
      }

      // Route 2: ZXing fallback (all browsers including Safari/iOS)
      const reader = new BrowserMultiFormatReader();
      zxingControlsRef.current = await reader.decodeFromVideoElement(
        videoRef.current!,
        (result, _err) => {
          if (!result) return;
          const nextValue = result.getText().trim();
          if (nextValue && nextValue !== lastValueRef.current) {
            lastValueRef.current = nextValue;
            onDetected(nextValue);
          }
        },
      );
    } catch {
      setCameraError(
        'Không thể mở camera. Hãy kiểm tra quyền truy cập camera của trình duyệt hoặc nhập barcode thủ công.',
      );
      stopCamera();
    }
  }, [scanNative, stopCamera, onDetected]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    cameraEnabled,
    cameraError,
    startCamera,
    stopCamera,
  };
};
