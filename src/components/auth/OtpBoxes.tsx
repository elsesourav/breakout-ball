import React, { useRef } from 'react';

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
      const focusIndex = Math.min(5, index + pasted.length);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    newDigits[index] = clean;
    onChange(newDigits.join(''));

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
      const nextFocus = Math.min(5, pasted.length);
      inputsRef.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center items-center my-3">
      {Array.from({ length: 6 }).map((_, i) => (
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
          className="w-10 h-12 text-center text-lg font-bold font-mono text-cyan-300 bg-surface/80 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all shadow-inner"
        />
      ))}
    </div>
  );
};
