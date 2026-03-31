import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Zap, 
  Activity, 
  ShieldCheck, 
  RefreshCcw,
  Terminal,
  Crosshair
} from 'lucide-react';
import Plot from 'react-plotly.js';

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

  if (!apiData || !apiData.boxes || !imgDimensions || imgDimensions.w === 0) return null;

  return (
    <svg viewBox={`0 0 ${imgDimensions.w} ${imgDimensions.h}`} className="absolute inset-0 w-full h-full object-contain z-30">
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
        // Calculate font size relative to image height
        const fontSize = imgDimensions.h * 0.022; 
        const labelText = `[${label.toUpperCase()}] CONF: ${(score * 100).toFixed(1)}%`;
        
        // Estimate text width (monospace fonts are ~0.6x their height in width)
        const paddingX = imgDimensions.w * 0.01;
        const estimatedTextWidth = (labelText.length * (fontSize * 0.62)) + (paddingX * 2);
        const bgHeight = imgDimensions.h * 0.04;

        // Prevent the label from rendering outside the top or right edges of the image
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
                {/* Dark Glass Background */}
                <rect 
                  x={labelX} 
                  y={labelY} 
                  width={estimatedTextWidth} 
                  height={bgHeight} 
                  fill="rgba(10, 10, 10, 0.9)" 
                  stroke={boxColor}
                  strokeWidth={imgDimensions.w * 0.0015}
                  rx={imgDimensions.w * 0.004} // Premium rounded corners
                  filter={`url(#glow-${i})`}
                />
                
                {/* Single Combined Text Element using <tspan> to guarantee perfect spacing */}
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

// COMPONENT 3: Real Operational Matrix
const CanopyInterventionMatrix = ({ totalDetections }) => {
  const [harvestPremium, setHarvestPremium] = useState(300);
  const [qZoneRadius, setQZoneRadius] = useState(15); 

  const infectionLockSavings = totalDetections * harvestPremium;
  const preventableLossValue = totalDetections * 300; 

  return (
    <div className="glass-panel w-full h-full border-l-4 border-l-white flex flex-col p-6">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-tech text-gray-500 uppercase tracking-[0.2em]">Financial Cost Matrix</p>
        <span className="text-[8px] font-tech text-emerald-300 px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/40 animate-pulse">LOCKED</span>
      </div>

      <div className="flex flex-col flex-grow justify-between">
        <div className="space-y-5">
          <p className="text-xs text-gray-400 font-light leading-relaxed border-b border-white/10 pb-4">Analyze operational costs of immediate containment vs baseline depreciation.</p>
          
          <div className="w-full">
              <div className="flex justify-between items-center mb-2 text-[10px] font-tech text-gray-400 uppercase tracking-widest">
                <span>Immediate Harvest Premium</span>
                <span className="text-white font-bold">{harvestPremium} <span className="font-light">CAD</span></span>
              </div>
              <input type="range" min="100" max="1000" step="50" value={harvestPremium} onChange={(e) => setHarvestPremium(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none solarpunk-slider" />
          </div>

          <div className="w-full">
              <div className="flex justify-between items-center mb-2 text-[10px] font-tech text-gray-400 uppercase tracking-widest">
                <span>Q-Zone Radius</span>
                <span className="text-white font-bold">{qZoneRadius} <span className="font-light">Meters</span></span>
              </div>
              <input type="range" min="5" max="50" step="1" value={qZoneRadius} onChange={(e) => setQZoneRadius(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none solarpunk-slider" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-black/60 rounded-xl p-4 border border-white/5 flex flex-col justify-center overflow-hidden">
                <p className="text-[9px] font-tech text-gray-500 uppercase tracking-widest mb-1 truncate">Action Savings</p>
                <h3 className="text-2xl xl:text-3xl font-black text-[#10b981] truncate" style={{textShadow: '0 0 10px rgba(16,185,129,0.4)'}}>${infectionLockSavings.toLocaleString()}</h3>
            </div>
            <div className="bg-black/60 rounded-xl p-4 border border-white/5 flex flex-col justify-center overflow-hidden">
                <p className="text-[9px] font-tech text-gray-500 uppercase tracking-widest mb-1 truncate">Revenue Risk</p>
                <h3 className="text-2xl xl:text-3xl font-black text-white truncate" style={{textShadow: '0 0 10px rgba(255,255,255,0.4)'}}>${preventableLossValue.toLocaleString()}</h3>
            </div>
        </div>
      </div>
    </div>
  );
};

// COMPONENT 4: Histogram Plot
const HistogramPlot = ({ file1, file2, title, chiSquareKey, label1, label2 }) => {
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`/${file1}`).then(r => r.json()),
      fetch(`/${file2}`).then(r => r.json()),
    ])
      .then(([d1, d2]) => {
        setData1(d1);
        setData2(d2);
      })
      .catch(err => setError(err.message));
  }, [file1, file2]);

  if (error) return <div className="glass-panel p-4 text-red-400 text-xs">Error loading: {error}</div>;
  if (!data1 || !data2) return <div className="glass-panel p-6 flex items-center justify-center h-[400px]"><span className="text-gray-500 text-xs uppercase tracking-widest animate-pulse">Loading histogram...</span></div>;

  const bins1 = data1.bins;
  const binCenters1 = bins1.slice(0, -1).map((b, i) => 0.5 * (b + bins1[i + 1]));
  const bins2 = data2.bins;
  const binCenters2 = bins2.slice(0, -1).map((b, i) => 0.5 * (b + bins2[i + 1]));

  const chiSquareVal = data1[chiSquareKey];
  const fullTitle = chiSquareVal !== undefined
    ? `${title}. Chi Square: ${chiSquareVal}`
    : title;

  return (
    <div className="glass-panel p-4">
      <Plot
        data={[
          {
            x: binCenters1,
            y: data1.counts,
            type: 'bar',
            opacity: 0.5,
            name: label1,
            marker: { color: '#10b981' },
          },
          {
            x: binCenters2,
            y: data2.counts,
            type: 'bar',
            opacity: 0.6,
            name: label2,
            marker: { color: '#ef4444' },
          },
        ]}
        layout={{
          title: { text: fullTitle, font: { color: '#ffffff', family: 'JetBrains Mono, monospace', size: 13 } },
          xaxis: { title: 'Pixel Value', color: '#9ca3af', gridcolor: 'rgba(255,255,255,0.05)' },
          yaxis: { title: 'Normalized Count', color: '#9ca3af', gridcolor: 'rgba(255,255,255,0.05)' },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0.3)',
          font: { color: '#d1d5db', family: 'JetBrains Mono, monospace' },
          legend: { font: { color: '#d1d5db' } },
          barmode: 'overlay',
          margin: { t: 60, b: 50, l: 60, r: 20 },
        }}
        config={{ responsive: true, displayModeBar: true }}
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
};

