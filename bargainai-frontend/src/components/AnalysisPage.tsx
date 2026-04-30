import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://bargainai-project.onrender.com';

const gadgetOptions = [
  { id: 'smartphone', name: 'Smartphone' },
  { id: 'laptop', name: 'Laptop' },
  { id: 'tablet', name: 'Tablet' },
  { id: 'earbuds', name: 'Earbuds' },
  { id: 'bt_speaker', name: 'Speaker' },
];

const conditionsMap: Record<string, string[]> = {
  smartphone: [
    'Cracked screen',
    'Scratches on body',
    'Battery drains fast',
    'Charging port loose',
    'Camera damaged',
    'Speaker issues',
    'Dents or bent frame',
    'No original box',
  ],
  laptop: [
    'Cracked screen',
    'Keys missing',
    'Battery not lasting',
    'Hinge damaged',
    'Dead pixels',
    'Overheating',
    'Trackpad broken',
    'No charger',
  ],
  tablet: [
    'Cracked screen',
    'Scratches',
    'Battery drains fast',
    'Home button broken',
    'Speaker crackling',
    'Charging port loose',
    'No box',
    'Bent frame',
  ],
  earbuds: [
    'Case damaged',
    'One side not working',
    'Poor sound',
    'Not charging',
    'Ear tips missing',
    'ANC broken',
    'Microphone issues',
    'No box',
  ],
  bt_speaker: [
    'Dents or scratches',
    'Speaker crackling',
    'Battery issue',
    'Buttons broken',
    'Bluetooth disconnects',
    'Water damage',
    'Charging port loose',
    'No box',
  ],
};

const loadingSteps = [
  'Checking uploaded images',
  'Detecting visible damage and product details',
  'Comparing market pricing',
  'Calculating deal score',
  'Preparing final result',
];

interface Props {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export default function AnalysisPage({ onComplete, onBack }: Props) {
  const [gadget, setGadget] = useState('smartphone');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [price, setPrice] = useState('');
  const [usage, setUsage] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [customIssue, setCustomIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) return;

