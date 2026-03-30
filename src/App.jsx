import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------
// CUSTOM PREMIUM ANIMATIONS (Injected directly for ease)
// ---------------------------------------------------------
const PremiumStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes blur-reveal {
      0% { opacity: 0; filter: blur(12px); transform: translateY(20px); }
      100% { opacity: 1; filter: blur(0px); transform: translateY(0); }
    }
    @keyframes shine {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    .animate-blur-1 { animation: blur-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards; opacity: 0; }
    .animate-blur-2 { animation: blur-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards; opacity: 0; }
    .animate-blur-3 { animation: blur-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s forwards; opacity: 0; }
    
    .text-shine {
      background: linear-gradient(120deg, #10b981 20%, #ffffff 40%, #ffffff 60%, #10b981 80%);
      background-size: 200% auto;
      color: transparent;
      -webkit-background-clip: text;
      animation: shine 4s linear infinite;
    }

    /* Gooey Filter for the loading transition if needed */
    .gooey-filter { filter: url('#goo'); }
  `}} />
);

// ---------------------------------------------------------
// COMPONENT 1: Ambient Flow Background (Black/White/Green)
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

    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5, speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3, opacity: Math.random() * 0.5 + 0.1
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.002; 

      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        // Deep forest greens flowing into pure black
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.03 - (i * 0.005)})`;
        for (let x = 0; x <= canvas.width; x += 40) {
          const y = (canvas.height * 0.7) + Math.sin(x * 0.002 + time + i) * 150 + Math.cos(x * 0.001 - time * 1.2 + i * 0.5) * 100;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x > canvas.width) p.x = 0; if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0; if (p.y < 0) p.y = canvas.height;
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
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBNMzkuNSAwdi00MEgzOS41eiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDM1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-40"></div>
      {/* Deep Forest Green Ambient Glows */}
      <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-[#064e3b]/30 rounded-full blur-[150px] mix-blend-screen animate-[float_12s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[35vw] h-[35vw] bg-[#047857]/20 rounded-full blur-[130px] mix-blend-screen animate-[float_15s_ease-in-out_infinite_reverse]"></div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
    </div>
  );
};

// ---------------------------------------------------------
// COMPONENT 2: Aceternity-Style Animated Hero Text
// ---------------------------------------------------------
const HeroText = () => (
  <div className="z-10 text-center max-w-4xl mb-12 relative flex flex-col items-center">
    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#10b981]/30 bg-black/60 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)] animate-blur-1">
      <div className="relative flex items-center justify-center w-2.5 h-2.5">
        <span className="absolute w-full h-full bg-[#10b981] rounded-full opacity-60 animate-ping"></span>
        <span className="relative w-1.5 h-1.5 bg-[#10b981] rounded-full"></span>
      </div>
      <span className="text-[11px] font-mono text-white uppercase tracking-[0.3em]">BEETLZ Vision Engine</span>
    </div>
    
    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight flex flex-wrap justify-center gap-x-4">
      <span className="text-white animate-blur-1">Detect.</span>
      <span className="text-white animate-blur-2">Analyze.</span>
      <span className="text-shine drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-blur-3">Protect.</span>
    </h1>
    
    <p className="text-base text-gray-400 font-light max-w-2xl mx-auto leading-relaxed animate-blur-3" style={{ animationDelay: '0.7s' }}>
      High-fidelity spatial analysis for Spruce Bark Beetle geometries. Upload canopy imagery to render the telemetry preview.
    </p>
  </div>
);

// ---------------------------------------------------------
// COMPONENT 3: Interactive Fluid Particle Engine (Green/White)
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
    let mouse = { x: null, y: null, radius: 180 };

    const handleMouseMove = (e) => { mouse.x = e.x; mouse.y = e.y; };
    window.addEventListener('mousemove', handleMouseMove);
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
    window.addEventListener('resize', handleResize);

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
        this.baseX = this.x; this.baseY = this.y; this.density = (Math.random() * 40) + 1;
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = this.color; ctx.fill();
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        let dx = mouse.x - this.x; let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance; let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius; let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density; let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) { this.x -= directionX; this.y -= directionY; } 
        else {
          if (this.x !== this.baseX) { let dx = this.x - this.baseX; this.x -= dx / 15; }
          if (this.y !== this.baseY) { let dy = this.y - this.baseY; this.y -= dy / 15; }
        }
        this.x += this.directionX; this.y += this.directionY; this.draw();
      }
    }

    const init = () => {
      particles = [];
      let numberOfParticles = (canvas.height * canvas.width) / 8000;
      // Strictly Black, White, and Green palette for particles
      const colors = ['rgba(16, 185, 129, 0.9)', 'rgba(255, 255, 255, 0.9)', 'rgba(6, 78, 59, 0.8)'];
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2.5) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 1.5) - 0.75; let directionY = (Math.random() * 1.5) - 0.75;
        particles.push(new Particle(x, y, directionX, directionY, size, colors[Math.floor(Math.random() * colors.length)]));
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = 0; i < particles.length; i++) { particles[i].update(); }
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
          if (distance < (canvas.width / 8) * (canvas.height / 8)) {
            opacityValue = 1 - (distance / 20000);
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacityValue * 0.25})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y); ctx.stroke();
          }
        }
      }
    };

    init(); animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-[blur-reveal_0.5s_ease-out_forwards]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair"></canvas>
      <div className="relative z-10 text-center pointer-events-none p-10 bg-black/50 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] border border-[#10b981]/20">
        <h3 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
          Synthesizing Data
        </h3>
        <p className="font-mono text-[#10b981] text-xs tracking-[0.2em] uppercase">
          Mapping Spatial Geometries for <span className="text-white font-bold">{fileName}</span>
        </p>
        <div className="w-full max-w-md mx-auto h-[2px] bg-white/10 mt-8 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-[#10b981] w-1/3 rounded-full shadow-[0_0_15px_#10b981] animate-[wave-fill_1.5s_ease-in-out_infinite_alternate]"></div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// COMPONENT 4.1: Custom Organic SVG Tree Ring Chart
