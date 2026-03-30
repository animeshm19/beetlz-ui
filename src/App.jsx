import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------
// COMPONENT 1: Topographic LiDAR Background
// ---------------------------------------------------------
const LiDARBackground = () => {
  const [nodes, setNodes] = useState([]);
  useEffect(() => {
    const newNodes = Array.from({ length: 45 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.4 + 0.1, delay: Math.random() * 4,
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBNMzkuNSAwdi00MEgzOS41eiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDM1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-brand-accent rounded-full blur-[250px] opacity-[0.04]"></div>
      {nodes.map((node) => (
        <div key={node.id} className="absolute rounded-full bg-white transition-opacity duration-1000"
          style={{ left: `${node.x}%`, top: `${node.y}%`, width: `${node.size}px`, height: `${node.size}px`, opacity: node.opacity, animation: `pulse ${node.delay + 2}s infinite alternate` }}
        ></div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------
// COMPONENT 2: Hero Text
// ---------------------------------------------------------
const HeroText = () => (
  <div className="z-10 text-center max-w-4xl mb-10 animate-float relative flex flex-col items-center">
    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-brand-accent/30 bg-black/60 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)]">
      <div className="relative flex items-center justify-center w-3 h-3">
        <span className="absolute w-full h-full bg-brand-accent rounded-full opacity-60 animate-ping"></span>
        <span className="relative w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
      </div>
      <span className="text-xs font-mono text-gray-200 uppercase tracking-[0.25em]">BEETLZ Vision Engine</span>
    </div>
    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white leading-tight">
      Detect. Analyze. <span className="text-transparent bg-clip-text bg-gradient-to-b from-brand-accent to-blue-600 drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">Protect.</span>
    </h1>
    <p className="text-base text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
      High-fidelity spatial analysis for Spruce Bark Beetle geometries. Upload canopy imagery to render the telemetry preview.
    </p>
  </div>
);

// ---------------------------------------------------------
// COMPONENT 3: Main App Engine
// ---------------------------------------------------------
export default function App() {
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [gcpOutputUrl, setGcpOutputUrl] = useState(null);
  const [status, setStatus] = useState('upload'); // 'upload' | 'preview' | 'processing' | 'complete'
  
  const fileInputRef = useRef(null);

  // Helper to format file size
  const formatBytes = (bytes) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // --- STAGE 1 & 2: Upload & Mount ---
  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setLocalPreviewUrl(URL.createObjectURL(selectedFile));
      setStatus('preview');
    }
  };

  const clearImage = () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setFile(null);
    setLocalPreviewUrl(null);
    setGcpOutputUrl(null);
    setStatus('upload');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- STAGE 3: Execute GCP Uplink ---
  const runAnalysis = () => {
    setStatus('processing');
    
    // Simulating the delay of sending to FastAPI, processing in Vertex AI, and returning a GCP bucket URL
    setTimeout(() => {
      // Mocking the URL we will eventually get back from your Python backend
      // Using a drone shot from Unsplash to simulate the returned image
      const mockGcpBucketUrl = "https://images.unsplash.com/photo-1620502263309-8472f7c040d6?q=80&w=2000&auto=format&fit=crop";
      
      setGcpOutputUrl(mockGcpBucketUrl);
      setStatus('complete');
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative selection:bg-brand-accent selection:text-black font-sans">
      <LiDARBackground />
      
      {/* --------------------------------------------------- */}
      {/* STATE 1: UPLOAD ZONE                                */}
      {/* --------------------------------------------------- */}
      {status === 'upload' && (
        <div className="w-full flex flex-col items-center animate-fade-in-up z-10">
          <HeroText />
          <div 
            onClick={() => fileInputRef.current.click()}
            className={`w-full max-w-3xl h-[20rem] rounded-2xl glass-panel flex flex-col items-center justify-center transition-all duration-300 ease-out cursor-pointer relative overflow-hidden group ${isHovering ? 'border-brand-accent shadow-[0_0_50px_rgba(0,240,255,0.15)] bg-brand-accent/[0.03] scale-[1.01]' : 'hover:border-white/30 hover:bg-white/[0.02]'}`}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={(e) => { e.preventDefault(); setIsHovering(false); if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]); }}
          >
            <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files.length > 0) processFile(e.target.files[0]); }} accept="image/png, image/jpeg, image/tiff" className="hidden" />
            <div className={`absolute left-0 w-full h-[1px] bg-brand-accent shadow-[0_0_15px_#00F0FF] ${isHovering ? 'animate-scan' : 'hidden'}`}></div>
            <div className="flex flex-col items-center space-y-6 pointer-events-none transition-transform duration-300 group-hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-brand-accent/50 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-500">
                <svg className={`w-8 h-8 transition-colors duration-300 ${isHovering ? 'text-brand-accent' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-200 tracking-tight mb-2">{isHovering ? "Drop to Mount Feed" : "Click or Drag Aerial Feed Here"}</p>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Supports JPG, PNG, TIFF</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* STATE 2: LOCAL PREVIEW (Awaiting execution)         */}
      {/* --------------------------------------------------- */}
      {status === 'preview' && (
        <div className="w-full max-w-5xl animate-fade-in-up z-10 flex flex-col items-center">
          <div className="w-full flex justify-between items-end mb-6 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-1">Telemetry Mounted</h2>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                <p className="text-xs font-mono text-gray-400 tracking-wider"><span className="text-brand-accent uppercase">{file.name}</span> // {formatBytes(file.size)}</p>
              </div>
            </div>
            <button onClick={clearImage} className="px-5 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-[#ff3333] hover:text-[#ff3333] hover:bg-[#ff3333]/10 transition-all duration-300 text-sm font-mono text-gray-300 group flex items-center gap-2">
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Discard
            </button>
          </div>

          <div className="w-full glass-panel rounded-[2rem] p-3 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 mb-8">
            <div className="relative w-full h-[50vh] bg-[#050505] rounded-[1.5rem] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              <img src={localPreviewUrl} alt="Local Upload" className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl opacity-70" />
            </div>
          </div>
          
          <button onClick={runAnalysis} className="px-10 py-4 rounded-full bg-brand-accent text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-white hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Execute Cloud Inference
            </span>
          </button>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* STATE 3: PROCESSING / GCP UPLINK                    */}
      {/* --------------------------------------------------- */}
      {status === 'processing' && (
        <div className="z-10 flex flex-col items-center text-center animate-fade-in-up">
          <div className="w-32 h-32 mb-8 relative flex items-center justify-center">
             <div className="absolute inset-0 border-t-2 border-brand-accent rounded-full animate-spin"></div>
             <div className="absolute inset-3 border-r-2 border-[#ff3333]/80 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
             <div className="absolute inset-6 border-b-2 border-white/30 rounded-full animate-[spin_2s_linear_infinite]"></div>
             <span className="text-xs font-mono text-brand-accent animate-pulse">UPLINK</span>
          </div>
          <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-3">Transmitting to GCP</h3>
          <p className="font-mono text-gray-400 text-sm">
            Routing <span className="text-brand-accent">{file.name}</span> through Vertex AI pipeline...
          </p>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* STATE 4: RESULTS DASHBOARD (GCP Rendered Image)     */}
      {/* --------------------------------------------------- */}
      {status === 'complete' && (
        <div className="z-10 w-full max-w-7xl animate-fade-in-up flex flex-col items-center">
          
          <div className="w-full flex justify-between items-end mb-6 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-1">Inference Complete</h2>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-brand-accent/20 border border-brand-accent/50 text-[10px] font-mono text-brand-accent uppercase tracking-widest">GCP: us-central1</span>
                <p className="text-xs font-mono text-gray-400 tracking-wider">Target: <span className="text-white">{file.name}</span></p>
              </div>
            </div>
            <button onClick={clearImage} className="px-5 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-brand-accent hover:text-brand-accent hover:bg-brand-accent/10 transition-all duration-300 text-sm font-mono text-gray-300 flex items-center gap-2">
              Run New Scan
            </button>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* The Rendered Image from GCP */}
            <div className="lg:col-span-3 glass-panel rounded-[2xl] p-2 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
              <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-mono text-brand-accent uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse"></span>
                GCP Rendered Output
              </div>
              <div className="relative w-full h-[65vh] bg-[#050505] rounded-xl overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                
                {/* This is where the processed image from your cloud bucket goes.
                  It already has bounding boxes drawn by your backend.
                */}
                <img 
                  src={gcpOutputUrl} 
                  alt="GCP Processed Output" 
                  className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Sidebar Telemetry (Mock Data for now) */}
            <div className="flex flex-col gap-4">
              <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-[#ff3333]">
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">Target Acquisition</p>
                <h3 className="text-4xl font-black text-white mb-1">12</h3>
                <p className="text-xs text-[#ff3333] font-bold uppercase tracking-wider mb-4">High Damage (HD)</p>
                <h3 className="text-2xl font-bold text-gray-300 mb-1">45</h3>
                <p className="text-xs text-brand-accent uppercase tracking-wider">Other / Healthy</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 flex-grow">
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-4">Feature Analysis</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Brightness</span>
                      <span className="font-mono text-white">114.2</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1"><div className="bg-brand-accent h-full rounded-full" style={{width: '65%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Laplacian Var</span>
                      <span className="font-mono text-white">842.6</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1"><div className="bg-brand-accent h-full rounded-full" style={{width: '42%'}}></div></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}