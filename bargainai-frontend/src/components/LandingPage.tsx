import { useState } from 'react';

interface Props {
  onStart: () => void;
  onBudget: () => void;
}

const features = [
  {
    title: 'Image-Based Product Detection',
    description:
      'Upload gadget photos and let the system identify product details and visible condition.',
  },
  {
    title: 'Market Price Comparison',
    description:
      'Compares seller price with market pricing from multiple platforms.',
  },
  {
    title: 'Negotiation Assistance',
    description:
      'Suggests practical negotiation lines based on condition and price.',
  },
];

const workflow = [
  {
    step: '01',
    title: 'Upload Photos',
    description: 'Add one or more clear product images.',
  },
  {
    step: '02',
    title: 'Enter Details',
    description: 'Enter seller price and optional product information.',
  },
  {
    step: '03',
    title: 'View Result',
    description: 'See condition analysis, deal score, and market comparison.',
  },
];

export default function LandingPage({ onStart, onBudget }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('bobbybalyanaiml@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <nav className="border-b border-[#1f1f1f] bg-[#0b0b0b] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-sm">
              B
            </div>
            <div className="font-semibold text-lg">
              Bargain<span className="text-orange-500">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-gray-300 hover:bg-[#151515] transition-colors"
            >
              Contact
            </a>
            <button
              onClick={onStart}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
            >
              Start Analysis
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-[#272727] bg-[#121212] px-4 py-1.5 text-xs text-gray-300 mb-6">
            College Project — BargainAI
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Check second-hand gadget deals with a simple AI-assisted workflow
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-8">
            BargainAI helps users evaluate used gadgets by combining image analysis,
            condition assessment, market comparison, and negotiation support in one place.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onStart}
              className="px-7 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
            >
              Analyze a Deal
            </button>
            <button
              onClick={onBudget}
              className="px-7 py-3.5 rounded-2xl border border-[#2a2a2a] text-gray-300 hover:bg-[#151515] transition-colors"
            >
              Open Budget Finder
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#202020] bg-[#111111] p-6"
            >
              <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-3xl border border-[#202020] bg-[#111111] p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Budget Finder</h2>
              <p className="text-gray-400 leading-relaxed">
                Use the budget finder to explore realistic price ranges for phones,
                laptops, and tablets before starting a full analysis.
              </p>
            </div>

            <button
              onClick={onBudget}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
            >
              Try Budget Finder
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20" id="how-it-works">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
          <p className="text-gray-400 text-sm">
            The platform follows a straightforward three-step process for easy demonstration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {workflow.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-[#202020] bg-[#111111] p-6"
            >
              <div className="text-xs font-semibold tracking-[0.2em] text-orange-400 mb-3">
                STEP {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="border-t border-[#1f1f1f]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-semibold text-lg mb-2">
              Bargain<span className="text-orange-500">AI</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              College Project by Bobby and Navneet
            </p>
          </div>

          <div className="md:text-right">
            <div className="text-sm font-medium mb-3">Contact</div>

            <div className="flex md:justify-end flex-wrap gap-3">
              <a
                href="www.linkedin.com/in/bobby-balyan-9b1b1127a"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-gray-300 hover:bg-[#151515] transition-colors"
              >
                LinkedIn
              </a>

              <button
                onClick={handleCopyEmail}
                className="px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-gray-300 hover:bg-[#151515] transition-colors"
              >
                {copied ? 'Copied' : 'Copy Email'}
              </button>

              <a
                href="https://github.com/aimlwithbobbybalyan/BargainAI-project"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-gray-300 hover:bg-[#151515] transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
