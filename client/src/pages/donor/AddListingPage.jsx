import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RiskBadge from '../../components/RiskBadge';
import {
  UtensilsCrossed, Sparkles, AlertCircle, Clock, ShieldAlert,
  CheckCircle2, UploadCloud, Image as ImageIcon, X, Check,
  Camera, Package, Calendar, ShieldCheck, Tag, Trash2, RotateCcw,
  Thermometer, Info, ArrowRight
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
  const [isDragging, setIsDragging] = useState(false);

  // Default imagePreview is clean & empty - no preloaded food image
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');

  const [form, setForm] = useState({
    foodName: '',
    category: 'Cooked Meals',
    quantity: '',
    unit: 'meals/packets',
    preparationTime: new Date(Date.now() - 1 * 3600 * 1000).toISOString().slice(0, 16),
    availableUntil: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 16),
    storageCondition: 'Room Temperature',
    packagingType: 'Sealed Food Containers',
    dietaryType: 'Vegetarian',
    description: '',
    image: ''
  });

  // Dynamic AI Risk State (Module 2)
  const [aiRisk, setAiRisk] = useState({
    riskScore: 20,
    riskLevel: 'LOW',
    urgency: 'NORMAL',
    remainingSafeHours: 6.0,
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
        if (res.data?.success && res.data?.result) {
          setAiRisk(res.data.result);
        }
      } catch (err) {
        // silent fallback
      }
    };
    calculateRisk();
  }, [form.foodName, form.category, form.preparationTime, form.storageCondition, form.packagingType, form.dietaryType]);

  // Process selected file (from file picker or drop)
  const processFile = async (file) => {
    if (!file) return;

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // Read base64 for Gemini Vision Multimodal AI
    let b64 = '';
    try {
      b64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
      setImageBase64(b64);
    } catch (readErr) {
      console.warn('Failed to read image as base64', readErr);
    }

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
        await triggerAiRecognition(file.name, serverUrl, b64, file.type);
      } else {
        setForm(prev => ({ ...prev, image: localUrl }));
        await triggerAiRecognition(file.name, localUrl, b64, file.type);
      }
    } catch (err) {
      console.warn('Server upload failed, using local preview for demo', err);
      setForm(prev => ({ ...prev, image: localUrl }));
      await triggerAiRecognition(file.name, localUrl, b64, file.type);
    } finally {
      setUploadingImage(false);
      setAiAnalyzing(false);
    }
  };

  // Handle local file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    await processFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processFile(file);
    }
  };

  // Remove current uploaded image
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setImageBase64('');
    setAiVision(null);
    setForm(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger AI Recognition on selected image or hint
  const triggerAiRecognition = async (textHint = '', activeImageUrl = null, b64Override = null, mimeOverride = null) => {
    setAiAnalyzing(true);
    const imageToAnalyze = activeImageUrl !== null ? activeImageUrl : form.image;
    const b64Data = b64Override !== null ? b64Override : imageBase64;
    try {
      const res = await api.post('/ai/food-recognition', {
        textHint: textHint || form.foodName || '',
        imageName: imageToAnalyze || '',
        filename: textHint || '',
        imageBase64: b64Data || '',
        mimeType: mimeOverride || 'image/jpeg'
      });
      if (res.data?.success) {
        const v = res.data.result;
        setAiVision(v);
        setForm(prev => ({
          ...prev,
          foodName: v.detectedItem || prev.foodName,
          category: v.category || prev.category,
          dietaryType: v.dietaryType || prev.dietaryType
        }));
      }
    } catch (e) {
      console.error('AI recognition error:', e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Select a preset sample image (optional quick test template)
  const selectSampleImage = (sample) => {
    setImagePreview(sample.url);
    setImageBase64('');
    setForm(prev => ({
      ...prev,
      image: sample.url,
      foodName: sample.name,
      category: sample.category,
      dietaryType: sample.dietary
    }));
    triggerAiRecognition(sample.name, sample.url, '', 'image/jpeg');
  };

  // Reset entire form
  const handleResetForm = () => {
    setImagePreview(null);
    setImageBase64('');
    setAiVision(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setForm({
      foodName: '',
      category: 'Cooked Meals',
      quantity: '',
      unit: 'meals/packets',
      preparationTime: new Date(Date.now() - 1 * 3600 * 1000).toISOString().slice(0, 16),
      availableUntil: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 16),
      storageCondition: 'Room Temperature',
      packagingType: 'Sealed Food Containers',
      dietaryType: 'Vegetarian',
      description: '',
      image: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.foodName.trim()) {
      setError('Please provide a food name.');
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/food', form);
      if (res.data?.success) {
        navigate('/donor/listings');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  // Compute risk meter width and color
  const riskScore = aiRisk.riskScore !== undefined ? aiRisk.riskScore : 20;
  const riskLevel = (aiRisk.riskLevel || 'LOW').toUpperCase();
  const meterColor = riskLevel === 'CRITICAL' || riskLevel === 'HIGH' 
    ? 'bg-rose-500' 
    : riskLevel === 'MEDIUM' 
    ? 'bg-amber-500' 
    : 'bg-emerald-500';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header section with clean metadata badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Donor Workflow
            </span>
            <span className="text-[11px] text-slate-400 font-medium">• Surplus Food Registration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">List Surplus Food</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add food items for instant AI vision recognition, automated categorization, and real-time spoilage risk estimation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetForm}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Form</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main Form Column (2 of 3) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* ============================================================ */}
          {/* SECTION 1: PHOTO & AI RECOGNITION (CLEAN UPLOAD STATE)       */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Food Photo & AI Vision Recognition</h2>
                  <p className="text-[11px] text-slate-400">Upload a clear photo to auto-fill details using multimodal AI</p>
                </div>
              </div>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

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
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
                imagePreview
                  ? 'border border-slate-200 bg-slate-50/60 p-4'
                  : isDragging
                  ? 'border-2 border-dashed border-emerald-500 bg-emerald-50/80 p-8 text-center'
                  : 'border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 p-8 text-center group'
              }`}
            >
              {imagePreview ? (
                /* Clean Uploaded State with Preview */
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group/thumb shrink-0">
                    <img
                      src={imagePreview}
                      alt="Food Item"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="text-left space-y-1.5 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Photo Attached</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {form.foodName || 'Photo ready for listing'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Click anywhere on this box to replace with another image from your device.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm inline-flex items-center gap-1.5 transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Replace Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Clean Empty State Prompt (No Preloaded Image) */
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 group-hover:border-emerald-300 transition-all">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to upload food photo, or drag and drop here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports PNG, JPG, or WEBP up to 10MB
                    </p>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-sm group-hover:border-emerald-400 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      Browse Files
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analyzing Status Bar */}
            {aiAnalyzing && (
              <div className="p-3 bg-indigo-50/90 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-semibold flex items-center gap-2 animate-pulse shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                <span>AI Vision is analyzing image textures, ingredients, and food categories...</span>
              </div>
            )}

            {/* AI Module 1 Analysis Feedback Card */}
            {aiVision && (
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/90 text-xs space-y-2.5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> AI Vision Classification Result
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {aiVision.modelArchitecture && (
                      <span className="font-bold text-[10px] text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded-full">
                        {aiVision.modelArchitecture.includes('Gemini') ? '⚡ Google Gemini 1.5 Flash' : 'Vision Engine'}
                      </span>
                    )}
                    <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                      {aiVision.confidence}% Confidence
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-black text-slate-900 text-sm">{aiVision.detectedItem}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{aiVision.explanation}</p>
                </div>
                
                {/* Neural Network Alternative Candidates */}
                {aiVision.topCandidates && aiVision.topCandidates.length > 1 && (
                  <div className="pt-2 border-t border-emerald-200/70">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Alternative Predictions (click to apply):
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
                              category: cand.category || prev.category
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

                {aiVision.tags && aiVision.tags.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {aiVision.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Sample Templates (Clean & Unobtrusive) */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Sample Templates (Optional):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSampleImage(sample)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-[11px] font-semibold text-slate-600 transition-colors"
                  >
                    {sample.name.split(' ')[0]} {sample.name.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 2: FOOD DETAILS & CLASSIFICATION                     */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Food Identification & Details</h2>
                <p className="text-[11px] text-slate-400">Specify what surplus food is being made available</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Food Item Name *
                </label>
                {aiVision && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Auto-filled by AI
                  </span>
                )}
              </div>
              <div className="relative">
                <UtensilsCrossed className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={form.foodName}
                  onChange={(e) => setForm({ ...form, foodName: e.target.value })}
                  placeholder="e.g. Steamed Basmati Rice & Dal Makhani Combo"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Food Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dietary Classification *
                </label>
                <select
                  value={form.dietaryType}
                  onChange={(e) => setForm({ ...form, dietaryType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 3: QUANTITY & PACKAGING                              */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Quantity & Packaging Specifications</h2>
                <p className="text-[11px] text-slate-400">Helps AI calculate meal servings and distribution match score</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity *
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 40"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Measurement Unit *
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Storage Condition *
                </label>
                <select
                  value={form.storageCondition}
                  onChange={(e) => setForm({ ...form, storageCondition: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
                >
                  <option value="Room Temperature">Room Temperature</option>
                  <option value="Refrigerated">Refrigerated (2°C - 5°C)</option>
                  <option value="Hot Holding (>60°C)">Hot Holding (&gt;60°C)</option>
                  <option value="Deep Freeze">Deep Freeze (&lt;-18°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Packaging Type *
                </label>
                <select
                  value={form.packagingType}
                  onChange={(e) => setForm({ ...form, packagingType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
                >
                  <option value="Sealed Food Containers">Sealed Food Containers</option>
                  <option value="Foil Wrapped">Foil Wrapped</option>
                  <option value="Commercial Packaging">Commercial Packaging</option>
                  <option value="Open Bulk Tray">Open Bulk Tray</option>
                </select>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 4: PREPARATION & EXCLUSION TIMELINES                 */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Timing & Safety Cutoffs</h2>
                <p className="text-[11px] text-slate-400">Critical timestamps monitored by AI spoilage risk engine</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preparation / Cook Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.preparationTime}
                  onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">When was the food prepared or unpacked?</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Available Until (Pickup Cutoff) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.availableUntil}
                  onChange={(e) => setForm({ ...form, availableUntil: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Latest time the food can be collected safely</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Additional Notes & Allergen Info
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Prepared for banquet lunch. Packed in food-grade insulated boxes. Contains dairy (paneer). Ready for immediate loading."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Surplus Listing</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Real-time AI Spoilage & Risk Guardian Sidebar (1 of 3) */}
        <div className="space-y-4 lg:sticky lg:top-20">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  AI Risk Engine (M2)
                </span>
              </div>
              <RiskBadge riskLevel={aiRisk.riskLevel} urgency={aiRisk.urgency} riskScore={aiRisk.riskScore} />
            </div>

            {/* Spoilage Risk Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Calculated Spoilage Index</span>
                <span className="font-extrabold text-slate-900">{riskScore} / 100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${meterColor}`}
                  style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                <span>0 (Safe)</span>
                <span>50 (Moderate)</span>
                <span>100 (Critical)</span>
              </div>
            </div>

            {/* Estimated Safe Hours Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                Safe Consumption Window
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  ~{aiRisk.remainingSafeHours}
                </span>
                <span className="text-xs font-semibold text-slate-500">hours remaining</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Dynamically calculated from storage temperature and preparation timeline.
              </p>
            </div>

            {/* Recommended Protocol */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Recommended Protocol</span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed font-medium">
                {aiRisk.suggestedAction || 'Safe for distribution within normal operating timelines.'}
              </p>
            </div>

            {/* Predictive Model Footnote */}
            <div className="text-[10px] text-slate-400 leading-normal pt-2 border-t border-slate-100 space-y-1">
              <p className="font-semibold text-slate-500 uppercase tracking-wider">Predictive Model:</p>
              <p className="font-medium text-slate-600">
                {aiRisk.aiModelUsed || 'FDA/FSSAI Time-Temperature Microbial Engine'}
              </p>
            </div>

            {/* Handover Quality Checklist */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Food Safety Checklist:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sealed in clean food-grade containers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Maintained at designated temperature</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Handed over to verified NGO recipients</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
