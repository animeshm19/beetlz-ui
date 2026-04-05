import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Zap, 
  Activity, 
  RefreshCcw,
} from 'lucide-react';
import Plotly from 'plotly.js-dist-min';

// STYLES & ANIMATIONS
const SolarpunkStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');
    .font-tech { font-family: 'JetBrains Mono', monospace; }
    
    .solarpunk-grid { 
      background-size: 50px 50px; 
      background-image: linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px), 
                        linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 1px, transparent 1px); 
    }

    .glass-panel {
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
    }

    .text-shine {
      background: linear-gradient(120deg, #10b981 20%, #ffffff 40%, #ffffff 60%, #10b981 80%);
      background-size: 200% auto;
      color: transparent;
      -webkit-background-clip: text;
      animation: shine 4s linear infinite;
    }
    @keyframes shine { to { background-position: -200% center; } }

    .terminal-scroll::-webkit-scrollbar { width: 4px; }
    .terminal-scroll::-webkit-scrollbar-track { background: transparent; }
    .terminal-scroll::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 4px; }

    input[type=range].solarpunk-slider::-webkit-slider-thumb {
        width: 1.25rem; height: 1.25rem; border-radius: 9999px; background-color: #ffffff; box-shadow: 0 0 15px #ffffff; -webkit-appearance: none; appearance: none; cursor: pointer; border: 2px solid #10b981;
    }
  `}} />
);

// COMPONENT 1: Solarpunk Geometric Background
const SolarpunkGeometricBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 solarpunk-grid bg-[#020202]">
      <div className="absolute top-[5%] left-[5%] w-[60vw] h-[60vw] bg-[#064e3b]/20 rounded-full blur-[180px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute bottom-[5%] right-[5%] w-[55vw] h-[55vw] bg-[#047857]/10 rounded-full blur-[160px] mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_alternate_reverse]"></div>
    </div>
);

// COMPONENT 2: Dynamic Bounding Box Overlay Engine (Premium Fix)
const BoundingBoxOverlay = ({ apiData, imgDimensions }) => {
  const [hoveredBox, setHoveredBox] = useState(null);

  if (!apiData || !apiData.boxes || apiData.boxes.length === 0 || !imgDimensions || imgDimensions.w === 0) return null;

  return (
    <svg viewBox={`0 0 ${imgDimensions.w} ${imgDimensions.h}`} className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-auto">
      {apiData.boxes.map((box, i) => {
        const isHovered = hoveredBox === i;
        const label = apiData.labels[i] || "object";
        const score = apiData.scores[i] || 0;
        
        // Color dead/HD red, healthy green
        const isDamaged = label.toLowerCase().includes('hd') || label.toLowerCase().includes('dead') || label.toLowerCase().includes('damage');
        const boxColor = isDamaged ? '#ef4444' : '#10b981';

        const [x1, y1, x2, y2] = box;
        const width = x2 - x1;
        const height = y2 - y1;

        // --- PREMIUM LABEL MATH ---
        const fontSize = imgDimensions.h * 0.022; 
        const labelText = `[${label.toUpperCase()}] CONF: ${(score * 100).toFixed(1)}%`;
        
        const paddingX = imgDimensions.w * 0.01;
        const estimatedTextWidth = (labelText.length * (fontSize * 0.62)) + (paddingX * 2);
        const bgHeight = imgDimensions.h * 0.04;

        const labelX = Math.min(x1, imgDimensions.w - estimatedTextWidth);
        const labelY = Math.max(y1 - bgHeight - (imgDimensions.h * 0.01), 0);

        return (
          <g 
            key={i} 
            onMouseEnter={() => setHoveredBox(i)} 
            onMouseLeave={() => setHoveredBox(null)} 
            className="cursor-crosshair transition-all duration-300"
          >
            {/* Glowing shadow filter */}
            <defs>
              <filter id={`glow-${i}`}>
                <feDropShadow dx="0" dy="0" stdDeviation={imgDimensions.w * 0.003} floodColor={boxColor} floodOpacity="0.8"/>
              </filter>
            </defs>

            {/* Main Bounding Box */}
            <rect 
              x={x1} y={y1} width={width} height={height} 
              fill={isHovered ? `${boxColor}22` : "transparent"} 
              stroke={boxColor} 
              strokeWidth={isHovered ? imgDimensions.w * 0.004 : imgDimensions.w * 0.002} 
              filter={isHovered ? `url(#glow-${i})` : 'none'}
              className="transition-all duration-300"
            />
            
            {/* Corner Reticles */}
            <path d={`M ${x1},${y1+20} L ${x1},${y1} L ${x1+20},${y1}`} fill="none" stroke={boxColor} strokeWidth={imgDimensions.w * 0.006} />
            <path d={`M ${x2},${y2-20} L ${x2},${y2} L ${x2-20},${y2}`} fill="none" stroke={boxColor} strokeWidth={imgDimensions.w * 0.006} />

            {/* Premium Hover Tag */}
            {isHovered && (
              <g>
                <rect 
                  x={labelX} 
                  y={labelY} 
                  width={estimatedTextWidth} 
                  height={bgHeight} 
                  fill="rgba(10, 10, 10, 0.9)" 
                  stroke={boxColor}
                  strokeWidth={imgDimensions.w * 0.0015}
                  rx={imgDimensions.w * 0.004}
                  filter={`url(#glow-${i})`}
                />
                <text 
                  x={labelX + paddingX} 
                  y={labelY + (bgHeight * 0.72)} 
                  fill={boxColor} 
                  fontSize={fontSize} 
                  fontFamily="monospace" 
                  fontWeight="bold"
                  className="tracking-widest"
                >
                  [{label.toUpperCase()}] <tspan fill="#ffffff" fontWeight="normal">CONF: {(score * 100).toFixed(1)}%</tspan>
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// COMPONENT 4: Histogram Plot
const HistogramPlot = ({ file1, file2, title, chiSquareKey, label1, label2 }) => {
  const plotRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/${file1}`).then(r => r.json()),
      fetch(`/${file2}`).then(r => r.json()),
    ])
      .then(([data1, data2]) => {
        const bins1 = data1.bins;
        const binCenters1 = bins1.slice(0, -1).map((b, i) => 0.5 * (b + bins1[i + 1]));
        const bins2 = data2.bins;
        const binCenters2 = bins2.slice(0, -1).map((b, i) => 0.5 * (b + bins2[i + 1]));

        const chiSquareVal = data1[chiSquareKey];
        const fullTitle = chiSquareVal !== undefined
          ? `${title}. Chi Square: ${chiSquareVal}`
          : title;

        if (plotRef.current) {
          Plotly.newPlot(plotRef.current, [
            { x: binCenters1, y: data1.counts, type: 'bar', opacity: 0.5, name: label1, marker: { color: '#10b981' } },
            { x: binCenters2, y: data2.counts, type: 'bar', opacity: 0.6, name: label2, marker: { color: '#ef4444' } },
          ], {
            title: { text: fullTitle, font: { color: '#ffffff', family: 'JetBrains Mono, monospace', size: 13 } },
            xaxis: { title: 'Pixel Value', color: '#9ca3af', gridcolor: 'rgba(255,255,255,0.05)' },
            yaxis: { title: 'Normalized Count', color: '#9ca3af', gridcolor: 'rgba(255,255,255,0.05)' },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0.3)',
            font: { color: '#d1d5db', family: 'JetBrains Mono, monospace' },
            legend: { font: { color: '#d1d5db' } },
            barmode: 'overlay',
            margin: { t: 60, b: 50, l: 60, r: 20 },
          }, { responsive: true, displayModeBar: true });
        }
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });

    return () => { if (plotRef.current) Plotly.purge(plotRef.current); };
  }, [file1, file2, title, chiSquareKey, label1, label2]);

  if (error) return <div className="glass-panel p-4 text-red-400 text-xs">Error loading: {error}</div>;

  return (
    <div className="glass-panel p-4">
      {loading && <div className="flex items-center justify-center h-[500px]"><span className="text-gray-500 text-xs uppercase tracking-widest animate-pulse">Loading histogram...</span></div>}
      <div ref={plotRef} style={{ width: '100%', height: '500px', display: loading ? 'none' : 'block' }} />
    </div>
  );
};

// All histogram plot configurations
const HIST_PLOTS = [
  { file1: 'Spruce_Lidhem_HD_Hist.json', file2: 'Larch_HD_Hist.json', title: 'Spruce Lidhem HD vs Larch HD', chiSquareKey: 'chi_square__with_larchHD', label1: 'Spruce HD', label2: 'Larch HD' },
  { file1: 'Spruce_Lidhem_HD_Hist.json', file2: 'Larch_LD_Hist.json', title: 'Spruce Lidhem HD vs Larch LD', chiSquareKey: 'chi_square_with_larchLD', label1: 'Spruce HD', label2: 'Larch LD' },
  { file1: 'Spruce_Lidhem_HD_Hist.json', file2: 'Larch_H_Hist.json', title: 'Spruce Lidhem HD vs Larch Healthy', chiSquareKey: 'chi_square_with_larchHealthy', label1: 'Spruce HD', label2: 'Larch Healthy' },
  { file1: 'Spruce_Vikem_HD_Hist.json', file2: 'Larch_HD_Hist.json', title: 'Spruce Viken HD vs Larch HD', chiSquareKey: 'chi_square_with_larchHD', label1: 'Spruce HD', label2: 'Larch HD' },
  { file1: 'Spruce_Vikem_HD_Hist.json', file2: 'Larch_LD_Hist.json', title: 'Spruce Viken HD vs Larch LD', chiSquareKey: 'chi_square_with_larchLD', label1: 'Spruce HD', label2: 'Larch LD' },
  { file1: 'Spruce_Vikem_HD_Hist.json', file2: 'Larch_H_Hist.json', title: 'Spruce Viken HD vs Larch Healthy', chiSquareKey: 'chi_square_with_larchHealthy', label1: 'Spruce HD', label2: 'Larch Healthy' },
  { file1: 'Spruce_Backsjon_HD_Hist.json', file2: 'Larch_HD_Hist.json', title: 'Spruce Backsjon HD vs Larch HD', chiSquareKey: 'chi_square__with_larchHD', label1: 'Spruce HD', label2: 'Larch HD' },
  { file1: 'Spruce_Backsjon_HD_Hist.json', file2: 'Larch_LD_Hist.json', title: 'Spruce Backsjon HD vs Larch LD', chiSquareKey: 'chi_square_with_larchLD', label1: 'Spruce HD', label2: 'Larch LD' },
  { file1: 'Spruce_Backsjon_HD_Hist.json', file2: 'Larch_H_Hist.json', title: 'Spruce Backsjon HD vs Larch Healthy', chiSquareKey: 'chi_square_with_larchHealthy', label1: 'Spruce HD', label2: 'Larch Healthy' },
];

// ---------------------------------------------------------------------------
// MAIN APPLICATION
// ---------------------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [file, setFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });
  const [apiData, setApiData] = useState(null);
  const [status, setStatus] = useState('upload'); 
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setLocalPreviewUrl(null);
    setApiData(null);
    setStatus('upload');
  };

  const handleUpload = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setLocalPreviewUrl(url);
      
      const img = new Image();
      img.onload = () => {
        setImgDimensions({ w: img.width, h: img.height });
      };
      img.src = url;
      
      setStatus('preview');
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const runAnalysis = async () => {
    setStatus('processing');
    
    try {
      const base64String = await toBase64(file);
      
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64String })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }
      
      const data = await response.json();
      
      // Handle whichever output format the API returns
      let processedImageUrl = null;
      if (data.processed_image || data.image) {
        const base64Data = data.processed_image || data.image;
        processedImageUrl = base64Data.startsWith('data:') 
          ? base64Data 
          : `data:image/jpeg;base64,${base64Data}`;
      }

      setApiData({
        boxes: data.boxes || [],
        labels: data.labels || [],
        scores: data.scores || [],
        processedImage: processedImageUrl
      });
      
      setStatus('complete');
      
    } catch (err) {
      console.error("API FAILED:", err);
      alert(`API Connection Failed: ${err.message}.\n\nMake sure VITE_API_URL is set correctly and your backend is running.`);
      setStatus('preview');
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-tech selection:bg-[#10b981] selection:text-black overflow-x-hidden relative flex flex-col">
      <SolarpunkStyles />
      <SolarpunkGeometricBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 w-full flex-grow flex flex-col">
        
        {/* NAV HEADER */}
        <header className="flex justify-between items-center border-b border-white/10 pb-6 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Beetlz <span className="text-[#10b981]">Vision</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_5px_#10b981]" />
              <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Engine v3.5 // Dynamic CV Engine</span>
            </div>
          </div>
          
          <AnimatePresence>
            {status === 'complete' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
                <button onClick={reset} className="px-5 py-2.5 bg-white text-black hover:bg-[#10b981] hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 text-[10px] font-bold uppercase rounded-lg flex items-center gap-2">
                  <RefreshCcw size={14} /> Reset System
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* MAIN STAGE */}
        <main className="flex-grow flex flex-col justify-center w-full">
          
          <AnimatePresence mode="wait">
            
            {/* 1. UPLOAD STATE */}
            {status === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-2xl mx-auto w-full text-center">
                <div className="mb-12">
                  <h2 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl">Detect. Analyze. <span className="text-shine">Protect.</span></h2>
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-tech">Holographic Telemetry & OpenCV Dynamic Inference.</p>
                </div>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="h-72 glass-panel border-dashed border-2 border-white/10 hover:border-[#10b981]/50 hover:bg-[#10b981]/5 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all group flex flex-col items-center justify-center cursor-pointer"
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/jpeg,image/png,image/tiff" />
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="text-gray-400 group-hover:text-[#10b981]" size={32} />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Mount Aerial Feed</span>
                  <span className="text-[10px] text-gray-500 uppercase mt-2 tracking-widest">Connect to Dynamic Local CV Model</span>
                </div>
              </motion.div>
            )}

            {/* 2. PREVIEW STATE */}
            {status === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto w-full">
                <div className="glass-panel p-4 mb-8 h-[55vh] flex items-center justify-center overflow-hidden bg-black/80 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                  <img src={localPreviewUrl} className="max-w-full max-h-full rounded-lg opacity-80 shadow-2xl relative z-10" alt="Preview" />
                </div>
                <div className="flex justify-center">
                  <button onClick={runAnalysis} className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-full hover:bg-[#10b981] hover:text-white hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center gap-3">
                    <Zap fill="currentColor" size={18} /> Execute Inference Analysis
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. PROCESSING STATE */}
            {status === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-t-4 border-[#10b981] rounded-full animate-spin" />
                  <div className="absolute inset-2 border-r-4 border-white/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-[0.3em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Scanning Pixel Matrices</h2>
                <p className="text-[#10b981] text-xs mt-3 font-tech uppercase tracking-widest animate-pulse">Running Dynamic Computer Vision Algorithm...</p>
              </motion.div>
            )}

            {/* 4. COMPLETE STATE */}
            {status === 'complete' && (
              <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full pb-8">
                
                  {/* MAIN RENDER WINDOW */}
                  <div className="w-full h-[70vh] glass-panel p-4 relative overflow-hidden group border-l-4 border-l-[#10b981]">
                      <div className="absolute top-6 left-6 z-40 px-4 py-1.5 bg-black/90 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 shadow-lg">
                        <Activity className="text-[#10b981] animate-pulse" size={14} /> Live Spatial Detections
                      </div>
                      
                      <div className="relative w-full h-full bg-[#050505] rounded-xl overflow-hidden flex items-center justify-center">
                         {/* Shows annotated image from API, falls back to original with SVG overlay */}
                         <div className="relative inline-block max-w-full max-h-full">
                            <img 
                              src={apiData?.processedImage ? apiData.processedImage : localPreviewUrl} 
                              className="max-w-full max-h-full object-contain block opacity-80" 
                              alt="Analyzed Feed" 
                            />
                            {/* Only renders SVG boxes when no processed image returned */}
                            {!apiData?.processedImage && (
                              <BoundingBoxOverlay apiData={apiData} imgDimensions={imgDimensions} />
                            )}
                         </div>
                      </div>
                  </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ===== SECTIONS BELOW HERO ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pb-16">

        {/* ===== 1. DESCRIPTIVE ANALYSIS ===== */}
        <section className="py-16 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-tech text-[#10b981] px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 uppercase tracking-widest">01</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Descriptive <span className="text-[#10b981]">Analysis</span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-8 ml-14">What does the data look like?</p>

          {/* Data Augmentation */}
          <div className="glass-panel p-6 border-l-4 border-l-[#10b981] mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-4">Data Augmentations Applied</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                <p className="text-xs text-white font-bold mb-1">Flip</p>
                <p className="text-xs text-gray-400">Horizontal and vertical (free win)</p>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                <p className="text-xs text-white font-bold mb-1">Rotation</p>
                <p className="text-xs text-gray-400">&plusmn;90&deg;, &plusmn;180&deg; (safe for aerial imagery)</p>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                <p className="text-xs text-white font-bold mb-1">Color Jitter</p>
                <p className="text-xs text-gray-400">Brightness and contrast only (mild ranges)</p>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                <p className="text-xs text-white font-bold mb-1">HD-Centric Crop & Resize</p>
                <p className="text-xs text-gray-400">Crop HD box + padding, resize, and use as a new training sample</p>
              </div>
            </div>
          </div>

          {/* Baseline Results */}
          <div className="glass-panel p-6 border-l-4 border-l-white/50 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">Baseline Results (Spruce-Only Training)</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">The baseline models were trained and tested exclusively on Spruce data to establish a performance ceiling before attempting cross-species transfer.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Model</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Test F2 Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-bold text-white">YOLO</td>
                    <td className="py-3 px-4 text-yellow-400 font-bold">0.75</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">ResNet + RetinaNet</td>
                    <td className="py-3 px-4 text-[#10b981] font-bold">0.86</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pixel Distribution Histograms */}
          <div className="mb-6">
            <div className="glass-panel p-6 border-l-4 border-l-[#10b981] mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-2">Pixel Intensity Distributions</h3>
              <p className="text-xs text-gray-400 leading-relaxed">These histograms compare the pixel intensity distributions between Spruce (damaged) and Larch samples at different damage levels. The overlap (or lack thereof) between distributions reveals how visually similar or different the damage signatures are across tree species &mdash; a key factor in whether transfer learning can succeed.</p>
            </div>

            <div className="mb-10">
              <h4 className="text-base font-bold text-white mb-4 border-b border-white/10 pb-2">Spruce Lidhem HD</h4>
              <div className="flex flex-col gap-6">
                {HIST_PLOTS.slice(0, 3).map((p, i) => (
                  <HistogramPlot key={i} {...p} />
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-base font-bold text-white mb-4 border-b border-white/10 pb-2">Spruce Viken HD</h4>
              <div className="flex flex-col gap-6">
                {HIST_PLOTS.slice(3, 6).map((p, i) => (
                  <HistogramPlot key={i} {...p} />
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-base font-bold text-white mb-4 border-b border-white/10 pb-2">Spruce Backsjon HD</h4>
              <div className="flex flex-col gap-6">
                {HIST_PLOTS.slice(6, 9).map((p, i) => (
                  <HistogramPlot key={i} {...p} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== 2. DIAGNOSTIC ANALYSIS ===== */}
        <section className="py-16 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-tech text-[#10b981] px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 uppercase tracking-widest">02</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Diagnostic <span className="text-[#10b981]">Analysis</span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-8 ml-14">Why do the models perform the way they do?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-panel p-6 border-l-4 border-l-[#10b981]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-3">Why RetinaNet Outperforms YOLO</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white font-bold mb-1">Loss Function Handling</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    RetinaNet uses focal loss with specific gamma and alpha values to tackle the huge class imbalance in the dataset. In contrast, YOLO automatically adjusts these values, which can lead to sub-optimal results for this specific task.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white font-bold mb-1">Anchor Mechanisms</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    RetinaNet is an anchor-based model, whereas YOLO is an anchor-free model. YOLO's anchor-free architecture limits how many target labels it can detect within each divided grid of the original image.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 border-l-4 border-l-white/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-3">Why Zero-Shot Transfer Failed</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white font-bold mb-1">Domain Shift</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    The chi-square tests in the histograms above quantify the statistical distance between Spruce and Larch pixel distributions. Higher chi-square values indicate greater visual dissimilarity between species, explaining why a model trained solely on Larch scored only 0.08 F2 on Spruce without fine-tuning.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white font-bold mb-1">Species-Specific Damage Signatures</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Bark beetle damage manifests differently across tree species in aerial imagery. The pixel intensity patterns of heavily damaged (HD), lightly damaged (LD), and healthy trees vary between Larch and Spruce, requiring the model to adapt its learned features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 3. PREDICTIVE / PRESCRIPTIVE ANALYSIS ===== */}
        <section className="py-16 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-tech text-[#10b981] px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 uppercase tracking-widest">03</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Predictive & Prescriptive <span className="text-[#10b981]">Analysis</span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-8 ml-14">What do the results tell us, and what should be done?</p>

          {/* Transfer Learning Performance Table */}
          <div className="glass-panel p-6 border-l-4 border-l-[#10b981] mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-4">Transfer Learning Performance (Larch &rarr; Spruce)</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">The main model was trained on Larch data (Phase 1), then fine-tuned on Spruce (Phase 2), and tested on Spruce to measure transfer learning effectiveness.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Training Phase</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Epochs</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Early Stopping</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Larch (Test F2)</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Spruce (Test F2)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-bold text-white">Phase 1 &mdash; Train on Larch</td>
                    <td className="py-3 px-4 text-gray-300">50</td>
                    <td className="py-3 px-4 text-gray-300">15</td>
                    <td className="py-3 px-4 text-[#10b981] font-bold">0.6632</td>
                    <td className="py-3 px-4 text-red-400 font-bold">0.0820</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Phase 2 &mdash; Fine-tune on Spruce</td>
                    <td className="py-3 px-4 text-gray-300">20</td>
                    <td className="py-3 px-4 text-gray-300">10</td>
                    <td className="py-3 px-4 text-gray-500">&mdash;</td>
                    <td className="py-3 px-4 text-[#10b981] font-bold">0.8100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Findings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel p-6 border-t-4 border-t-red-400 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Zero-Shot Transfer</p>
              <p className="text-3xl font-black text-red-400 mb-2">0.08</p>
              <p className="text-xs text-gray-400">Larch model tested directly on Spruce &mdash; near-total failure</p>
            </div>
            <div className="glass-panel p-6 border-t-4 border-t-[#10b981] text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">After Fine-Tuning</p>
              <p className="text-3xl font-black text-[#10b981] mb-2">0.81</p>
              <p className="text-xs text-gray-400">Larch pretrained + Spruce fine-tuned &mdash; strong recovery</p>
            </div>
            <div className="glass-panel p-6 border-t-4 border-t-white/50 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Baseline (Spruce-Only)</p>
              <p className="text-3xl font-black text-white mb-2">0.86</p>
              <p className="text-xs text-gray-400">ResNet + RetinaNet trained only on Spruce</p>
            </div>
          </div>

          {/* Prescriptive Takeaways */}
          <div className="glass-panel p-6 border-l-4 border-l-[#10b981]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-4">Prescriptive Takeaways</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-[#10b981] font-bold text-sm mt-0.5">1.</span>
                <p className="text-sm text-gray-300 leading-relaxed"><span className="text-white font-bold">Zero-shot cross-species transfer does not work.</span> A Larch-trained detector scored only 0.08 F2 on Spruce, confirming that damage signatures are too species-specific for direct transfer.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#10b981] font-bold text-sm mt-0.5">2.</span>
                <p className="text-sm text-gray-300 leading-relaxed"><span className="text-white font-bold">Fine-tuning recovers most of the performance.</span> After fine-tuning on Spruce, the transfer model reached 0.81 F2 &mdash; closing 94% of the gap to the Spruce-only baseline of 0.86.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#10b981] font-bold text-sm mt-0.5">3.</span>
                <p className="text-sm text-gray-300 leading-relaxed"><span className="text-white font-bold">For new tree species, use a two-phase approach:</span> pretrain on a data-rich species, then fine-tune on the target species with even a modest amount of labeled data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 4. DOMAIN ANSWERS FOR GENERAL AUDIENCE ===== */}
        <section className="py-16 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-tech text-[#10b981] px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 uppercase tracking-widest">04</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              What This <span className="text-[#10b981]">Means</span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-8 ml-14">Plain-language summary for forestry stakeholders</p>

          <div className="glass-panel p-8 border-l-4 border-l-[#10b981]">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-2">The Problem</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Bark beetle infestations are devastating forests across species. Detecting damage early from drone imagery is critical, but training AI models requires large amounts of labeled data for each tree species &mdash; a costly and time-consuming process.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">What We Tested</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Can a beetle-damage detector trained on one tree species (Larch) be adapted to detect damage on a different species (Spruce) &mdash; reducing the need to start from scratch each time?
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">What We Found</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Simply applying the Larch model to Spruce images did not work &mdash; the model missed almost all damage. However, after a short fine-tuning phase using Spruce examples, the model recovered to <span className="text-[#10b981] font-bold">94% of the accuracy</span> achieved by a model trained entirely on Spruce. This means that expertise learned from one species can be successfully transferred to another with minimal additional effort.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">Why It Matters</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  For forestry managers monitoring multiple tree species across large areas, this means new detectors can be deployed faster and cheaper. Instead of collecting thousands of labeled images for each new species, managers can leverage existing models and fine-tune with a smaller set of new data &mdash; accelerating response times to beetle outbreaks.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
