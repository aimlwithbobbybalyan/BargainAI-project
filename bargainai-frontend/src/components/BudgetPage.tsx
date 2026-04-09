import { useState } from 'react';

interface Props {
  onBack: () => void;
  onAnalyse: () => void;
}

const deviceTypes = [
  { id: 'smartphone', label: 'Phone' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'tablet', label: 'Tablet' },
];

const platforms: {
  name: string;
  color: string;
  getUrl: (q: string, b: number, deviceType: string) => string;
}[] = [
  {
    name: 'OLX',
    color: 'bg-green-500',
    getUrl: (q: string) => `https://www.olx.in/items/q-${encodeURIComponent(q)}`,
  },
  {
    name: 'Amazon',
    color: 'bg-orange-500',
    getUrl: (q: string, b: number) =>
      `https://www.amazon.in/s?k=${encodeURIComponent(q)}&rh=p_36%3A-${b * 100}`,
  },
  {
    name: 'Flipkart',
    color: 'bg-blue-500',
    getUrl: (q: string) =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(q)}&sort=price_asc`,
  },
  {
    name: 'Cashify',
    color: 'bg-yellow-500',
    getUrl: (q: string) =>
      `https://www.cashify.in/buy-refurbished-gadgets/all-gadgets/search?q=${encodeURIComponent(q)}`,
  },
  {
    name: 'Quikr',
    color: 'bg-red-400',
    getUrl: (q: string) => `https://www.quikr.com/search/${encodeURIComponent(q)}`,
  },
];

export default function BudgetPage({ onBack, onAnalyse }: Props) {
  const [deviceType, setDeviceType] = useState('smartphone');
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState(15000);
  const [searched, setSearched] = useState(false);

  const formatINR = (value: number) => '₹' + value.toLocaleString('en-IN');
  const effectiveQuery = searchQuery.trim() || (deviceType === 'smartphone' ? 'mobile phone' : deviceType);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <nav className="border-b border-[#1f1f1f] bg-[#0b0b0b]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
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
            Budget
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Budget Finder</h1>
          <p className="text-gray-400">
            Explore approximate options within a selected budget range.
          </p>
        </div>

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6 mb-5">
          <div className="mb-5">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
              Device Type
            </div>

            <div className="flex gap-2 flex-wrap">
              {deviceTypes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDeviceType(item.id)}
                  className={`px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                    deviceType === item.id
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
              Search Query
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Example: iPhone 12, Galaxy S21, Dell Inspiron"
              className="w-full px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#0b0b0b] text-white outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Budget Range
              </div>
              <div className="text-orange-400 font-semibold">{formatINR(budget)}</div>
            </div>

            <input
              type="range"
              min={3000}
              max={100000}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value, 10))}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>₹3,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          <button
            onClick={() => setSearched(true)}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
          >
            Find Options
          </button>
        </div>

        {searched && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6">
              <div className="text-sm font-semibold mb-2">
                Suggested range for {effectiveQuery}
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Based on the selected budget, the following ranges are generally worth
                checking:
              </p>

              <div className="space-y-3">
                {[
                  {
                    platform: 'OLX Used Listings',
                    range: `${formatINR(Math.round(budget * 0.55))} – ${formatINR(
                      Math.round(budget * 0.75)
                    )}`,
                    note: 'Usually includes lower-cost second-hand options.',
                  },
                  {
                    platform: 'Cashify Refurbished',
                    range: `${formatINR(Math.round(budget * 0.65))} – ${formatINR(
                      Math.round(budget * 0.85)
                    )}`,
                    note: 'Useful for refurbished listings with some warranty support.',
                  },
                  {
                    platform: 'Amazon Refurbished',
                    range: `${formatINR(Math.round(budget * 0.75))} – ${formatINR(
                      budget
                    )}`,
                    note: 'Helpful when checking renewed or refurbished product pricing.',
                  },
                ].map((item) => (
                  <div
                    key={item.platform}
                    className="flex items-center justify-between gap-4 py-3 border-b border-[#1a1a1a] last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium">{item.platform}</div>
                      <div className="text-xs text-gray-500">{item.note}</div>
                    </div>

                    <div className="text-sm font-semibold text-orange-400">
                      {item.range}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6">
              <div className="text-sm font-semibold mb-2">Search on Platforms</div>
              <div className="text-xs text-gray-500 mb-4">
                Open these platforms to manually compare products within your budget.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {platforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.getUrl(effectiveQuery, budget, deviceType)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222222] transition-colors text-sm"
                  >
                    <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                    <span>{platform.name}</span>
                    <span className="ml-auto text-gray-500">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={onAnalyse}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
          >
            Analyze a Deal
          </button>

          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-[#2a2a2a] text-gray-300 hover:bg-[#151515] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
