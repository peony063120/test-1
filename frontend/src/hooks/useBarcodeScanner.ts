import { useCallback, useEffect, useRef, useState } from 'react';

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect(video: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
}

interface UseBarcodeScannerOptions {
  onDetected: (barcode: string) => void;
}

export const useBarcodeScanner = ({ onDetected }: UseBarcodeScannerOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const lastValueRef = useRef<string>('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current = null;
    lastValueRef.current = '';
    setCameraEnabled(false);
  }, []);

  const scanFrame = useCallback(async () => {
    if (!cameraEnabled || !videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    const BarcodeDetectorCtor = (window as Window & {
      BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike;
    }).BarcodeDetector;

    if (!BarcodeDetectorCtor) {
      return;
    }

    if (!detectorRef.current) {
      detectorRef.current = new BarcodeDetectorCtor({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code'] });
    }

    const detected = await detectorRef.current.detect(videoRef.current);
    const nextValue = detected[0]?.rawValue?.trim();
    if (!nextValue || nextValue === lastValueRef.current) {
      return;
    }

    lastValueRef.current = nextValue;
    onDetected(nextValue);
  }, [cameraEnabled, onDetected]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (scanTimerRef.current !== null) {
        window.clearInterval(scanTimerRef.current);
      }
      scanTimerRef.current = window.setInterval(() => {
        void scanFrame();
      }, 700);
      void scanFrame();
    } catch {
      setCameraError('Không thể mở camera. Hãy kiểm tra quyền truy cập camera của trình duyệt hoặc nhập barcode thủ công.');
      stopCamera();
    }
  }, [scanFrame, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    cameraEnabled,
    cameraError,
    startCamera,
    stopCamera,
  };
};
