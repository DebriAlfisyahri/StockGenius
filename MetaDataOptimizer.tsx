import React, { useState, useEffect } from 'react';
import { GeneratedImage, StockMetadata, ProcessStatus } from '../types';
import { generateAdobeMetadata } from '../services/geminiService';
import { FileText, Copy, Upload, Wand2, Loader2, Check } from 'lucide-react';

interface Props {
  selectedImage: GeneratedImage | null;
}

const MetadataOptimizer: React.FC<Props> = ({ selectedImage }) => {
  const [metadata, setMetadata] = useState<StockMetadata | null>(null);
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [manualDescription, setManualDescription] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (selectedImage) {
        handleAutoGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage]);

  const handleAutoGenerate = async () => {
    setStatus(ProcessStatus.PROCESSING);
    setMetadata(null);
    try {
        const result = await generateAdobeMetadata(
            selectedImage ? selectedImage.base64Data : null, 
            manualDescription
        );
        setMetadata(result);
        setStatus(ProcessStatus.COMPLETED);
    } catch (e) {
        console.error(e);
        setStatus(ProcessStatus.ERROR);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyKeywords = () => {
    if (metadata) {
        copyToClipboard(metadata.keywords.join(', '), 'keywords');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6">
      <div className="bg-adobe-panel p-4 rounded-lg border border-gray-700">
        <h2 className="text-lg font-semibold flex items-center text-white mb-4">
          <Wand2 className="w-5 h-5 mr-2 text-adobe-blue" />
          Metadata Optimizer
        </h2>

        {/* Preview Section */}
        <div className="mb-4 flex gap-4">
            {selectedImage ? (
                <div className="w-24 h-24 rounded bg-black flex-shrink-0 overflow-hidden border border-gray-600">
                    <img 
                        src={`data:image/png;base64,${selectedImage.base64Data}`} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-24 h-24 rounded bg-[#111] flex-shrink-0 border border-gray-700 flex items-center justify-center text-gray-600 text-xs text-center p-2">
                    <Upload className="w-6 h-6 mb-1 mx-auto" />
                    Select from Images or Describe
                </div>
            )}
            
            <div className="flex-1">
                 {!selectedImage && (
                     <textarea
                        value={manualDescription}
                        onChange={(e) => setManualDescription(e.target.value)}
                        placeholder="Or describe image here to generate tags..."
                        className="w-full h-24 bg-black/30 border border-gray-600 rounded p-2 text-sm text-gray-300 focus:border-adobe-blue outline-none resize-none"
                     />
                 )}
                 {selectedImage && (
                    <p className="text-xs text-gray-400 italic h-24 overflow-y-auto">
                        Generating metadata for selected image...
                    </p>
                 )}
            </div>
        </div>

        <button 
            onClick={handleAutoGenerate}
            disabled={status === ProcessStatus.PROCESSING || (!selectedImage && !manualDescription)}
            className="w-full bg-adobe-blue hover:bg-adobe-hover disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition flex justify-center items-center"
        >
             {status === ProcessStatus.PROCESSING ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
                'Generate Metadata'
            )}
        </button>
      </div>

      {/* Results Section */}
      {metadata && (
        <div className="space-y-4 animate-fade-in">
             <div className="bg-[#222] p-4 rounded border border-gray-800">
                <div className="flex justify-between items-start mb-1">
                    <label className="text-xs uppercase text-gray-500 font-bold">Title (Title Case)</label>
                    <button 
                        onClick={() => copyToClipboard(metadata.title, 'title')}
                        className={`text-xs flex items-center ${copiedField === 'title' ? 'text-green-400' : 'text-adobe-blue hover:text-white'}`}
                    >
                        {copiedField === 'title' ? <Check className="w-3 h-3 mr-1"/> : <Copy className="w-3 h-3 mr-1"/>}
                        {copiedField === 'title' ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <p className="text-sm text-white font-medium">{metadata.title}</p>
             </div>

             <div className="bg-[#222] p-4 rounded border border-gray-800">
                <div className="flex justify-between items-start mb-1">
                    <label className="text-xs uppercase text-gray-500 font-bold">Category</label>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                        {metadata.category}
                    </span>
                </div>
             </div>

             <div className="bg-[#222] p-4 rounded border border-gray-800">
                <div className="flex justify-between items-start mb-2">
                    <label className="text-xs uppercase text-gray-500 font-bold">Keywords ({metadata.keywords.length})</label>
                    <button 
                        onClick={copyKeywords}
                        className={`text-xs flex items-center ${copiedField === 'keywords' ? 'text-green-400' : 'text-adobe-blue hover:text-white'}`}
                    >
                        {copiedField === 'keywords' ? <Check className="w-3 h-3 mr-1"/> : <Copy className="w-3 h-3 mr-1"/>}
                        {copiedField === 'keywords' ? 'Copy All' : 'Copy All'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {metadata.keywords.map((k, i) => (
                        <span key={i} className="text-xs bg-black/50 text-gray-300 px-2 py-1 rounded border border-gray-700">
                            {k}
                        </span>
                    ))}
                </div>
             </div>

             <div className="bg-yellow-900/20 border border-yellow-800 p-3 rounded text-xs text-yellow-500">
                <p className="font-bold mb-1">Adobe Stock Integration</p>
                In the real extension, clicking "Copy" would automatically fill the input fields on the contributor portal.
             </div>
        </div>
      )}
    </div>
  );
};

export default MetadataOptimizer;
