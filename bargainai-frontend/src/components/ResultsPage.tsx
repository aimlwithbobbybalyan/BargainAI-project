import { useState } from 'react';

const fmt = (n: any): string =>
  n != null && !isNaN(Number(n)) && Number(n) > 0
    ? '₹' + Number(n).toLocaleString('en-IN')
    : '—';

const safeNum = (n: any): number =>
  n != null && !isNaN(Number(n)) ? Number(n) : 0;

interface Props {
  data: any;
  onBack: () => void;
  onNewAnalysis: () => void;
  onBudget: () => void;
}

export default function ResultsPage({
  data,
  onBack,
  onNewAnalysis,
  onBudget,
}: Props) {
  const product = data?.product || {};
  const market = data?.market_data || {};
  const dealScore = data?.deal_score || {};

  const sellerPrice = safeNum(data?.seller_price);
  const fairValue = safeNum(product?.estimated_fair_value_inr);
  const score = safeNum(dealScore?.score);
  const uploadedPreviews: string[] = data?.uploadedPreviews || [];
  const damageBoxes: any[] = product?.damage_boxes || [];

  const amazonPrice = safeNum(market?.new_prices?.amazon_price);
  const flipkartPrice = safeNum(market?.new_prices?.flipkart_price);
  const lowestNew = safeNum(market?.new_prices?.lowest_new);
  const averageNewPrice = safeNum(
    market?.new_prices?.average_new_price || market?.market_summary?.average_new_price
  );
  const recommendedPrice = fairValue;

  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const scoreTextColor =
    score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';

  const scoreBoxClass =
    score >= 70
      ? 'bg-green-500/10 border-green-500/30'
      : score >= 50
      ? 'bg-yellow-500/10 border-yellow-500/30'
      : 'bg-red-500/10 border-red-500/30';

  const verdictText =
    score >= 70 ? 'Good Deal' : score >= 50 ? 'Fair Deal' : 'Overpriced Deal';

  const verdictDescription =
    score >= 70
      ? 'The seller price appears reasonable compared to the estimated value and condition.'
      : score >= 50
      ? 'The deal is acceptable, but negotiation is recommended before purchase.'
      : 'The asking price looks high compared to the available market and condition data.';

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const negotiation = product?.negotiation_script || {};
  const searchName = encodeURIComponent(product?.product_name || '');

  const scripts = [
    {
      style: 'Polite',
      color: 'text-blue-400',
      bg: 'bg-blue-500/5 border-blue-500/20',
      text:
        negotiation?.opening_line ||
        `The current asking price feels a little high. Similar options are available around ${fmt(
          market?.used_prices?.olx_average
        )}. I can consider ${fmt(Math.round(fairValue * 0.92))}.`,
    },
    {
      style: 'Direct',
      color: 'text-red-400',
      bg: 'bg-red-500/5 border-red-500/20',
      text:
        negotiation?.if_seller_resists ||
        `The market value is lower than this. My final offer is ${fmt(
          Math.round(fairValue * 0.88)
        )}.`,
    },
    {
      style: 'Balanced',
      color: 'text-orange-400',
      bg: 'bg-orange-500/5 border-orange-500/20',
      text: `After comparing market pricing and condition, ${fmt(
        fairValue
      )} looks like a fair value for this device.`,
    },
  ];

  const marketRows = [
    {
      label: 'Amazon',
      price: amazonPrice,
      url: market?.new_prices?.amazon_url,
    },
    {
      label: 'Flipkart',
      price: flipkartPrice,
      url: market?.new_prices?.flipkart_url,
    },
    {
      label: 'OLX Average',
      price: market?.used_prices?.olx_average,
      url: null,
    },
    {
      label: 'Cashify',
      price: market?.refurbished_prices?.cashify_price,
      url: market?.refurbished_prices?.cashify_url,
    },
  ].filter((item) => item.price);

  const platformLinks = [
    {
      name: 'OLX',
      color: 'bg-green-500',
      url: `https://www.olx.in/items/q-${searchName}`,
    },
    {
      name: 'Amazon',
      color: 'bg-orange-500',
      url: `https://www.amazon.in/s?k=${searchName}`,
    },
    {
      name: 'Flipkart',
      color: 'bg-blue-500',
      url: `https://www.flipkart.com/search?q=${searchName}`,
    },
    {
      name: 'Cashify',
      color: 'bg-yellow-500',
      url: `https://www.cashify.in/buy-refurbished-gadgets/all-gadgets/search?q=${searchName}`,
    },
    {
      name: 'Quikr',
      color: 'bg-red-400',
      url: `https://www.quikr.com/search/${searchName}`,
    },
  ];

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
            Result
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
                Detected Product
              </div>
              <h1 className="text-2xl font-bold mb-1">
                {product?.product_name || 'Unknown Product'}
              </h1>
              {product?.specs_detected && product?.specs_detected !== 'Unknown' && (
                <p className="text-sm text-gray-400">{product.specs_detected}</p>
              )}
            </div>

            <div
              className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center ${scoreBoxClass}`}
            >
              <div className={`text-2xl font-bold ${scoreTextColor}`}>{score}</div>
              <div className="text-[11px] text-gray-500">Deal Score</div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${scoreBoxClass}`}>
          <div className={`text-base font-semibold mb-1 ${scoreTextColor}`}>
            {verdictText}
          </div>
          <div className="text-sm text-gray-300">{verdictDescription}</div>
        </div>

        {uploadedPreviews.length > 0 && (
          <div className="rounded-2xl border border-[#202020] bg-[#111111] overflow-hidden">
            <div className="relative bg-[#0a0a0a]">
              <img
                src={uploadedPreviews[activeImg]}
                alt="uploaded"
                className="w-full max-h-80 object-contain"
              />

              {damageBoxes.map((box: any, index: number) => (
                <div
                  key={index}
                  className="absolute border-2 border-red-400 bg-red-500/10 rounded-md animate-pulse shadow-[0_0_0_1px_rgba(248,113,113,0.35)]"
                  style={{
                    top: `${box.top}%`,
                    left: `${box.left}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                >
                  <div className="absolute -top-7 left-0 text-[10px] px-2 py-1 rounded bg-red-500 text-white whitespace-nowrap">
                    {box.label}
                  </div>
                </div>
              ))}
            </div>

            {uploadedPreviews.length > 1 && (
              <div className="p-4 border-t border-[#1d1d1d] flex gap-2 flex-wrap">
                {uploadedPreviews.map((item, index) => (
                  <img
                    key={index}
                    src={item}
                    alt={`preview-${index}`}
                    onClick={() => setActiveImg(index)}
                    className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 ${
                      activeImg === index ? 'border-orange-500' : 'border-[#333333]'
                    }`}
                  />
                ))}
              </div>
            )}

            {damageBoxes.length > 0 && (
              <div className="px-4 pb-4 pt-3 text-sm text-gray-400 border-t border-[#1d1d1d]">
                <span className="text-white font-medium">Detected areas:</span>{' '}
                {damageBoxes.map((box, index) => (
                  <span key={index}>
                    {box.location_text || box.label}
                    {index < damageBoxes.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6">
          <div className="text-sm font-semibold mb-4">Market Price Comparison</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl bg-[#1a1a1a] p-4">
              <div className="text-xs text-gray-500 mb-1">Asking Price</div>
              <div className="text-xl font-bold text-orange-400">{fmt(sellerPrice)}</div>
            </div>

            <div className="rounded-xl bg-[#1a1a1a] p-4">
              <div className="text-xs text-gray-500 mb-1">Average New Price</div>
              <div className="text-xl font-bold text-white">{fmt(averageNewPrice)}</div>
            </div>

            <div className="rounded-xl bg-[#1a1a1a] p-4">
              <div className="text-xs text-gray-500 mb-1">Fair Value</div>
              <div className="text-xl font-bold text-white">{fmt(fairValue)}</div>
            </div>

            <div className="rounded-xl bg-[#1a1a1a] p-4">
              <div className="text-xs text-gray-500 mb-1">Recommended Price</div>
              <div className="text-xl font-bold text-green-400">{fmt(recommendedPrice)}</div>
            </div>
          </div>

          {marketRows.length > 0 && (
            <div className="space-y-2 mb-4">
              {marketRows.map((row, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0"
                >
                  <span className="text-sm text-gray-400">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{fmt(row.price)}</span>
                    {row.url && (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-orange-400 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {lowestNew > 0 && (
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
              <div className="text-xs text-orange-400 font-semibold mb-1">
                Lowest New Price Found
              </div>
              <div className="text-2xl font-bold text-orange-400">{fmt(lowestNew)}</div>
              <div className="text-xs text-gray-500 mt-1">
                Best currently detected new-market listing from search results.
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6">
          <div className="text-sm font-semibold mb-3">Verify Market Prices</div>
          <div className="text-xs text-gray-500 mb-4">
            Open external platforms to compare similar listings manually.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {platformLinks.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
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

        {product?.ai_reasoning && (
          <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6">
            <div className="text-sm font-semibold mb-3">AI Analysis Summary</div>
            <p className="text-sm text-gray-400 leading-relaxed">{product.ai_reasoning}</p>
          </div>
        )}

        <div className="rounded-2xl border border-[#202020] bg-[#111111] p-6">
          <div className="text-sm font-semibold mb-4">Negotiation Suggestions</div>

          <div className="space-y-3">
            {scripts.map((item) => (
              <div key={item.style} className={`rounded-xl border p-4 ${item.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-xs font-semibold uppercase tracking-[0.15em] ${item.color}`}>
                    {item.style}
                  </div>
                  <button
                    onClick={() => copyText(item.text, item.style)}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {copied === item.style ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {negotiation?.walk_away_if && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <span className="font-semibold">Avoid purchase if:</span> {negotiation.walk_away_if}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#202020] bg-[#111111] p-5">
            <div className="text-sm font-semibold text-red-400 mb-3">Red Flags</div>
            {(product?.red_flags || []).length > 0 ? (
              (product.red_flags as string[]).map((flag: string, index: number) => (
                <div
                  key={index}
                  className="text-sm text-gray-400 py-2 border-b border-[#1a1a1a] last:border-0"
                >
                  {flag}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No major red flags reported.</div>
            )}
          </div>

          <div className="rounded-2xl border border-[#202020] bg-[#111111] p-5">
            <div className="text-sm font-semibold text-green-400 mb-3">Positive Points</div>
            {(product?.green_flags || []).length > 0 ? (
              (product.green_flags as string[]).map((flag: string, index: number) => (
                <div
                  key={index}
                  className="text-sm text-gray-400 py-2 border-b border-[#1a1a1a] last:border-0"
                >
                  {flag}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No positive highlights were reported.</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={onNewAnalysis}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
          >
            New Analysis
          </button>

          <button
            onClick={onBudget}
            className="px-6 py-3 rounded-xl border border-[#2a2a2a] text-gray-300 hover:bg-[#151515] transition-colors"
          >
            Budget Finder
          </button>
        </div>
      </div>
    </div>
  );
}
