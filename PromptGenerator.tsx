import React, { useState } from 'react';
import { GeneratedPrompt, ProcessStatus } from '../types';
import { generateStockPrompts } from '../services/geminiService';
import { Sparkles, Copy, ArrowRight, Loader2, Trash2 } from 'lucide-react';

interface Props {
  onPromptsGenerated: (prompts: GeneratedPrompt[]) => void;
  existingPrompts: GeneratedPrompt[];
}

const PromptGenerator: React.FC<Props> = ({ onPromptsGenerated, existingPrompts }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [mood, setMood] = useState('Bright, Professional, Commercial');
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);

  const handleGenerate = async () => {
    if (!topic) return;
    setStatus(ProcessStatus.PROCESSING);
    try {
      const rawPrompts = await generateStockPrompts(topic, count, mood);
      const newPrompts: GeneratedPrompt[] = rawPrompts.map(p => ({
        id: crypto.randomUUID(),
        text: p,
        selected: true
      }));
      onPromptsGenerated([...existingPrompts, ...newPrompts]);
      setStatus(ProcessStatus.COMPLETED);
    } catch (e) {
      console.error(e);
      setStatus(ProcessStatus.ERROR);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6">
      <div className="bg-adobe-panel p-4 rounded-lg border border-gray-700 space-y-4">
        <h2 className="text-lg font-semibold flex items-center text-white">
          <Sparkles className="w-5 h-5 mr-2 text-adobe-blue" />
          Bulk Prompt Creator
        </h2>
        
        <div>
          <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Topic / Niche</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-black/30 border border-gray-600 rounded p-2 text-sm focus:border-adobe-blue outline-none text-white"
            placeholder="e.g. Corporate business meeting, diverse team"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Quantity</label>
            <input 
              type="number" 
              value={count}
              min={1}
              max={20}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full bg-black/30 border border-gray-600 rounded p-2 text-sm focus:border-adobe-blue outline-none text-white"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Mood / Style</label>
            <input 
              type="text" 
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-black/30 border border-gray-600 rounded p-2 text-sm focus:border-adobe-blue outline-none text-white"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={status === ProcessStatus.PROCESSING || !topic}
          className="w-full bg-adobe-blue hover:bg-adobe-hover disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition flex justify-center items-center"
        >
          {status === ProcessStatus.PROCESSING ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Prompts...</>
          ) : (
            'Generate Prompts'
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-400 uppercase">Queue ({existingPrompts.length})</h3>
          {existingPrompts.length > 0 && (
            <button 
              onClick={() => onPromptsGenerated([])}
              className="text-xs text-red-400 hover:text-red-300 flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Clear All
            </button>
          )}
        </div>
        
        {existingPrompts.map((p, idx) => (
          <div key={p.id} className="bg-[#222] p-3 rounded border border-gray-800 hover:border-gray-600 transition group relative">
            <p className="text-sm text-gray-300 pr-8">{p.text}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
              <button 
                onClick={() => navigator.clipboard.writeText(p.text)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400"
                title="Copy"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {existingPrompts.length === 0 && (
          <div className="text-center text-gray-600 py-8 text-sm italic">
            No prompts generated yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptGenerator;
