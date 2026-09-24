import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Get in Touch</h1>
        <p className="text-xs text-slate-500">Need emergency food dispatch assistance or want to partner with FoodResQ?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-base">Contact Information</h3>
          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Operations Command</p>
                <p>Connaught Place Technology Hub, Delhi NCR</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">24/7 Rescue Hotline</p>
                <p>+91 11 2345 6789</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Email Inquiries</p>
                <p>support@foodresq.org</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <p className="font-bold mb-1">Emergency Large Surplus?</p>
            <p>If you have over 100 meal packets requiring immediate dispatch within 2 hours, call our 24/7 hotline directly.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800">Message Received!</h3>
              <p className="text-xs text-slate-500">Our logistics team will get back to you within 30 minutes.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                <input required type="email" placeholder="john@example.com" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message</label>
                <textarea required rows={4} placeholder="How can we assist you?" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700">
                Send Inquiry
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}