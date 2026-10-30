import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, ArrowRight, RotateCcw, AlertCircle, Sparkles, CheckCircle2, X } from 'lucide-react';

export default function OtpVerificationModal({
  isOpen,
  email,
  onVerify,
  onResend,
  onCancel,
  loading = false,
  error = '',
  previewOtp = null,
  purpose = 'registration'
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setTimer(60);
      setCanResend(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (!isOpen) return;
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer, isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    // Keep only the last character entered and ensure it's a digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-advance to next input if digit entered
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const fullCode = digits.join('');
  const isComplete = fullCode.length === 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isComplete && !loading) {
      onVerify(fullCode);
    }
  };

  const handleAutoFill = () => {
    if (previewOtp && String(previewOtp).length === 6) {
      const otpArray = String(previewOtp).split('');
      setDigits(otpArray);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendClick = async () => {
    if (!canResend || loading) return;
    setTimer(60);
    setCanResend(false);
    setDigits(['', '', '', '', '', '']);
    await onResend();
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Close / Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Verify Your Email</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            We sent a 6-digit verification code to <br />
            <strong className="text-slate-800 font-bold">{email}</strong>
          </p>
        </div>

        {/* Demo Test Code Quick Helper (Shows preview OTP so testing on Vercel is instant) */}
        {previewOtp && (
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Test Code: </span>
                <span className="font-mono font-black tracking-widest text-emerald-700 text-sm bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {previewOtp}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-black rounded-xl border transition-all focus:outline-none ${
                  digit
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 shadow-sm'
                    : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isComplete || loading}
            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Verify & Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend and Change Email controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            Change Email
          </button>

          <div className="text-right">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendClick}
                disabled={loading}
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend Code</span>
              </button>
            ) : (
              <span className="text-slate-400 font-medium">
                Resend code in <strong className="font-bold text-slate-700">{timer}s</strong>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
