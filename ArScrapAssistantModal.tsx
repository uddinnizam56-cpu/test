import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Box,
  Camera,
  Sparkles,
  SwitchCamera,
  Layers,
  Plus,
  CheckCircle2,
  Ruler,
  RotateCw,
  Leaf,
  Globe,
  RefreshCw,
  Eye,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { ScrapItem, Language, ArScanAnalysis } from '../../types';

interface ArScrapAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ScrapItem[];
  presetItemId?: string | null;
  language: Language;
  onAddMeasuredToCart: (itemId: string, qty: number) => void;
  onAnalysisComplete?: (analysis: ArScanAnalysis) => void;
}

const DENSITY_KG_PER_LITER: Record<string, number> = {
  Metals: 0.35,
  Paper: 0.14,
  Plastics: 0.08,
  'E-Waste': 0.25,
  Glass: 0.45,
  Vehicles: 1.0,
};

const BIN_BADGE_MAP: Record<
  string,
  { label: string; accent: string; border: string; bg: string }
> = {
  Metals: {
    label: 'Amber Metal Recovery Crate',
    accent: 'text-amber-300',
    border: 'border-amber-400/60',
    bg: 'bg-amber-500/20',
  },
  Paper: {
    label: 'Emerald Dry Paper Bale',
    accent: 'text-emerald-300',
    border: 'border-emerald-400/60',
    bg: 'bg-emerald-500/20',
  },
  Plastics: {
    label: 'Sky Clean PET/HDPE Bin',
    accent: 'text-sky-300',
    border: 'border-sky-400/60',
    bg: 'bg-sky-500/20',
  },
  'E-Waste': {
    label: 'Purple Certified E-Waste Vault',
    accent: 'text-purple-300',
    border: 'border-purple-400/60',
    bg: 'bg-purple-500/20',
  },
  Glass: {
    label: 'Emerald Glass Sorting Crate',
    accent: 'text-emerald-300',
    border: 'border-emerald-400/60',
    bg: 'bg-emerald-500/20',
  },
};

