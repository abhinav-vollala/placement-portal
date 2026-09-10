import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';

// ---- helpers ---------------------------------------------------------------

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Given the pixel-level crop rectangle returned by react-easy-crop, draw the
 *  cropped area onto an off-screen canvas and return it as a JPEG Blob. */
async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  // Cap the output size at 800px to keep upload sizes reasonable while
  // remaining sharp enough for an avatar displayed up to ~240px.
  const maxDim = 800;
  const scale = Math.min(maxDim / pixelCrop.width, maxDim / pixelCrop.height, 1);
  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92);
  });
}

// ---- component -------------------------------------------------------------

interface ImageCropModalProps {
  /** Object URL (or absolute URL) of the original image to crop. */
  imageSrc: string;
  /** Called with the final JPEG blob when the user clicks Save. */
  onCropComplete: (blob: Blob) => void;
  /** Called when the user cancels or closes the modal. */
  onClose: () => void;
}

export function ImageCropModal({ imageSrc, onCropComplete, onClose }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const lastCroppedAreaPixels = useRef<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );

  const handleCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
      lastCroppedAreaPixels.current = croppedAreaPixels;
    },
    [],
  );

  async function handleSave() {
    if (!lastCroppedAreaPixels.current) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, lastCroppedAreaPixels.current);
      onCropComplete(blob);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label="Crop profile photo"
    >
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:border dark:border-[#262e3d] dark:bg-[#151923] dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-[#262e3d]">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Crop Profile Photo</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-[#1a202c] dark:hover:text-slate-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Cropper area — fixed square with circular mask */}
        <div className="relative h-72 w-full bg-slate-900 sm:h-80">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-5 py-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-500 dark:bg-slate-700"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-[#262e3d]">
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
