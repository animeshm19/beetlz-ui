import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------
// COMPONENT 0: The Math behind the Liquid Physics (Processing State)
// ---------------------------------------------------------
const GooeySVGFilter = () => (
  <svg className="hidden">
    <defs>
      <filter id="goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
      </filter>
    </defs>
  </svg>
);

// ---------------------------------------------------------
// COMPONENT 1: Ambient Flow Background (The Upgrade)
// ---------------------------------------------------------
const AmbientFlowBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // LiDAR Particles
    const particles = Array.from({ length: 70 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.003; // Controls the speed of the flowing waves

      // 1. Draw Flowing Topographic/Data Waves
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        // Create a subtle cyan-to-blue gradient effect based on the wave index
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.04 - (i * 0.005)})`;
        
        for (let x = 0; x <= canvas.width; x += 30) {
          // Complex sine wave math for organic, non-repeating flow
          const y = (canvas.height * 0.6) 
                  + Math.sin(x * 0.002 + time + i) * 180 
                  + Math.cos(x * 0.001 - time * 1.2 + i * 0.5) * 120;
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 2. Update and Draw Drifting LiDAR Nodes
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Seamless screen wrapping
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-brand-dark">
      {/* Structural Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBNMzkuNSAwdi00MEgzOS41eiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDM1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-70"></div>
      
      {/* Deep Ambient Flowing Orbs */}
      <div className="absolute top-[10%] left-[15%] w-[45vw] h-[45vw] bg-blue-600/10 rounded-full blur-[140px] mix-blend-screen animate-[float_12s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] right-[15%] w-[40vw] h-[40vw] bg-brand-accent/10 rounded-full blur-[120px] mix-blend-screen animate-[float_15s_ease-in-out_infinite_reverse]"></div>
      
      {/* The Dynamic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
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
    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white leading-tight drop-shadow-2xl">
      Detect. Analyze. <span className="text-transparent bg-clip-text bg-gradient-to-b from-brand-accent to-blue-600 drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">Protect.</span>
    </h1>
    <p className="text-base text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
      High-fidelity spatial analysis for Spruce Bark Beetle geometries. Upload canopy imagery to render the telemetry preview.
    </p>
  </div>
);

// ---------------------------------------------------------
// COMPONENT 3: Interactive Fluid Particle Engine (Processing State)
// ---------------------------------------------------------
const InteractiveProcessingState = ({ fileName }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = { x: null, y: null, radius: 150 };

    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', handleResize);

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 10;
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 10;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      let numberOfParticles = (canvas.height * canvas.width) / 9000;
      const colors = ['rgba(0, 240, 255, 0.8)', 'rgba(251, 191, 36, 0.8)', 'rgba(255, 51, 51, 0.8)'];
      
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 3) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 2) - 1;
        let directionY = (Math.random() * 2) - 1;
        let color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, directionX, directionY, size, color));
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    };

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + 
                         ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - (distance / 20000);
            ctx.strokeStyle = `rgba(0, 240, 255, ${opacityValue * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-dark/90 backdrop-blur-sm animate-fade-in-up">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair"></canvas>
      
      <div className="relative z-10 text-center pointer-events-none p-10 glass-panel rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.1)]">
        <h3 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
          Synthesizing Data
        </h3>
        <p className="font-mono text-brand-accent text-sm tracking-widest uppercase">
          Mapping Spatial Geometries for <span className="text-white font-bold">{fileName}</span>
        </p>
        
        <div className="w-full max-w-md mx-auto h-1 bg-white/10 mt-6 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-brand-accent w-1/2 rounded-full shadow-[0_0_10px_#00F0FF] animate-[wave-fill_2s_ease-in-out_infinite_alternate]"></div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// COMPONENT 4: Advanced Results Dashboard
// ---------------------------------------------------------
const ResultsDashboard = ({ file, onReset, gcpOutputUrl }) => (
  <div className="z-10 w-full max-w-7xl animate-fade-in-up flex flex-col items-center">
    
    <div className="w-full flex justify-between items-end mb-6 border-b border-white/10 pb-4">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-1">Telemetry Extracted</h2>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#fbbf24]/20 border border-[#fbbf24]/50 text-[10px] font-mono text-[#fbbf24] uppercase tracking-widest animate-pulse">Resin Lock</span>
          <p className="text-xs font-mono text-gray-400 tracking-wider">Target: <span className="text-white">{file?.name}</span></p>
        </div>
      </div>
      <button onClick={onReset} className="px-5 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-brand-accent hover:text-brand-accent hover:bg-brand-accent/10 transition-all duration-300 text-sm font-mono text-gray-300 flex items-center gap-2">
        Terminate Link
      </button>
    </div>

    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 glass-panel rounded-[2xl] p-2 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
        <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-mono text-brand-accent uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse"></span>
          Vertex AI Spatial Render
        </div>
        <div className="relative w-full h-[65vh] bg-[#050505] rounded-xl overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          <img src={gcpOutputUrl} alt="GCP Output" className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl opacity-90 transition-transform duration-700 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl">
             <div className="w-full h-[200px] bg-gradient-to-b from-transparent via-brand-accent/5 to-transparent shadow-[0_10px_30px_rgba(0,240,255,0.1)] opacity-50 animate-scan"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-[#ff3333] relative overflow-hidden">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 relative z-10">High Damage Volume</p>
          <div className="flex items-baseline gap-2 relative z-10 mb-4">
            <h3 className="text-5xl font-black text-white">12</h3>
            <span className="text-xs text-[#ff3333] font-bold uppercase tracking-wider">Trees</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-accent relative overflow-hidden">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 relative z-10">Healthy / Other Volume</p>
          <div className="flex items-baseline gap-2 relative z-10 mb-4">
            <h3 className="text-4xl font-black text-gray-200">45</h3>
            <span className="text-xs text-brand-accent uppercase tracking-wider">Trees</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex-grow flex flex-col justify-end">
           <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-4">Signature Alignment</p>
           <div className="h-full w-full bg-[#050505]/50 border border-white/5 rounded-lg flex items-center justify-center p-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:20px_20px] animate-[wave-fill_2s_linear_infinite]"></div>
              <p className="text-[10px] font-mono text-[#fbbf24]/70 uppercase tracking-widest text-center relative z-10 group-hover:text-[#fbbf24] transition-colors">Resin Signatures Locked</p>
           </div>
        </div>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------
// COMPONENT 5: Main App Engine
// ---------------------------------------------------------
export default function App() {
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [gcpOutputUrl, setGcpOutputUrl] = useState(null);
  const [status, setStatus] = useState('upload'); 
  
  const fileInputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

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

  const runAnalysis = () => {
    setStatus('processing');
    
    // Simulating GCP processing time
    setTimeout(() => {
      const mockGcpBucketUrl = "https://images.unsplash.com/photo-1620502263309-8472f7c040d6?q=80&w=2000&auto=format&fit=crop";
      setGcpOutputUrl(mockGcpBucketUrl);
      setStatus('complete');
    }, 6000); 
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative selection:bg-brand-accent selection:text-black font-sans">
      <GooeySVGFilter />
      <AmbientFlowBackground />
      
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

      {status === 'processing' && <InteractiveProcessingState fileName={file?.name} />}
      
      {status === 'complete' && <ResultsDashboard file={file} onReset={clearImage} gcpOutputUrl={gcpOutputUrl} />}
    </div>
  );
}