export const ArScrapAssistantModal: React.FC<ArScrapAssistantModalProps> = ({
  isOpen,
  onClose,
  items,
  presetItemId,
  language,
  onAddMeasuredToCart,
  onAnalysisComplete,
}) => {
  const [arMode, setArMode] = useState<'camera' | 'studio'>('camera');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Selected target item for AR density & bin preview
  const [selectedItemId, setSelectedItemId] = useState<string>(
    presetItemId || items[0]?.id || 'copper'
  );

  // AR 3D Bounding Box dimensions (cm) & anchor position (% in viewport)
  const [widthCm, setWidthCm] = useState<number>(42);
  const [depthCm, setDepthCm] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(22);
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number }>({ x: 50, y: 54 });
  const [showBinHologram, setShowBinHologram] = useState<boolean>(true);
  const [studioRotationDeg, setStudioRotationDeg] = useState<number>(18);

  // AI + AR Scan state
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<ArScanAnalysis | null>(null);
  const [addedBanner, setAddedBanner] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    if (presetItemId && items.some((i) => i.id === presetItemId)) {
      setSelectedItemId(presetItemId);
    }
  }, [presetItemId, items]);

  const activeItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || items[0],
    [items, selectedItemId]
  );

  const liveMetrics = useMemo(() => {
    const volumeLiters = Math.max(
      1,
      Math.round((widthCm * depthCm * heightCm) / 1000)
    );
    const density = DENSITY_KG_PER_LITER[activeItem?.category || 'Metals'] || 0.2;
    const estimatedQty =
      activeItem?.unit === 'piece'
        ? 1
        : Math.max(1, Number((volumeLiters * density).toFixed(1)));
    const estimatedValue = Math.round(estimatedQty * (activeItem?.rate || 0));
    const co2Saved = Number((estimatedQty * (activeItem?.co2Offset || 1.5)).toFixed(1));
    return { volumeLiters, estimatedQty, estimatedValue, co2Saved };
  }, [widthCm, depthCm, heightCm, activeItem]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (desiredFacing = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API unavailable in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: desiredFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Switched to Interactive 3D AR Studio mode.'
          : 'No live camera detected. Using Interactive 3D AR Studio mode.'
      );
      setArMode('studio');
    }
  };

  useEffect(() => {
    if (isOpen && arMode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, arMode, facingMode]);

  useEffect(() => {
    if (!isOpen) {
      setAnalysis(null);
      setAddedBanner(null);
    }
  }, [isOpen]);

  // Reposition AR anchor reticle inside viewport
  const updateAnchorFromPointer = (clientX: number, clientY: number) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const xPct = Math.min(78, Math.max(22, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(76, Math.max(26, ((clientY - rect.top) / rect.height) * 100));
    setAnchorPos({ x: Math.round(xPct), y: Math.round(yPct) });
  };

  // Capture current AR viewport (live camera or 3D AR studio canvas) and send to Gemini Vision
  const handleRunArAiScan = async () => {
    setAnalyzing(true);
    setAddedBanner(null);

    let frameDataUrl: string | undefined;
    const canvas = captureCanvasRef.current || document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      if (arMode === 'camera' && cameraActive && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Render synthetic AR Studio scene snapshot for multimodal evaluation
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i <= 10; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 64, 240);
          ctx.lineTo(320 + (i - 5) * 90, 400);
          ctx.stroke();
        }
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`AR Target: ${activeItem?.name || 'Scrap Material'}`, 32, 48);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.strokeRect(210, 120, 220, 150);
      }
      frameDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    }

    try {
      const response = await fetch('/api/ar-analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameDataUrl,
          dimensionsCm: { width: widthCm, depth: depthCm, height: heightCm },
          selectedPresetId: selectedItemId,
          availableItems: items,
          language,
        }),
      });
      const json = await response.json();
      if (json.success && json.analysis) {
        setAnalysis(json.analysis);
        if (json.analysis.matchedItemId) {
          setSelectedItemId(json.analysis.matchedItemId);
        }
        onAnalysisComplete?.(json.analysis);
      }
    } catch (err) {
      console.error('AR scan failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddMeasured = () => {
    const targetId = analysis?.matchedItemId || activeItem?.id || 'copper';
    const qtyToAdd = Math.max(
      1,
      Math.round(analysis ? analysis.estimatedWeightKg : liveMetrics.estimatedQty)
    );
    onAddMeasuredToCart(targetId, qtyToAdd);
    const label = analysis?.materialName || activeItem?.name || 'Scrap Item';
    setAddedBanner(
      `Added ${qtyToAdd} ${activeItem?.unit || 'kg'} of ${label} to your pickup cart.`
    );
  };

  if (!isOpen) return null;

  const binStyle = BIN_BADGE_MAP[activeItem?.category || 'Metals'] || BIN_BADGE_MAP.Metals;

  // Dynamic visual scale of the AR 3D wireframe box in the HUD
  const boxWidthPx = Math.round(90 + (widthCm / 100) * 140);
  const boxHeightPx = Math.round(70 + (heightCm / 80) * 110);
  const depthOffsetPx = Math.round(14 + (depthCm / 100) * 28);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4">
        <canvas ref={captureCanvasRef} className="hidden" />

        {/* Top Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                <Box className="w-5 h-5 text-emerald-600" />
                <span>AR Spatial Scrap Scanner &amp; Bin Overlay</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Measure volume in 3D AR, preview sorting bins, and identify purity with Gemini AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close AR Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main 2-Column AR Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: AR Live Camera / 3D Spatial Viewport */}
          <div className="lg:col-span-7 p-4 sm:p-5 bg-slate-950 text-white flex flex-col justify-between gap-4">
            {/* Mode Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setArMode('camera')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    arMode === 'camera'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Camera AR</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setArMode('studio');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    arMode === 'studio'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D AR Studio</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBinHologram((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                    showBinHologram
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>AR Bin Overlay</span>
                </button>

                {arMode === 'camera' && (
                  <button
                    type="button"
                    onClick={() =>
                      setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))
                    }
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer"
                    title="Switch Camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {cameraError && (
              <div className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* AR Interactive Canvas Stage */}
            <div
              ref={viewportRef}
              onPointerDown={(e) => {
                isDraggingRef.current = true;
                updateAnchorFromPointer(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (isDraggingRef.current) {
                  updateAnchorFromPointer(e.clientX, e.clientY);
                }
              }}
              onPointerUp={() => {
                isDraggingRef.current = false;
              }}
              onPointerLeave={() => {
                isDraggingRef.current = false;
              }}
              className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-900 select-none cursor-crosshair"
            >
              {/* Video Feed OR 3D AR Simulated Room Grid */}
              {arMode === 'camera' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/60 overflow-hidden">
                  {/* 3D Perspective AR Floor Plane */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-56 opacity-45"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, rgba(52,211,153,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(52,211,153,0.35) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                      transform: `perspective(480px) rotateX(58deg) rotateZ(${studioRotationDeg - 18}deg) scale(1.35)`,
                      transformOrigin: 'center bottom',
                    }}
                  />
                  {/* Simulated Scrap Target Silhouette inside Studio */}
                  <div
                    className="absolute transition-transform duration-150 pointer-events-none"
                    style={{
                      left: `${anchorPos.x}%`,
                      top: `${anchorPos.y}%`,
                      transform: `translate(-50%, -50%) rotate(${studioRotationDeg - 18}deg)`,
                    }}
                  >
                    <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-emerald-500/30 to-amber-500/30 border border-white/25 backdrop-blur-xs flex flex-col items-center justify-center shadow-lg">
                      <Layers className="w-6 h-6 text-emerald-300" />
                      <span className="text-[10px] font-bold text-white mt-0.5 px-2 truncate max-w-24">
                        {activeItem?.category || 'Scrap'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* AR 3D Perspective Bounding Box Wireframe (SVG HUD) */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${anchorPos.x}%`,
                  top: `${anchorPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <svg
                  width={boxWidthPx + depthOffsetPx + 24}
                  height={boxHeightPx + depthOffsetPx + 24}
                  viewBox={`0 0 ${boxWidthPx + depthOffsetPx + 24} ${
                    boxHeightPx + depthOffsetPx + 24
                  }`}
                  className="overflow-visible drop-shadow-[0_0_8px_rgba(16,185,129,0.55)]"
                >
                  {/* Back face */}
                  <rect
                    x={12 + depthOffsetPx}
                    y={12}
                    width={boxWidthPx}
                    height={boxHeightPx}
                    fill="rgba(16, 185, 129, 0.08)"
                    stroke="rgba(52, 211, 153, 0.55)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Front face */}
                  <rect
                    x={12}
                    y={12 + depthOffsetPx}
                    width={boxWidthPx}
                    height={boxHeightPx}
                    fill="rgba(16, 185, 129, 0.12)"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                  {/* Perspective edge connectors */}
                  <line
                    x1={12}
                    y1={12 + depthOffsetPx}
                    x2={12 + depthOffsetPx}
                    y2={12}
                    stroke="#34d399"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={12 + boxWidthPx}
                    y1={12 + depthOffsetPx}
                    x2={12 + boxWidthPx + depthOffsetPx}
                    y2={12}
                    stroke="#34d399"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={12}
                    y1={12 + depthOffsetPx + boxHeightPx}
                    x2={12 + depthOffsetPx}
                    y2={12 + boxHeightPx}
                    stroke="#34d399"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={12 + boxWidthPx}
                    y1={12 + depthOffsetPx + boxHeightPx}
                    x2={12 + boxWidthPx + depthOffsetPx}
                    y2={12 + boxHeightPx}
                    stroke="#34d399"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Floating AR Dimension Tag */}
                <div className="mt-1 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-950/85 border border-emerald-400/50 text-[10px] font-mono font-bold text-emerald-300 tabular-nums">
                    {widthCm}×{depthCm}×{heightCm} cm · {liveMetrics.volumeLiters} L ·{' '}
                    {liveMetrics.estimatedQty} {activeItem?.unit || 'kg'}
                  </span>
                </div>
              </div>

              {/* Top-Left HUD Info */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700 text-[10px] font-semibold text-slate-200 backdrop-blur-xs">
                  Tap or drag anywhere to anchor AR bounding box
                </div>
                {analysis && (
                  <div className="px-2.5 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-400/60 text-[11px] text-emerald-100 backdrop-blur-xs max-w-xs">
                    <div className="font-extrabold text-emerald-300">
                      {analysis.materialName} · {Math.round(analysis.confidenceScore * 100)}% match
                    </div>
                    <div className="text-[10px] text-emerald-200/90">{analysis.purityGrade}</div>
                  </div>
                )}
              </div>

              {/* Top-Right AR Sorting Bin Hologram */}
              {showBinHologram && (
                <div
                  className={`absolute top-3 right-3 px-3 py-2 rounded-xl border backdrop-blur-xs pointer-events-none ${binStyle.bg} ${binStyle.border}`}
                >
                  <div className="text-[10px] font-bold text-slate-200">AR Target Bin</div>
                  <div className={`text-xs font-extrabold ${binStyle.accent}`}>
                    {analysis?.binLabel || binStyle.label}
                  </div>
                </div>
              )}

              {/* Bottom Studio Rotation Control */}
              {arMode === 'studio' && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-xs">
                  <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5 shrink-0">
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                    Grid Angle
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={36}
                    value={studioRotationDeg}
                    onChange={(e) => setStudioRotationDeg(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                    aria-label="Adjust AR grid angle"
                  />
                  <span className="text-[11px] font-mono text-emerald-300 tabular-nums shrink-0">
                    {studioRotationDeg - 18}°
                  </span>
                </div>
              )}
            </div>

            {/* Capture & AI Analyze CTA */}
            <button
              type="button"
              onClick={handleRunArAiScan}
              disabled={analyzing}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI Analyzing AR Frame &amp; Dimensions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Frame with Gemini AI + AR Measure</span>
                </>
              )}
            </button>
          </div>

          {/* Right: AR Calibrator Controls, Metrics & AI Identification */}
          <div className="lg:col-span-5 p-5 space-y-4 flex flex-col justify-between bg-white">
            <div className="space-y-4">
              {/* Material Density Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Material Profile (for AR Density Calibration)
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setAnalysis(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.category} · ₹{it.rate}/{it.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3D Bounding Box Sliders */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    AR Bounding Box Dimensions
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {liveMetrics.volumeLiters} L
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[11px] font-semibold text-slate-600">Width</span>
                    <input
                      type="range"
                      min={15}
                      max={100}
                      value={widthCm}
                      onChange={(e) => setWidthCm(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer"
                    />
                    <span className="w-12 text-right font-mono text-[11px] font-bold text-slate-800 tabular-nums">
                      {widthCm} cm
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[11px] font-semibold text-slate-600">Depth</span>
                    <input
                      type="range"
                      min={15}
                      max={100}
                      value={depthCm}
                      onChange={(e) => setDepthCm(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer"
                    />
                    <span className="w-12 text-right font-mono text-[11px] font-bold text-slate-800 tabular-nums">
                      {depthCm} cm
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[11px] font-semibold text-slate-600">Height</span>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer"
                    />
                    <span className="w-12 text-right font-mono text-[11px] font-bold text-slate-800 tabular-nums">
                      {heightCm} cm
                    </span>
                  </div>
                </div>
              </div>

              {/* Live AR Estimate Summary Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    Est. Quantity
                  </span>
                  <span className="text-base font-black text-slate-900 tabular-nums">
                    {analysis ? analysis.estimatedWeightKg : liveMetrics.estimatedQty}{' '}
                    {activeItem?.unit || 'kg'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                  <span className="text-[10px] font-semibold text-emerald-700 block">
                    Est. Payout
                  </span>
                  <span className="text-base font-black text-emerald-800 tabular-nums">
                    ₹
                    {analysis
                      ? Math.round(analysis.estimatedWeightKg * analysis.estimatedRatePerUnit)
                      : liveMetrics.estimatedValue}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    CO₂ Saved
                  </span>
                  <span className="text-base font-black text-teal-700 tabular-nums flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {analysis ? analysis.co2SavedTotalKg : liveMetrics.co2Saved} kg
                  </span>
                </div>
              </div>

              {/* AI + AR Scan Output Panel */}
              {analysis ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-950">
                      {analysis.aiPowered ? 'Gemini Vision + AR Match' : 'AR Spatial Estimate'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 tabular-nums">
                      Score {analysis.recyclabilityScore}/100
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        ಕನ್ನಡ: {analysis.kannadaName} · हिंदी: {analysis.hindiName}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-emerald-200/70">
                    {analysis.arCallouts.map((callout, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{callout}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  Adjust the 3D AR bounding box around your scrap pile and click{' '}
                  <strong className="text-slate-900">Scan Frame with Gemini AI</strong> to detect
                  material purity, localized Kannada/Hindi labels, and sorting bin placement.
                </div>
              )}

              {addedBanner && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{addedBanner}</span>
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAddMeasured}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="tabular-nums">
                  Add {Math.max(1, Math.round(analysis ? analysis.estimatedWeightKg : liveMetrics.estimatedQty))}{' '}
                  {activeItem?.unit || 'kg'} to Pickup Cart
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
