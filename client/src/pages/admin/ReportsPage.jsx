import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Impact & Verification Reports</h1>
          <p className="text-xs text-slate-500">Official certificates and audit logs for ESG and sustainability compliance</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 print:border-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">FoodResQ Platform Impact Statement</h2>
            <p className="text-xs text-slate-400 mt-0.5">Report Reference: FR-2026-DELHI-09</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            🌱
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="text-2xl font-black text-emerald-600">2,850</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Meals Rescued</p>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">1,425 kg</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Food Waste Prevented</p>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600">3,560 kg</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">CO₂ Offset</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <h4 className="font-bold text-slate-800 text-sm">Methodology & Standard:</h4>
          <p>
            Impact calculated using standardized waste diversion multipliers aligned with UN FAO and WRI guidelines:
            1 meal rescued ≈ 0.50 kg solid food waste diverted from municipal landfill methane emissions; 1 kg diverted food waste ≈ 2.50 kg CO₂ equivalent emissions averted.
          </p>
          <p>
            Safety verified via FoodResQ Automated Microbial Risk Engine adhering to US FDA Danger Zone criteria and FSSAI hygienic standards.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Signed: FoodResQ Central Operations</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}