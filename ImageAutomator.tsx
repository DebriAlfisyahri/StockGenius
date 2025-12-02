import React, { useState, useEffect } from 'react';
import { GeneratedPrompt, GeneratedImage } from '../types';
import { generateStockImage } from '../services/geminiService';
import { Play, Pause, Download, Image as ImageIcon, CheckCircle, AlertCircle, Maximize, Settings } from 'lucide-react';

interface Props {
  prompts: GeneratedPrompt[];
  onSelectImageForMetadata: (image: GeneratedImage) => void;
}

const ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"];

const ImageAutomator: React.FC<Props> = ({ prompts, onSelectImageForMetadata }) => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("4:3");

  // Auto-Runner Effect
  useEffect(() => {
    let active = true;

    const runQueue = async () => {
      if (!isAutoRunning || currentPromptIndex >= prompts.length) {
        setIsAutoRunning(false);
        return;
      }

      const prompt = prompts[currentPromptIndex];
      
      try {
        const base64 = await generateStockImage(prompt.text, aspectRatio);
        if (active) {
            const newImage: GeneratedImage = {
                id: crypto.randomUUID(),
                prompt: prompt.text,
                base64Data: base64,
                timestamp: Date.now()
            };
            setImages(prev => [newImage, ...prev]);
        }
      } catch (err) {
        console.error("Failed to generate image for prompt", prompt.id, err);
      } finally {
        if (active) {
            setCurrentPromptIndex(prev => prev + 1);
            setProgress(((currentPromptIndex + 1) / prompts.length) * 100);
        }
      }
    };

    if (isAutoRunning) {
        runQueue();
    }

    return () => { active = false; };
  }, [isAutoRunning, currentPromptIndex, prompts, aspectRatio]);

  const toggleAutoRun = () => {
    if (prompts.length === 0) return;
    setIsAutoRunning(!isAutoRunning);
  };

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${img.base64Data}`;
    link.download = `stock-ai-${img.timestamp}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Control Panel */}
      <div className="bg-adobe-panel p-4 border-b border-gray-700 flex flex-col gap-3">
        <div className="flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-adobe-blue" />
                Auto Image Executor
            </h2>
            <span className="text-xs text-gray-400">
                {currentPromptIndex} / {prompts.length} Prompts
            </span>
        </div>

        <div className="flex gap-2 items-center bg-black/20 p-2 rounded border border-gray-700">
             <Settings className="w-4 h-4 text-gray-400" />
             <label className="text-xs text-gray-300 font-bold uppercase mr-2">Aspect Ratio:</label>
             <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                disabled={isAutoRunning}
                className="bg-[#333] text-white text-xs border border-gray-600 rounded px-2 py-1 outline-none focus:border-adobe-blue"
             >
                {ASPECT_RATIOS.map(ratio => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                ))}
             </select>
        </div>

        {prompts.length === 0 ? (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-3 rounded text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                No prompts in queue. Go to "Prompts" tab first.
            </div>
        ) : (
            <>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                        className="bg-adobe-blue h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <button
                    onClick={toggleAutoRun}
                    className={`flex items-center justify-center w-full py-2 rounded font-bold text-sm transition ${
                        isAutoRunning 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    {isAutoRunning ? (
                        <><Pause className="w-4 h-4 mr-2" /> Pause Queue</>
                    ) : (
                        <><Play className="w-4 h-4 mr-2" /> Start Auto-Generation</>
                    )}
                </button>
            </>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
            {images.map((img) => (
                <div key={img.id} className="group relative bg-black rounded-lg overflow-hidden border border-gray-800">
                    <img 
                        src={`data:image/png;base64,${img.base64Data}`} 
                        alt="AI Generated" 
                        className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white backdrop-blur-sm">
                        {aspectRatio}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition flex justify-between items-end">
                        <button 
                            onClick={() => handleDownload(img)}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-white"
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onSelectImageForMetadata(img)}
                            className="p-1.5 bg-adobe-blue hover:bg-blue-600 rounded-full text-white"
                            title="Optimize Metadata"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
            {images.length === 0 && prompts.length > 0 && (
                <div className="col-span-2 text-center text-gray-500 py-10 text-sm">
                    Press "Start" to begin generating images from your prompt queue.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageAutomator;
