import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

type VoiceState = 'idle' | 'recording' | 'transcribing' | 'done';

interface VoiceRecorderProps {
  onTranscribed: (transcript: string, voiceUrl: string) => void;
}

// Simulated end-to-end — no real mic capture or STT provider wired up yet
// (Phase 3 of the roadmap; needs a speech-to-text API key). The state machine
// and callback shape are deliberately what a real provider would slot into:
// idle -> recording -> transcribing -> done, ending in the same
// (transcript, voiceUrl) callback a real pipeline would produce.
const SIMULATED_TRANSCRIPTS = [
  'Five hundred rupees credit for rice and sugar',
  'Received two thousand rupees payment',
  'Three hundred rupees for milk and bread, pending',
];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscribed }) => {
  const [state, setState] = useState<VoiceState>('idle');

  const handleClick = () => {
    if (state === 'idle' || state === 'done') {
      setState('recording');
      return;
    }
    if (state === 'recording') {
      setState('transcribing');
      window.setTimeout(() => {
        const transcript = SIMULATED_TRANSCRIPTS[Math.floor(Math.random() * SIMULATED_TRANSCRIPTS.length)];
        const voiceUrl = `simulated://voice-note-${Date.now()}`;
        onTranscribed(transcript, voiceUrl);
        setState('done');
      }, 900);
    }
  };

  return (
    <div className="bg-surface-2 border border-border-soft rounded-md p-4 flex items-center gap-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'transcribing'}
        className={`relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors disabled:cursor-wait ${
          state === 'recording' ? 'bg-rose text-white' : 'bg-indigo-soft text-indigo hover:bg-indigo/20'
        }`}
      >
        {state === 'recording' && (
          <span className="absolute inset-0 rounded-full border border-rose animate-ping" />
        )}
        {state === 'recording' ? <Square size={16} /> : <Mic size={17} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink">Voice ledger entry</p>
        <p className="text-[11px] text-ink-faint mt-0.5">
          {state === 'idle' && 'Tap to record a note instead of typing'}
          {state === 'recording' && 'Listening…'}
          {state === 'transcribing' && 'Transcribing…'}
          {state === 'done' && 'Audio attached — review the note below'}
        </p>
      </div>

      {state === 'recording' && (
        <div className="flex items-end gap-0.5 h-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="w-1 bg-rose rounded-full"
              animate={{ height: [4, 16, 6, 20, 4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
