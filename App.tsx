import React, { useState, useCallback, useRef } from 'react';
import { Icons } from './constants';
import { Slider } from './components/Slider';
import { CanvasWorkspace, CanvasWorkspaceHandle } from './components/CanvasWorkspace';
import { GradientSettings } from './types';

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>('image.png');
  const [settings, setSettings] = useState<GradientSettings>({
    angle: 180,
    startPoint: 20,
    endPoint: 80,
    invert: false,
    type: 'linear'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<CanvasWorkspaceHandle>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            setImage(img);
            setFileName(file.name);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (workspaceRef.current) {
        const dataUrl = workspaceRef.current.toDataURL();
        if (dataUrl) {
            const link = document.createElement('a');
            
            // Logic to preserve filename but force PNG extension
            // We strip the last extension if it exists and append -fade.png
            const nameParts = fileName.split('.');
            if (nameParts.length > 1) {
                nameParts.pop(); // remove existing extension
            }
            const base = nameParts.join('.');
            
            // Always export as PNG to support transparency
            link.download = `${base}-fade.png`;
            link.href = dataUrl;
            link.click();
        }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const resetSettings = () => {
      setSettings({
        angle: 180,
        startPoint: 20,
        endPoint: 80,
        invert: false,
        type: 'linear'
      });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
            <h1 className="font-bold text-xl tracking-tight text-slate-100">FadeForge</h1>
        </div>
        <div className="flex items-center gap-4">
             <button 
                onClick={triggerUpload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
                <Icons.Upload />
                <span>Upload New</span>
            </button>
            <button 
                onClick={handleDownload}
                disabled={!image}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all shadow-lg shadow-blue-500/20
                    ${!image 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-primary-600 hover:bg-primary-500 text-white hover:shadow-blue-500/40'
                    }`}
            >
                <Icons.Download />
                <span>Export PNG</span>
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Controls */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto z-10">
            <div className="p-6">
                
                {/* File Info */}
                {image ? (
                    <div className="mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-start gap-3">
                         <div className="shrink-0 w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                             <Icons.Image />
                         </div>
                         <div className="overflow-hidden">
                             <p className="text-sm font-medium text-white truncate">{fileName}</p>
                             <p className="text-xs text-slate-400">{image.width} × {image.height}px</p>
                         </div>
                         <button onClick={() => setImage(null)} className="ml-auto text-slate-500 hover:text-red-400">
                             <Icons.X />
                         </button>
                    </div>
                ) : (
                    <div 
                        onClick={triggerUpload}
                        className="mb-8 border-2 border-dashed border-slate-700 hover:border-primary-500/50 hover:bg-slate-800/50 rounded-xl p-8 flex flex-col items-center text-center cursor-pointer transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-primary-500/10 flex items-center justify-center mb-3 transition-colors text-slate-400 group-hover:text-primary-500">
                            <Icons.Upload />
                        </div>
                        <p className="text-sm font-medium text-slate-300">Click to Upload</p>
                        <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP supported</p>
                    </div>
                )}

                {/* Controls Form */}
                <div className={`transition-opacity duration-300 ${!image ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Gradient Controls</h2>
                        <button onClick={resetSettings} title="Reset" className="text-slate-500 hover:text-white">
                            <Icons.Refresh />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <Slider 
                            label="Angle" 
                            value={settings.angle} 
                            min={0} 
                            max={360} 
                            unit="°"
                            onChange={(v) => setSettings(s => ({...s, angle: v}))} 
                        />

                        <div className="space-y-4 pt-2 border-t border-slate-800/50">
                            <p className="text-xs text-slate-500 mb-2">Transition Zone</p>
                            <Slider 
                                label="Fade Start (Opaque)" 
                                value={settings.startPoint} 
                                min={0} 
                                max={100} 
                                unit="%"
                                onChange={(v) => setSettings(s => ({...s, startPoint: v}))} 
                            />
                            
                            <Slider 
                                label="Fade End (Transparent)" 
                                value={settings.endPoint} 
                                min={0} 
                                max={100} 
                                unit="%"
                                onChange={(v) => setSettings(s => ({...s, endPoint: v}))} 
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-800/50">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.invert ? 'bg-primary-600 border-primary-600' : 'border-slate-600 bg-slate-800'}`}>
                                    {settings.invert && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={settings.invert}
                                    onChange={(e) => setSettings(s => ({...s, invert: e.target.checked}))}
                                />
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Invert Gradient Direction</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-auto p-6 border-t border-slate-800 text-xs text-slate-600 text-center">
                <p>Processed locally in your browser.</p>
            </div>
        </aside>

        {/* Center Canvas Area */}
        <section className="flex-1 bg-slate-950 relative">
             {/* Grid pattern overlay for tech feel */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
             />
             <CanvasWorkspace ref={workspaceRef} image={image} settings={settings} />
        </section>

        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
        />
      </main>
    </div>
  );
}