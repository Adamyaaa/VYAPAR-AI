import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VoiceRecorder } from './VoiceRecorder';

describe('VoiceRecorder', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('walks through idle -> recording -> transcribing -> done, then calls onTranscribed', async () => {
    const onTranscribed = vi.fn();
    render(<VoiceRecorder onTranscribed={onTranscribed} />);

    expect(screen.getByText(/tap to record/i)).toBeInTheDocument();

    const button = screen.getByRole('button');
    fireEvent.click(button); // idle -> recording
    expect(screen.getByText(/listening/i)).toBeInTheDocument();
    expect(onTranscribed).not.toHaveBeenCalled();

    fireEvent.click(button); // recording -> transcribing
    expect(screen.getByText(/transcribing/i)).toBeInTheDocument();
    expect(button).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    expect(onTranscribed).toHaveBeenCalledTimes(1);
    const [transcript, voiceUrl] = onTranscribed.mock.calls[0];
    expect(typeof transcript).toBe('string');
    expect(transcript.length).toBeGreaterThan(0);
    expect(voiceUrl).toMatch(/^simulated:\/\//);
    expect(screen.getByText(/audio attached/i)).toBeInTheDocument();
  });

  it('does not fire onTranscribed while idle or mid-recording', () => {
    const onTranscribed = vi.fn();
    render(<VoiceRecorder onTranscribed={onTranscribed} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onTranscribed).not.toHaveBeenCalled();
  });
});