// ---------------------------------------------------------
const TreeRingData = ({ hdCount, healthyCount }) => {
  const total = hdCount + healthyCount;
  const hdPercentage = (hdCount / total) * 100;
  
  return (
    <div className="relative w-40 h-40 flex items-center justify-center group cursor-pointer">
      <svg viewBox="0 0 100 100" className="w-full h-full transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
        {/* Core */}
        <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="2 1" />
        
        {/* Healthy Rings (Green) */}
        <circle cx="50" cy="50" r="28" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="150 200" className="opacity-40" strokeLinecap="round" transform="rotate(-90 50 50)" />
        <circle cx="50" cy="50" r="36" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="180 200" className="drop-shadow-[0_0_5px_#10b981]" strokeLinecap="round" transform="rotate(45 50 50)" />

        {/* Damaged Rings (Stark White for emphasis against the green/black) */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray={`${(hdPercentage / 100) * 200} 200`} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" strokeLinecap="round" transform="rotate(135 50 50)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-black text-white drop-shadow-lg">{total}</span>
        <span className="text-[8px] font-mono text-gray-400 tracking-widest uppercase">Canopies</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// COMPONENT 4.2: Bark Beetle Pathogen Gallery Animation
// ---------------------------------------------------------
const BeetleGallerySignature = () => {
  return (
    <div className="w-full h-full relative overflow-hidden group">
      <svg viewBox="0 0 200 100" className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity">
        <circle cx="100" cy="50" r="3" fill="#ffffff" className="animate-pulse drop-shadow-[0_0_8px_#ffffff]" />
        {/* Galleries drawn in Green and White */}
        <path d="M 100 50 Q 80 30 50 20 T 10 15" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="100" strokeDashoffset="0" className="animate-[draw_3s_ease-out_infinite_alternate]" />
        <path d="M 100 50 Q 120 70 150 80 T 190 85" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="100" strokeDashoffset="0" className="animate-[draw_3.5s_ease-out_infinite_alternate] drop-shadow-[0_0_5px_#10b981]" />
        <path d="M 100 50 Q 110 20 130 10 T 160 5" fill="none" stroke="#047857" strokeWidth="1" strokeDasharray="80" strokeDashoffset="0" className="animate-[draw_2.5s_ease-out_infinite_alternate]" />
        <path d="M 100 50 Q 90 80 70 90 T 40 95" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="80" strokeDashoffset="0" className="animate-[draw_4s_ease-out_infinite_alternate]" />
      </svg>
      <div className="absolute bottom-2 left-0 w-full text-center">
        <p className="text-[9px] font-mono text-white uppercase tracking-[0.2em] bg-black/80 inline-block px-3 py-1 rounded backdrop-blur-sm border border-white/20">Ips typographus mapped</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// COMPONENT 4: The Organic Forest Dashboard
// ---------------------------------------------------------
const ResultsDashboard = ({ file, onReset, gcpOutputUrl }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-black animate-[blur-reveal_0.5s_ease-out_forwards] flex flex-col items-center py-10 px-6">
    
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity scale-105 animate-[float_30s_linear_infinite_alternate]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
    </div>

    <div className="relative z-10 w-full max-w-7xl">
      <div className="w-full flex justify-between items-end mb-8 border-b border-[#10b981]/20 pb-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg">Biomass Telemetry Extracted</h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded bg-[#10b981]/10 border border-[#10b981]/40 text-[10px] font-mono text-[#10b981] uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.1)]">Pathogen Lock</span>
            <p className="text-xs font-mono text-gray-400 tracking-wider">Target: <span className="text-white bg-white/10 px-2 py-0.5 rounded">{file?.name}</span></p>
          </div>
        </div>
        <button onClick={onReset} className="px-6 py-2.5 rounded-lg border border-white/20 bg-white/5 hover:border-white hover:bg-white hover:text-black transition-all duration-300 text-sm font-bold tracking-wide flex items-center gap-2 group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Terminate Uplink
        </button>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-3 bg-black/40 backdrop-blur-2xl rounded-[2xl] p-3 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 group">
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#10b981]/70 z-30"></div>
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#10b981]/70 z-30"></div>
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#10b981]/70 z-30"></div>
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#10b981]/70 z-30"></div>
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-black/90 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-mono text-white uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
            Live Spatial Render // Alt: 400ft
          </div>

          <div className="relative w-full h-[65vh] bg-[#050505] rounded-xl overflow-hidden flex items-center justify-center">
            <img 
              src={gcpOutputUrl} 
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop"; }}
              alt="GCP Output" 
              className="w-full h-full object-cover relative z-10 opacity-80 transition-transform duration-[10s] ease-linear group-hover:scale-110 grayscale group-hover:grayscale-0" 
            />
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px]">
               <div className="w-full h-[150px] bg-gradient-to-b from-transparent via-[#10b981]/10 to-transparent shadow-[0_10px_30px_rgba(16,185,129,0.1)] opacity-70 animate-scan"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-black/40 backdrop-blur-2xl rounded-2xl p-6 border-l-4 border-l-white relative overflow-hidden shadow-lg border border-white/10 flex flex-col items-center">
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em] mb-4 w-full text-left">Biomass Health Ratio</p>
            <TreeRingData hdCount={12} healthyCount={45} />
            <div className="w-full flex justify-between mt-6 text-xs font-mono">
              <div className="flex flex-col items-center">
                <span className="text-[#10b981] font-bold text-xl drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">45</span>
                <span className="text-gray-500 uppercase tracking-widest text-[8px] mt-1">Healthy</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">12</span>
                <span className="text-gray-500 uppercase tracking-widest text-[8px] mt-1">HD Stage</span>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-2xl rounded-2xl p-6 border-l-4 border-l-[#10b981] flex-grow flex flex-col shadow-lg border border-white/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent z-0"></div>
             <p className="text-[10px] font-mono text-[#10b981] uppercase tracking-[0.2em] mb-2 relative z-10 w-full">Pathogen Gallery Signature</p>
             <p className="text-[10px] text-gray-400 font-light mb-4 relative z-10">Laplacian variance matches bark boring geometries.</p>
             
             <div className="flex-grow w-full bg-black/80 border border-white/10 rounded-lg relative overflow-hidden z-10">
                <BeetleGallerySignature />
             </div>
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
    setTimeout(() => {
      const mockGcpBucketUrl = "https://broken-gcp-link.com/output.jpg"; 
      setGcpOutputUrl(mockGcpBucketUrl);
      setStatus('complete');
    }, 5500); 
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative selection:bg-[#10b981] selection:text-black font-sans">
      <PremiumStyles />
      
      {/* Hide the ambient flow if we are on the dashboard... */}
      {status !== 'complete' && <AmbientFlowBackground />}
      
      {status === 'upload' && (
        <div className="w-full flex flex-col items-center z-10">
          <HeroText />
          <div 
            onClick={() => fileInputRef.current.click()}
            className={`w-full max-w-3xl h-[20rem] rounded-[2rem] bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-500 ease-out cursor-pointer relative overflow-hidden group ${isHovering ? 'border-[#10b981] shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-[#10b981]/5 scale-[1.02]' : 'border border-white/10 hover:border-white/30 hover:bg-white/5'}`}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={(e) => { e.preventDefault(); setIsHovering(false); if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]); }}
          >
            <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files.length > 0) processFile(e.target.files[0]); }} accept="image/png, image/jpeg, image/tiff" className="hidden" />
            <div className={`absolute left-0 w-full h-[1px] bg-[#10b981] shadow-[0_0_20px_#10b981] ${isHovering ? 'animate-scan' : 'hidden'}`}></div>
            <div className="flex flex-col items-center space-y-6 pointer-events-none transition-transform duration-500 group-hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-[#10b981]/50 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-500">
                <svg className={`w-8 h-8 transition-colors duration-300 ${isHovering ? 'text-[#10b981]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white tracking-tight mb-2">{isHovering ? "Deploy Feed" : "Mount Aerial Feed"}</p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">JPG, PNG, TIFF / Max 8MB</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'preview' && (
        <div className="w-full max-w-5xl animate-blur-1 z-10 flex flex-col items-center">
          <div className="w-full flex justify-between items-end mb-6 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-1">Telemetry Mounted</h2>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]"></span>
                <p className="text-xs font-mono text-gray-400 tracking-wider"><span className="text-white uppercase">{file.name}</span> // {formatBytes(file.size)}</p>
              </div>
            </div>
            <button onClick={clearImage} className="px-5 py-2 rounded-lg border border-white/10 bg-black/50 hover:border-white hover:bg-white hover:text-black transition-all duration-300 text-sm font-bold flex items-center gap-2">
              Discard Data
            </button>
          </div>

          <div className="w-full bg-black/40 backdrop-blur-2xl rounded-[2rem] p-3 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 mb-8">
            <div className="relative w-full h-[50vh] bg-[#050505] rounded-[1.5rem] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              <img src={localPreviewUrl} alt="Local Upload" className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>
          
          <button onClick={runAnalysis} className="px-10 py-4 rounded-full bg-white text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-[#10b981] hover:text-white hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
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