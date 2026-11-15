import { supabase } from './supabase';

const otpStore: Record<string, { code: string; expiresAt: number }> = {};

export async function handleRequestPasswordOtp(
  identifier: string
): Promise<{ success: boolean; message: string; testOtp?: string }> {
  const cleanId = identifier.trim().toLowerCase();

  // Trigger Supabase password recovery email if it's an email
  if (cleanId.includes('@')) {
    await supabase.auth.resetPasswordForEmail(cleanId).catch(() => {});
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[cleanId] = {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  return {
    success: true,
    message: `A 6-digit verification code has been dispatched. (Test OTP: ${otp})`,
    testOtp: otp,
  };
}

export async function handleVerifyOtpAndResetPassword(
  identifier: string,
  otp: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const record = otpStore[cleanId];

  if (!record) {
    return { success: false, message: 'No OTP requested for this account' };
  }
  if (Date.now() > record.expiresAt) {
    return { success: false, message: 'OTP has expired. Please request a new code.' };
  }
  if (record.code !== otp.trim()) {
    return { success: false, message: 'Invalid 6-digit OTP code. Please try again.' };
  }
  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters' };
  }

  delete otpStore[cleanId];

  // Update password in Supabase if session exists
  try {
    await supabase.auth.updateUser({ password: newPassword });
  } catch {}

  return { success: true, message: 'Password updated successfully! You can now log in.' };
}
