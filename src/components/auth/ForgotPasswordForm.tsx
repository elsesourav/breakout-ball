import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { OtpBoxes } from './OtpBoxes';
import { ArcadeButton } from '@elsesourav/react-ui';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSuccess: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Request 6-digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.requestPasswordOtp(identifier);
      if (res.success) {
        setStatusMessage(res.message);
        if (res.testOtp) {
          setOtp(res.testOtp); // Auto-fill for developer convenience
        }
        setStep(2);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 & 3: Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.verifyOtpAndResetPassword(identifier, otp, newPassword);
      if (res.success) {
        setStatusMessage(res.message);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold font-sans text-cyan-300 tracking-wide">
          Password Recovery
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {step === 1
            ? 'Enter your account email or @username'
            : 'Enter the 6-digit OTP code & new password'}
        </p>
      </div>

      {statusMessage && (
        <div className="p-2 mb-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-2 mb-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {errorMessage}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[11px] font-semibold text-slate-300">
              Account Identifier
            </label>
            <input
              type="text"
              placeholder="user@example.com or @username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface/70 border border-border focus:border-primary text-white outline-none transition-all"
            />
          </div>

          <ArcadeButton
            variant="cyan"
            size="md"
            shape="rounded"
            mask={true}
            glow={true}
            isLoading={isLoading}
            onClick={(e) => handleRequestOtp(e as unknown as React.FormEvent)}
            className="w-full mt-2 py-2 text-sm tracking-wider font-bold"
          >
            Send Verification Code
          </ArcadeButton>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-center">
            <label className="text-[11px] font-semibold text-slate-300">
              6-Digit OTP Code
            </label>
            <OtpBoxes value={otp} onChange={setOtp} disabled={isLoading} />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-[11px] font-semibold text-slate-300">New Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 pr-9 text-xs rounded-xl bg-surface/70 border border-border focus:border-primary text-white outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-slate-400 hover:text-white text-xs"
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <ArcadeButton
            variant="magenta"
            size="md"
            shape="rounded"
            mask={true}
            glow={true}
            isLoading={isLoading}
            onClick={(e) => handleResetPassword(e as unknown as React.FormEvent)}
            className="w-full mt-2 py-2 text-sm tracking-wider font-bold"
          >
            Update Password
          </ArcadeButton>
        </form>
      )}

      <div className="text-center mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-cyan-400 font-semibold hover:underline"
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
};
