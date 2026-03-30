import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Zap, 
  Activity, 
  BarChart3, 
  FileText, 
  X, 
  Maximize2, 
  ShieldCheck, 
  TrendingUp,
  RefreshCcw
} from 'lucide-react';

// ---------------------------------------------------------
// STYLES & ANIMATIONS
// ---------------------------------------------------------
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

    @keyframes scanner {
      0% { transform: translateY(-100%); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(500%); opacity: 0; }
    }

    .scan-line {
      height: 100px;
      background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.2), transparent);
      animation: scanner 3s ease-in-out infinite;
    }

    .text-shine {
      background: linear-gradient(120deg, #10b981 20%, #ffffff 40%, #ffffff 60%, #10b981 80%);
      background-size: 200% auto;
      color: transparent;
      -webkit-background-clip: text;
      animation: shine 4s linear infinite;
    }
    @keyframes shine { to { background-position: -200% center; } }
  `}} />
);

// ---------------------------------------------------------
// COMPONENT: Domain Analysis View
// ---------------------------------------------------------
const DomainAnalysis = ({ nexusData }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="w-full h-full space-y-12 p-4"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {nexusData.domain_stats.map((stat, idx) => (
        <div key={idx} className="space-y-4">
          <div className="flex justify-between text-[10px] font-tech uppercase tracking-widest text-gray-400">
            <span>{stat.name}</span>
            <span>Variance Delta: {Math.abs(stat.larch - stat.spruce).toFixed(2)}</span>
          </div>
          <div className="relative h-8 w-full bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${stat.larch * 100}%` }}
              className="absolute inset-y-0 left-0 bg-[#10b981]/40 border-r border-[#10b981]"
            />
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${stat.spruce * 100}%` }}
              className="absolute inset-y-0 left-0 bg-white/20 border-r border-white/50"
              style={{ height: '40%', top: '30%' }}
            />
          </div>
          <div className="flex gap-4 text-[9px] font-tech">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#10b981]" /> LILA (LARCH)</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-white/50" /> KAGGLE (SPRUCE)</div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-4">
      {nexusData.datasets.map(d => (
        <div key={d.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-[10px] text-[#10b981] font-bold uppercase mb-1">{d.type} Set</p>
          <p className="text-sm font-bold text-white mb-2">{d.id}</p>
          <p className="text-[9px] text-gray-500 tracking-wider">SOURCE: {d.source} // DAMAGE: {d.damage_type}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

// ---------------------------------------------------------
// MAIN APPLICATION
// ---------------------------------------------------------
export default function App() {
  const [file, setFile] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [nexusData, setNexusData] = useState(null);
  const [status, setStatus] = useState('upload'); // 'upload', 'preview', 'processing', 'complete'
  const [showDomain, setShowDomain] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setApiData(null);
    setStatus('upload');
    setShowDomain(false);
  };

  const handleUpload = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setStatus('preview');
    }
  };

  const runAnalysis = async () => {
    setStatus('processing');
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Parallel fetch for analysis and dataset metadata
      const [res, nRes] = await Promise.all([
        fetch("http://localhost:8000/api/analyze", { method: "POST", body: formData }),
        fetch("http://localhost:8000/api/dataset_nexus")
      ]);

      const data = await res.json();
      const nData = await nRes.json();
      
      setApiData(data);
      setNexusData(nData);
      setStatus('complete');
    } catch (err) {
      console.error(err);
      alert("System Error: Ensure FastAPI is running on port 8000.");
      setStatus('upload');
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-tech selection:bg-[#10b981] selection:text-black overflow-hidden relative">
      <SolarpunkStyles />
      <div className="fixed inset-0 solarpunk-grid opacity-40 pointer-events-none" />
      
      {/* BACKGROUND GLOWS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#064e3b]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#10b981]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 h-screen flex flex-col">
        
        {/* NAV HEADER */}
        <header className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Beetlz <span className="text-[#10b981]">Vision</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">Engine v2.0 // Active</span>
            </div>
          </div>
          
          <AnimatePresence>
            {status === 'complete' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
                <button 
                  onClick={() => setShowDomain(!showDomain)}
                  className="px-4 py-2 border border-[#10b981]/40 text-[#10b981] text-[10px] font-bold uppercase rounded-lg hover:bg-[#10b981]/10 transition-all flex items-center gap-2"
                >
                  <BarChart3 size={14} /> {showDomain ? "View Detection" : "Domain Analysis"}
                </button>
                <button onClick={reset} className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase rounded-lg flex items-center gap-2">
                  <RefreshCcw size={14} /> Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* MAIN STAGE */}
        <main className="flex-grow flex flex-col justify-center relative">
          
          <AnimatePresence mode="wait">
            
            {/* 1. UPLOAD STATE */}
            {status === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-2xl mx-auto w-full text-center">
                <div className="mb-12">
                  <h2 className="text-6xl font-black mb-4 tracking-tighter">Detect. Analyze. <span className="text-shine">Protect.</span></h2>
                  <p className="text-gray-500 text-sm uppercase tracking-widest">Bridging Larch Casebearer training with Spruce Beetle inference.</p>
                </div>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="h-72 glass-panel border-dashed border-2 border-white/10 hover:border-[#10b981]/50 hover:bg-[#10b981]/5 transition-all group flex flex-col items-center justify-center cursor-pointer"
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="text-gray-400 group-hover:text-[#10b981]" size={32} />
                  </div>
                  <span className="text-lg font-bold tracking-tight">Mount Aerial Telemetry</span>
                  <span className="text-[10px] text-gray-500 uppercase mt-2">LILA / Kaggle Image Formats</span>
                </div>
              </motion.div>
            )}

            {/* 2. PREVIEW STATE */}
            {status === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto w-full">
                <div className="glass-panel p-4 mb-8 h-[500px] flex items-center justify-center overflow-hidden">
                  <img src={URL.createObjectURL(file)} className="max-h-full rounded-lg opacity-80" alt="Preview" />
                </div>
                <div className="flex justify-center">
                  <button onClick={runAnalysis} className="px-12 py-4 bg-[#10b981] text-black font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all flex items-center gap-3">
                    <Zap fill="currentColor" size={20} /> Execute Inference
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. PROCESSING STATE */}
            {status === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="w-24 h-24 border-t-2 border-[#10b981] rounded-full animate-spin mb-8" />
                <h2 className="text-2xl font-black uppercase tracking-[0.3em]">Synthesizing Geometries</h2>
                <p className="text-[#10b981] text-xs mt-2 animate-pulse">Extracting Cross-Dataset Texture Features...</p>
              </motion.div>
            )}

            {/* 4. COMPLETE STATE (DASHBOARD) */}
            {status === 'complete' && (
              <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-12 gap-6 h-full pb-8">
                
                {/* LEFT: MAIN VISUALIZER */}
                <div className="col-span-12 lg:col-span-8 h-full min-h-[500px]">
                  <div className="glass-panel h-full relative overflow-hidden group">
                    {showDomain ? (
                      <div className="p-8"><DomainAnalysis nexusData={nexusData} /></div>
                    ) : (
                      <>
                        <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-black/80 border border-white/10 rounded text-[9px] font-bold text-[#10b981] uppercase tracking-widest flex items-center gap-2">
                          <Activity size={12} /> Spatial Render // Active
                        </div>
                        <img src={apiData.gcpOutputUrl} className="w-full h-full object-cover rounded-xl" alt="Result" />
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="scan-line w-full" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT: TELEMETRY SIDEBAR */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                  
                  {/* TILE 1: SUMMARY */}
                  <div className="glass-panel p-6 border-l-4 border-l-[#10b981]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ShieldCheck size={12} /> Detection Summary
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-5xl font-black">{apiData.hdCount}</p>
                        <p className="text-[9px] text-red-500 font-bold uppercase mt-1">HD Stages</p>
                      </div>
                      <div className="text-right">
                        <p className="text-5xl font-black text-gray-400">{apiData.healthyCount}</p>
                        <p className="text-[9px] text-[#10b981] font-bold uppercase mt-1">Healthy</p>
                      </div>
                    </div>
                  </div>

                  {/* TILE 2: TEXTURE MATH */}
                  <div className="glass-panel p-6 border-l-4 border-l-white/50">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Maximize2 size={12} /> Spatial Texture Analysis
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-gray-400">LAPLACIAN VAR</span>
                        <span className="font-bold">{apiData.laplacian}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-gray-400">CHLOROPHYLL INDEX</span>
                        <span className="font-bold text-[#10b981]">{apiData.meanGray}</span>
                      </div>
                    </div>
                  </div>

                  {/* TILE 3: REFLECTANCE CHART */}
                  <div className="glass-panel p-6 flex-grow flex flex-col">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <TrendingUp size={12} /> Canopy Reflectance (G-Band)
                    </p>
                    <div className="flex-grow flex items-end gap-1.5 h-32">
                      {apiData.histogram.map((h, i) => {
                        const max = Math.max(...apiData.histogram.map(x => x.g));
                        return (
                          <motion.div 
                            key={i} 
                            initial={{ height: 0 }} animate={{ height: `${(h.g / max) * 100}%` }}
                            className="flex-grow bg-[#10b981] opacity-40 hover:opacity-100 transition-all cursor-crosshair rounded-t-sm"
                          />
                        );
                      })}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="mt-8 flex justify-between items-center text-[9px] text-gray-600 uppercase tracking-[0.3em]">
          <span>© 2026 BEETLZ SPATIAL</span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> UofA ML ARCH</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> VERTEX AI LINK</span>
          </span>
        </footer>
      </div>
    </div>
  );
}