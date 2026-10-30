import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, AlertCircle, ExternalLink, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import OtpVerificationModal from '../../components/OtpVerificationModal';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'donor';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    phone: '',
    organizationName: '',
    organizationType: initialRole === 'donor' ? 'Restaurant' : 'NGO',
    address: 'Connaught Place, Central Delhi',
    city: 'Delhi NCR',
    capacity: 60
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [previewOtp, setPreviewOtp] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const { register, sendOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data && data.database) {
          setDbStatus(data.database);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Request OTP and open verification modal
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();
    const cleanName = formData.name.trim();

    if (!cleanEmail || !cleanPassword || !cleanName) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Send 6-digit OTP code to the provided email
      const res = await sendOtp(cleanEmail, cleanName, 'registration');
      setPreviewOtp(res.previewOtp || null);
      setOtpError('');
      setShowOtpModal(true);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: User submits the 6-digit code from the modal
  const handleVerifyAndCompleteRegister = async (otpCode) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const sanitizedData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        organizationName: (formData.organizationName || formData.name).trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        otp: otpCode
      };

      const res = await register(sanitizedData);
      setShowOtpModal(false);

      if (res.user.role === 'donor') navigate('/donor/dashboard');
      else if (res.user.role === 'recipient') navigate('/recipient/dashboard');
      else navigate('/');
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    try {
      setOtpError('');
      const res = await sendOtp(formData.email.trim(), formData.name.trim(), 'registration');
      if (res.previewOtp) {
        setPreviewOtp(res.previewOtp);
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to resend code');
    }
  };

  return (
    <div
      className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-auth.jpg')" }}
    >
      {/* Dark gradient backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-xl bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-2xl space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30 mb-2">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Create FoodResQ Account</h2>
          <p className="text-xs text-slate-500">Join our surplus food rescue and zero-waste network</p>
        </div>

        {/* Advisory if current deployment is not connected to MongoDB Atlas */}
        {dbStatus && !dbStatus.isMongoConnected && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 space-y-2 shadow-sm">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cloud Database Disconnected on this Domain</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This domain (<code>{typeof window !== 'undefined' ? window.location.hostname : 'current URL'}</code>) is missing <code>MONGODB_URI</code> in Vercel. 
              Registrations here will not be permanently saved. Please register on your live connected app:
            </p>
            <div className="pt-1">
              <a
                href="https://food-res-q-jf52.vercel.app/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <span>Register on Connected App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {typeof window !== 'undefined' && window.location.hostname.includes('-projects.vercel.app') && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Private Preview Link Detected
            </p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Vercel protects preview URLs with authentication. Please register on the official live domain:{' '}
              <a href="https://food-res-q-jf52.vercel.app/register" className="font-bold underline text-amber-900">
                food-res-q-jf52.vercel.app
              </a>
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleInitiateRegister} className="space-y-4">
          
          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'donor', organizationType: 'Restaurant' })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.role === 'donor'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                🍲 Food Donor (Restaurant/Hotel)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'recipient', organizationType: 'NGO' })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.role === 'recipient'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                🤝 Food Recipient (NGO/Shelter)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Full Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@organization.org"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Organization Name</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Taj Caterers / Hope Shelter"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="12 Market Road"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City / Region</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Delhi NCR"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="•••••••• (min 6 characters)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Email & Create Account</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>A 6-digit OTP code will be sent to your email to verify authenticity.</span>
            </p>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Sign in
          </Link>
        </p>

      </div>

      {/* 6-Digit OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        email={formData.email}
        previewOtp={previewOtp}
        loading={otpLoading}
        error={otpError}
        onVerify={handleVerifyAndCompleteRegister}
        onResend={handleResendOtp}
        onCancel={() => setShowOtpModal(false)}
      />
    </div>
  );
}
