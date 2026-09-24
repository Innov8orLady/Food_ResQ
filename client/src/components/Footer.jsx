import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, Heart, Sparkles, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">Food<span className="text-emerald-400">ResQ</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered food rescue and waste intelligence platform. Connecting surplus food from restaurants and hotels with shelters in real-time.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-800 text-[11px] text-emerald-400 font-semibold">
              <Sparkles className="w-3 h-3" /> 5 Active AI Modules
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-emerald-400">About FoodResQ</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400">How It Works</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400">Donor Portal</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400">NGO Network</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400">Emergency Rescue Line</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Intelligence</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>- Computer Vision Recognition</li>
              <li>- Microbiological Risk Engine</li>
              <li>- Weighted Matching Algorithm</li>
              <li>- Time-Series Waste Forecasting</li>
              <li>- Urgent-First TSP Routing</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Contact & Hub</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Delhi NCR & Metro Hubs</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-400" /> support@foodresq.org</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-400" /> +91 11 2345 6789</p>
              <p className="text-[11px] text-emerald-500 font-semibold pt-1">UN SDG 12.3 Aligned (Zero Waste)</p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} FoodResQ Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for sustainable food rescue</p>
        </div>
      </div>
    </footer>
  );
}