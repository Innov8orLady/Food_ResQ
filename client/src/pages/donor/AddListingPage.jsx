import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RiskBadge from '../../components/RiskBadge';
import {
  UtensilsCrossed, Sparkles, AlertCircle, Clock, ShieldAlert,
  CheckCircle2, UploadCloud, Image as ImageIcon, X, Check
} from 'lucide-react';

const SAMPLE_IMAGES = [
  {
    name: 'Woodfired Margherita Pizza',
    category: 'Cooked Meals',
    dietary: 'Vegetarian',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60'
  },
  {
    name: 'Rice, Dal and Curry Meal',
    category: 'Cooked Meals',
    dietary: 'Vegetarian',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60'
  },
  {
    name: 'Artisan Bakery and Fresh Bread',
    category: 'Bakery & Bread',
    dietary: 'Vegetarian',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=60'
  },
  {
    name: 'Fresh Fruits and Farm Produce',
    category: 'Fresh Produce',
    dietary: 'Vegan',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=60'
  },
  {
    name: 'Paneer Butter Masala Trays',
    category: 'Cooked Meals',
    dietary: 'Vegetarian',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60'
  }
];

export default function AddListingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(SAMPLE_IMAGES[0].url);

  const [form, setForm] = useState({
    foodName: '',
    category: 'Cooked Meals',
    quantity: '',
    unit: 'meals/packets',
    preparationTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 16),
    availableUntil: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 16),
    storageCondition: 'Room Temperature',
    packagingType: 'Sealed Food Containers',
    dietaryType: 'Vegetarian',
    description: '',
    image: SAMPLE_IMAGES[0].url
  });

  // Dynamic AI Risk State (Module 2)
  const [aiRisk, setAiRisk] = useState({
    riskScore: 25,
    riskLevel: 'LOW',
    urgency: 'NORMAL',
    remainingSafeHours: 5.5,
    suggestedAction: 'Safe for distribution within normal operating timelines.'
  });

  // Dynamic AI Recognition Suggestion (Module 1)
  const [aiVision, setAiVision] = useState(null);

  // Recalculate AI Risk whenever relevant inputs change
  useEffect(() => {
    const calculateRisk = async () => {
      try {
        const res = await api.post('/ai/risk-prediction', {
          foodName: form.foodName,
          category: form.category,
          preparationTime: form.preparationTime,
          storageCondition: form.storageCondition,
          packagingType: form.packagingType,
          dietaryType: form.dietaryType
        });
        if (res.data.success) {
          setAiRisk(res.data.result);
        }
      } catch (err) {
        // silent fallback
      }
    };
    calculateRisk();
  }, [form.foodName, form.category, form.preparationTime, form.storageCondition, form.packagingType, form.dietaryType]);

  // Handle local file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // Upload to server
    setUploadingImage(true);
    setAiAnalyzing(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadRes = await api.post('/food/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (uploadRes.data?.success && typeof uploadRes.data?.imageUrl === 'string') {
        const serverUrl = uploadRes.data.imageUrl;
        setForm(prev => ({ ...prev, image: serverUrl }));
        await triggerAiRecognition(file.name, serverUrl);
      } else {
        console.warn('Upload did not return a valid imageUrl string:', uploadRes.data);
        await triggerAiRecognition(file.name, localUrl);
      }
    } catch (err) {
      console.warn('Server upload failed, using local preview for demo', err);
      setForm(prev => ({ ...prev, image: localUrl }));
      await triggerAiRecognition(file.name, localUrl);
    } finally {
      setUploadingImage(false);
      setAiAnalyzing(false);
    }
  };

  // Trigger AI Recognition on selected image or hint
  const triggerAiRecognition = async (textHint = '', activeImageUrl = null) => {
    setAiAnalyzing(true);
    const imageToAnalyze = activeImageUrl !== null ? activeImageUrl : form.image;
    try {
      const res = await api.post('/ai/food-recognition', {
        textHint: textHint || form.foodName || '',
        imageName: imageToAnalyze || '',
        filename: textHint || ''
      });
      if (res.data.success) {
        const v = res.data.result;
        setAiVision(v);
        setForm(prev => ({
          ...prev,
          foodName: v.detectedItem,
          category: v.category,
          dietaryType: v.dietaryType
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Select a preset sample image
  const selectSampleImage = (sample) => {
    setImagePreview(sample.url);
    setForm(prev => ({
      ...prev,
      image: sample.url,
      foodName: sample.name,
      category: sample.category,
      dietaryType: sample.dietary
    }));
    triggerAiRecognition(sample.name, sample.url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/food', form);
      if (res.data.success) {
        navigate('/donor/listings');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900">List Surplus Food</h1>
        <p className="text-xs text-slate-500">
          Upload food photos for AI computer vision classification and predictive spoilage risk estimation.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column (2/3) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          
          {/* ============================================================ */}
          {/* IMAGE UPLOAD & AI RECOGNITION SECTION */}
          {/* ============================================================ */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Food Image and AI Recognition
            </label>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="food-photo-upload"
            />

            {/* Drag & Drop / Click Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-5 text-center cursor-pointer transition-all group relative overflow-hidden"
            >
              {imagePreview ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Food Preview"
                    className="w-28 h-28 object-cover rounded-xl border border-emerald-200 shadow-sm shrink-0"
                  />
                  <div className="text-left space-y-1.5 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Photo Uploaded and Analyzed
                    </div>
                    <p className="text-xs text-slate-600">
                      Click to replace photo or choose a different image file from your device.
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm inline-flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                      Browse / Upload Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Click to upload food photo or drag and drop</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sample Photos Selector */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Or pick a sample food item:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSampleImage(sample)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                  >
                    {sample.name.split(' ')[0]} {sample.name.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Module 1 Analysis Feedback Card */}
            {aiVision && (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> AI Vision Classification Result
                  </span>
                  <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                    {aiVision.confidence}% AI Confidence
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{aiVision.detectedItem}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">{aiVision.explanation}</p>
                
                {/* Neural Network Top Alternative Candidates */}
                {aiVision.topCandidates && aiVision.topCandidates.length > 1 && (
                  <div className="pt-2 border-t border-emerald-200/70">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Neural Net Candidate Probabilities (Click to select):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiVision.topCandidates.map((cand, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setForm(prev => ({
                              ...prev,
                              foodName: cand.name,
                              category: cand.category
                            }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            form.foodName === cand.name
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                              : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {cand.name.split('/')[0]} ({cand.confidence}%)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {(aiVision.tags || []).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* ============================================================ */}
          {/* FOOD DETAILS FIELDS (Auto-populated by AI, fully editable) */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">Food Name</label>
              <span className="text-[11px] text-slate-400">Auto-filled by AI / Editable</span>
            </div>
            <input
              type="text"
              required
              value={form.foodName}
              onChange={(e) => setForm({ ...form, foodName: e.target.value })}
              placeholder="e.g. Steamed Rice, Dal Makhani and Roti Combo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Food Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Dairy Products">Dairy Products</option>
                <option value="Packaged Foods">Packaged Foods</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dietary Type</label>
              <select
                value={form.dietaryType}
                onChange={(e) => setForm({ ...form, dietaryType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="meals/packets">meals/packets</option>
                <option value="servings">servings</option>
                <option value="kg">kg</option>
                <option value="boxes">boxes</option>
                <option value="liters">liters</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Storage Condition</label>
              <select
                value={form.storageCondition}
                onChange={(e) => setForm({ ...form, storageCondition: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Room Temperature">Room Temperature</option>
                <option value="Refrigerated">Refrigerated</option>
                <option value="Hot Holding (>60°C)">Hot Holding (&gt;60°C)</option>
                <option value="Deep Freeze">Deep Freeze</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Packaging Type</label>
              <select
                value={form.packagingType}
                onChange={(e) => setForm({ ...form, packagingType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Sealed Food Containers">Sealed Food Containers</option>
                <option value="Foil Wrapped">Foil Wrapped</option>
                <option value="Commercial Packaging">Commercial Packaging</option>
                <option value="Open Bulk Tray">Open Bulk Tray</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preparation Time</label>
              <input
                type="datetime-local"
                value={form.preparationTime}
                onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Available Until</label>
              <input
                type="datetime-local"
                required
                value={form.availableUntil}
                onChange={(e) => setForm({ ...form, availableUntil: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Additional Notes / Allergen Info</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Prepared for banquet buffet. Sealed in commercial food grade containers. Contains dairy."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing Listing...' : 'Publish Surplus Listing'}
          </button>
        </form>

        {/* Real-time AI Risk Prediction Card (1/3) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Risk Engine (Module 2)
              </span>
              <RiskBadge riskLevel={aiRisk.riskLevel} urgency={aiRisk.urgency} riskScore={aiRisk.riskScore} />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Estimated Safe Window</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  ~{aiRisk.remainingSafeHours} <span className="text-xs font-normal text-slate-500">hours remaining</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <p className="font-bold text-slate-800">Suggested Protocol:</p>
                <p className="text-slate-600 leading-relaxed">{aiRisk.suggestedAction}</p>
              </div>

              <div className="text-[11px] text-slate-400 leading-normal pt-2 border-t border-slate-100">
                <p className="font-semibold text-slate-500">Predictive Model:</p>
                <p>US FDA Danger Zone and FSSAI microbial criteria. Non-lab estimation.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