// All histogram plot configurations (matching plots.py)
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

// MAIN APPLICATION
export default function App() {
  const [file, setFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });
  const [apiData, setApiData] = useState(null);
  const [status, setStatus] = useState('upload'); 
  const [apiSource, setApiSource] = useState('Local Dynamic CV'); 
  const fileInputRef = useRef(null);

  const labelCounts = apiData?.labels ? apiData.labels.reduce((acc, label) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {}) : {};

  const totalDetections = apiData?.labels?.length || 0;
  
  const avgConfidence = totalDetections > 0 
    ? (apiData.scores.reduce((a, b) => a + b, 0) / totalDetections) * 100 
    : 0;

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
      
      // Hit the Cloud Python Server for Dynamic Computer Vision
      const response = await fetch("https://my-model-service-576296362651.us-central1.run.app/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64String })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }
      
      const data = await response.json();
      
      setApiData({
        boxes: data.boxes || [],
        labels: data.labels || [],
        scores: data.scores || []
      });
      
      setApiSource("Local Dynamic OpenCV");
      setStatus('complete');
      
    } catch (err) {
      console.error("API FAILED:", err);
      alert(`API Connection Failed: ${err.message}. Make sure your Python server is running on port 8000.`);
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
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
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
              <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 w-full h-full pb-8">
                
                {/* TOP ROW: Visualizer and Matrix */}
                <div className="flex flex-col lg:flex-row gap-6 w-full lg:h-[500px]">
                  
                  {/* MAIN RENDER WINDOW */}
                  <div className="w-full lg:w-[65%] h-[400px] lg:h-full glass-panel p-4 relative overflow-hidden group border-l-4 border-l-[#10b981]">
                      <div className="absolute top-6 left-6 z-40 px-4 py-1.5 bg-black/90 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 shadow-lg">
                        <Activity className="text-[#10b981] animate-pulse" size={14} /> Live Spatial Detections
                      </div>
                      
                      <div className="relative w-full h-full bg-[#050505] rounded-xl overflow-hidden flex items-center justify-center">
                         <div className="relative inline-block max-w-full max-h-full">
                            <img src={localPreviewUrl} className="max-w-full max-h-full object-contain block opacity-80" alt="Analyzed Feed" />
                            {/* REAL DYNAMIC BOXES RENDER HERE */}
                            <BoundingBoxOverlay apiData={apiData} imgDimensions={imgDimensions} />
                         </div>
                      </div>
                  </div>

                  {/* COST MATRIX */}
                  <div className="w-full lg:w-[35%] h-auto lg:h-full">
                     <CanopyInterventionMatrix totalDetections={totalDetections} />
                  </div>
                </div>

                {/* BOTTOM ROW: Stats and Raw Payload terminal */}
                <div className="flex flex-col lg:flex-row gap-6 w-full lg:h-[220px]">
                    
                    {/* STATS TILES */}
                    <div className="w-full lg:w-[45%] flex gap-6">
                       <div className="glass-panel p-6 flex-1 flex flex-col justify-center border-l-4 border-l-[#10b981]">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Crosshair size={12} /> Model Detections
                          </p>
                          <div className="space-y-3">
                             <div className="flex justify-between items-end border-b border-white/10 pb-2">
                               <span className="text-xl font-black text-white">{totalDetections}</span>
                               <span className="text-[10px] text-gray-400 uppercase tracking-widest">Total Found</span>
                             </div>
                             {Object.entries(labelCounts).map(([label, count]) => (
                               <div key={label} className="flex justify-between items-end">
                                 <span className="text-lg font-bold text-[#10b981]">{count}</span>
                                 <span className="text-[10px] text-gray-400 uppercase tracking-widest">Class: {label}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="glass-panel p-6 flex-1 flex flex-col justify-center items-center text-center border-l-4 border-l-white/50 relative overflow-hidden">
                          <ShieldCheck size={40} className="text-white/10 absolute -bottom-4 -right-4" />
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 w-full text-left">Average Confidence</p>
                          <div className="relative w-24 h-24 mt-2">
                             <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                               <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                               <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * avgConfidence) / 100} className="transition-all duration-1000 ease-out" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center flex-col mt-1">
                               <span className="text-xl font-black">{avgConfidence.toFixed(1)}%</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* RAW API PAYLOAD TERMINAL */}
                    <div className="w-full lg:w-[55%] glass-panel p-5 flex flex-col border-t-4 border-t-[#10b981]">
                        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                           <p className="text-[10px] text-[#10b981] uppercase tracking-[0.2em] flex items-center gap-2 font-bold">
                             <Terminal size={12} /> Live Telemetry Stream
                           </p>
                           <span className="text-[8px] bg-white/10 px-2 py-1 rounded text-white truncate max-w-[150px]">
                             Source: {apiSource}
                           </span>
                        </div>
                        <div className="flex-grow bg-black/80 rounded-lg p-4 font-tech text-[10px] text-gray-300 overflow-y-auto terminal-scroll">
                           <pre className="whitespace-pre-wrap">
                             {JSON.stringify(apiData, null, 2)}
                           </pre>
                        </div>
                    </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ===== SECTIONS BELOW HERO ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">

        {/* ANALYSIS SECTION */}
        <section className="py-16 border-t border-white/10">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">
            Model <span className="text-[#10b981]">Analysis</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="glass-panel p-6 border-l-4 border-l-[#10b981]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-3">Loss Function Handling</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                RetinaNet uses focal loss with specific gamma and alpha values to tackle the huge class imbalance in the dataset. In contrast, YOLO automatically adjusts these values, which can lead to sub-optimal results for this specific task.
              </p>
            </div>
            <div className="glass-panel p-6 border-l-4 border-l-white/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-3">Anchor Mechanisms</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                RetinaNet is an anchor-based model, whereas YOLO is an anchor-free model. YOLO's anchor-free architecture limits how many target labels it can detect within each divided grid of the original image.
              </p>
            </div>
          </div>

          {/* Performance Table */}
          <div className="glass-panel p-6 border-l-4 border-l-[#10b981]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-4">Main Model Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Training Phase</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Epochs</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Early Stopping</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Larch (Test)</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-gray-400">Spruce (Test)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-bold text-white">Phase 1</td>
                    <td className="py-3 px-4 text-gray-300">50</td>
                    <td className="py-3 px-4 text-gray-300">15</td>
                    <td className="py-3 px-4 text-[#10b981] font-bold">0.6632</td>
                    <td className="py-3 px-4 text-red-400 font-bold">0.0820</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Phase 2</td>
                    <td className="py-3 px-4 text-gray-300">20</td>
                    <td className="py-3 px-4 text-gray-300">10</td>
                    <td className="py-3 px-4 text-gray-500">-</td>
                    <td className="py-3 px-4 text-[#10b981] font-bold">0.8100</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-400 leading-relaxed">A Larch-trained detector transferred poorly to Spruce without adaptation (Spruce test ~0.08), confirming strong domain shift.</p>
              <p className="text-xs text-gray-400 leading-relaxed">Fine-tuning that pretrained model on Spruce substantially improved performance (Spruce test ~0.81), demonstrating successful transfer via target-domain fine-tuning.</p>
              <p className="text-xs text-gray-400 leading-relaxed">In this study, transfer required Spruce fine-tuning; zero-shot transfer was not sufficient.</p>
            </div>
          </div>
        </section>

        {/* HISTOGRAM PLOTS SECTION */}
        <section className="py-16 border-t border-white/10">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">
            Pixel Distribution <span className="text-[#10b981]">Histograms</span>
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-8">Interactive chi-square comparison plots between Spruce and Larch datasets</p>

          {/* Spruce Lidhem */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Spruce Lidhem HD</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {HIST_PLOTS.slice(0, 3).map((p, i) => (
                <HistogramPlot key={i} {...p} />
              ))}
            </div>
          </div>

          {/* Spruce Viken */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Spruce Viken HD</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {HIST_PLOTS.slice(3, 6).map((p, i) => (
                <HistogramPlot key={i} {...p} />
              ))}
            </div>
          </div>

          {/* Spruce Backsjon */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Spruce Backsjon HD</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {HIST_PLOTS.slice(6, 9).map((p, i) => (
                <HistogramPlot key={i} {...p} />
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
