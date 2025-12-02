import React, { useState, useEffect } from 'react';
import { AppTab, GeneratedPrompt, GeneratedImage } from './types';
import PromptGenerator from './components/PromptGenerator';
import ImageAutomator from './components/ImageAutomator';
import MetadataOptimizer from './components/MetadataOptimizer';
import { LayoutGrid, Image, Tags, FileCode2, Key } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.PROMPTS);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [selectedImageForMetadata, setSelectedImageForMetadata] = useState<GeneratedImage | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    setCheckingKey(true);
    try {
      // Cast window to any to access injected aistudio object
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for dev environments without the special window object
        setHasApiKey(!!process.env.API_KEY);
      }
    } catch (e) {
      console.error("Error checking API key", e);
    } finally {
      setCheckingKey(false);
    }
  };

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
      // Assume success after dialog interaction to mitigate race condition
      setHasApiKey(true); 
    }
  };

  const handleNavigateToMetadata = (img: GeneratedImage) => {
    setSelectedImageForMetadata(img);
    setActiveTab(AppTab.METADATA);
  };

  if (checkingKey) {
    return <div className="h-screen w-full bg-[#1e1e1e] flex items-center justify-center text-gray-400">Loading...</div>;
  }

  if (!hasApiKey) {
    return (
      <div className="h-screen w-full bg-[#1e1e1e] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="bg-adobe-panel p-4 rounded-full">
            <Key className="w-12 h-12 text-adobe-blue" />
        </div>
        <h1 className="text-2xl font-bold text-white">API Key Required</h1>
        <p className="text-gray-400 max-w-sm">
            To use the advanced Image Generation (Gemini 3.0 Pro) and Metadata features, please select a paid API key.
        </p>
        <button 
            onClick={handleSelectKey}
            className="bg-adobe-blue hover:bg-adobe-hover text-white font-bold py-3 px-8 rounded-lg transition"
        >
            Select API Key
        </button>
        <div className="text-xs text-gray-500 mt-4">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">
                 Billing Information
             </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-200 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#181818] border-b border-black shadow-lg z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-adobe-blue p-1.5 rounded">
             <FileCode2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">Stock<span className="text-adobe-blue">Genius</span></h1>
        </div>
        <div className="text-xs text-gray-500">v1.1.0</div>
      </header>

      {/* Tabs */}
      <nav className="flex bg-[#252525] border-b border-gray-800">
        <button
          onClick={() => setActiveTab(AppTab.PROMPTS)}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center transition-colors ${
            activeTab === AppTab.PROMPTS ? 'bg-[#2a2a2a] text-adobe-blue border-b-2 border-adobe-blue' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4 mr-2" /> Prompts
        </button>
        <button
          onClick={() => setActiveTab(AppTab.IMAGES)}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center transition-colors ${
            activeTab === AppTab.IMAGES ? 'bg-[#2a2a2a] text-adobe-blue border-b-2 border-adobe-blue' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Image className="w-4 h-4 mr-2" /> Images ({prompts.length})
        </button>
        <button
          onClick={() => setActiveTab(AppTab.METADATA)}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center transition-colors ${
            activeTab === AppTab.METADATA ? 'bg-[#2a2a2a] text-adobe-blue border-b-2 border-adobe-blue' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Tags className="w-4 h-4 mr-2" /> Metadata
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === AppTab.PROMPTS && (
          <PromptGenerator 
            onPromptsGenerated={setPrompts} 
            existingPrompts={prompts} 
          />
        )}
        {activeTab === AppTab.IMAGES && (
          <ImageAutomator 
            prompts={prompts}
            onSelectImageForMetadata={handleNavigateToMetadata}
          />
        )}
        {activeTab === AppTab.METADATA && (
          <MetadataOptimizer 
            selectedImage={selectedImageForMetadata}
          />
        )}
      </main>
      
      {/* Footer / Status Bar */}
      <footer className="bg-[#181818] border-t border-black px-4 py-2 text-[10px] text-gray-500 flex justify-between">
         <span>Simulating Chrome Extension Environment</span>
         <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Key Active
         </span>
      </footer>
    </div>
  );
};

export default App;