    const timers = [200, 1200, 2400, 3600, 4800].map((delay, index) =>
      setTimeout(() => setStep(index), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const selected = Array.from(fileList).slice(0, 4);

    setImages((prev) => [...prev, ...selected].slice(0, 4));
    setPreviews((prev) =>
      [...prev, ...selected.map((file) => URL.createObjectURL(file))].slice(0, 4)
    );

    setActiveImg(0);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setActiveImg(0);
  };

  const toggleIssue = (issue: string) => {
    setIssues((prev) =>
      prev.includes(issue)
        ? prev.filter((item) => item !== issue)
        : [...prev, issue]
    );
  };

  const addCustomIssue = () => {
    const trimmed = customIssue.trim();

    if (!trimmed) return;

    if (!issues.includes(trimmed)) {
      setIssues((prev) => [...prev, trimmed]);
    }

    setCustomIssue('');
  };

  const submit = async () => {
    if (!images.length) {
      setError('Please upload at least one image.');
      return;
    }

    if (!price || parseInt(price, 10) <= 0) {
      setError('Please enter a valid seller price.');
      return;
    }

    setError('');
    setLoading(true);
    setStep(0);

    const formData = new FormData();

    images.forEach((image) => {
      formData.append('images', image);
    });

    formData.append('seller_price', price);
    formData.append('usage_period', usage || 'not mentioned');
    formData.append('gadget_type', gadget);
    formData.append('user_issues', issues.join(', '));

    if (deviceModel.trim()) {
      formData.append('device_model', deviceModel.trim());
    }

    try {
      const response = await axios.post(`${API}/api/analyse`, formData, {
        timeout: 120000,
        headers: {
          Accept: 'application/json',
        },
      });

      onComplete({
        ...response.data,
        uploadedPreviews: previews,
      });
    } catch (err: any) {
      console.error('Analysis request failed:', err);

      if (err.code === 'ECONNABORTED') {
        setError('Backend is taking too long. Render may be waking up. Wait 30 seconds and try again.');
      } else if (!err.response) {
        setError('Cannot connect to backend. Check Render URL, CORS, or wait for backend to wake up.');
      } else {
        setError(err?.response?.data?.error || 'Analysis failed. Please try again.');
      }

      setLoading(false);
    }
  };

  const conditionOptions = conditionsMap[gadget] || conditionsMap.smartphone;
  const customIssues = issues.filter((issue) => !conditionOptions.includes(issue));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-[#202020] bg-[#111111] p-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-semibold mb-6">
            AI
          </div>

          <h2 className="text-2xl font-bold mb-2">Analyzing your input</h2>
          <p className="text-sm text-gray-400 mb-8">
            Please wait. Render free hosting can take extra time on the first request.
          </p>

          <div className="space-y-3">
            {loadingSteps.map((text, index) => (
              <div
                key={text}
                className={`flex items-center gap-3 text-sm ${
                  index < step
                    ? 'text-green-400'
                    : index === step
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${
                    index < step
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === step
                      ? 'border-orange-500 text-orange-400'
                      : 'border-[#333333]'
                  }`}
                >
                  {index < step ? '✓' : index + 1}
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <nav className="border-b border-[#1f1f1f] bg-[#0b0b0b]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-sm">
              B
            </div>
            <div className="font-semibold">
              Bargain<span className="text-orange-500">AI</span>
            </div>
          </div>

          <div className="text-xs text-orange-400 border border-orange-500/20 bg-orange-500/10 px-3 py-1 rounded-full">
            Demo
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Deal Analysis Form</h1>
          <p className="text-gray-400">
            Upload gadget images and enter details for AI-based deal analysis.
          </p>
        </div>

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6 mb-5">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">
            Gadget Type
          </div>

          <div className="flex flex-wrap gap-2">
            {gadgetOptions.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setGadget(item.id);
                  setIssues([]);
                }}
                className={`px-4 py-2.5 rounded-xl border text-sm ${
                  gadget === item.id
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6 mb-5">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">
            Upload Images
          </div>

          {previews.length === 0 ? (
            <div
              className="border-2 border-dashed border-[#333333] rounded-2xl px-6 py-12 text-center cursor-pointer hover:border-orange-500/40"
              onClick={() => fileRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 flex items-center justify-center text-sm text-orange-400 font-medium">
                Upload
              </div>
              <div className="text-base font-medium mb-1">Click or drop files here</div>
              <div className="text-sm text-gray-500">
                Up to 4 images. Supported formats: JPG, PNG, WEBP.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-[#1d1d1d]">
              <div className="relative bg-[#0a0a0a]">
                <img
                  src={previews[activeImg]}
                  alt="preview"
                  className="w-full max-h-96 object-contain"
                />

                <div className="absolute top-3 left-3 px-3 py-1.5 text-xs rounded-full bg-black/70 text-white">
                  Image {activeImg + 1} of {previews.length}
                </div>

                <button
                  onClick={() => removeImage(activeImg)}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white text-xs"
                >
                  Remove
                </button>
              </div>

              <div className="p-4 border-t border-[#1d1d1d]">
                <div className="flex gap-2 flex-wrap items-center">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => setActiveImg(index)}
                    >
                      <img
                        src={preview}
                        alt={`thumb-${index}`}
                        className={`w-16 h-16 rounded-xl object-cover border-2 ${
                          activeImg === index
                            ? 'border-orange-500'
                            : 'border-[#333333] hover:border-[#4a4a4a]'
                        }`}
                      />
                    </div>
                  ))}

                  {previews.length < 4 && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-[#333333] hover:border-orange-500/40 text-gray-400"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6 mb-5">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">
            Seller Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#0b0b0b]"
              placeholder="Seller price in INR"
            />

            <input
              type="text"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#0b0b0b]"
              placeholder="Usage period, example: 8 months"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6 mb-5">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
            Device Model
          </div>

          <input
            type="text"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#0b0b0b]"
            placeholder="Example: Samsung Galaxy S22, iPhone 13"
          />
        </div>

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6 mb-5">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">
            Visible Issues
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {conditionOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleIssue(item)}
                className={`px-3 py-1.5 rounded-full border text-xs ${
                  issues.includes(item)
                    ? 'border-orange-500/60 bg-orange-500/10 text-orange-400'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomIssue();
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-[#2a2a2a] bg-[#0b0b0b]"
              placeholder="Example: Water damage, Face ID issue"
            />

            <button
              onClick={addCustomIssue}
              className="px-4 py-2 rounded-xl border border-[#333333] bg-[#1a1a1a]"
            >
              Add
            </button>
          </div>

          {customIssues.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customIssues.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={submit}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium"
          >
            Analyze Deal
          </button>

          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-[#2a2a2a] text-gray-300 hover:bg-[#151515]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}