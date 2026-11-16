import React, { useRef } from 'react';
import { soundManager } from '../../audio';

interface OtpBoxesProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export const OtpBoxes: React.FC<OtpBoxesProps> = ({ value, onChange, disabled }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }).map((_, i) => value[i] || '');

  const handleChange = (index: number, char: string) => {
    if (disabled) return;
    const clean = char.replace(/[^0-9]/g, '');
    const newDigits = [...digits];

    if (clean.length > 1) {
      // Pasted multiple digits
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((d, idx) => {
        if (index + idx < 6) newDigits[index + idx] = d;
      });
      onChange(newDigits.join(''));
      soundManager.playClick();
      const focusIndex = Math.min(5, index + pasted.length);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    newDigits[index] = clean;
    onChange(newDigits.join(''));
    if (clean) soundManager.playClick();

    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      soundManager.playClick();
      const nextFocus = Math.min(5, pasted.length);
      inputsRef.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex gap-1.5 justify-center items-center my-2.5">
      {Array.from({ length: 6 }).map((_, i) => {
        const isFilled = !!digits[i];
        return (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i] || ''}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-9 h-11 text-center font-display font-black text-base rounded-xl outline-none transition-all ${
              isFilled
                ? 'bg-[#0a1236] border-cyan-400 text-[#00f7ff] shadow-[0_0_10px_rgba(0,247,255,0.3)]'
                : 'bg-[#060a1f] border-cyan-500/30 text-white placeholder:text-slate-600'
            } border focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]`}
          />
        );
      })}
    </div>
  );
};
