export interface AnalysisResult {
  success: boolean;
  analysis_id: string;
  gadget_type: string;
  seller_price: number;
  product: any;
  market_data: any;
  deal_score: any;
  timestamp: string;
}
export interface UsageEstimation {
  estimated_age: string;
  source: string;
  usage_level: string;
  screen_wear: string;
  overall_wear: string;
}

export interface NegotiationScript {
  opening_line: string;
  if_seller_resists: string;
  final_offer: string;
  walk_away_if: string;
}

export interface Product {
  product_name: string;
  category: string;
  specs_detected: string;
  condition_score: number;
  condition_label: string;
  usage_estimation: UsageEstimation;
  damage_found: string[];
  damage_locations: string[];
  damage_severity: string;
  estimated_fair_value_inr: number;
  new_price_estimate_inr: number;
  worth_buying: boolean;
  confidence_score: number;
  ai_reasoning: string;
  negotiation_script: NegotiationScript;
  red_flags: string[];
  green_flags: string[];
}

export interface UsedPrices {
  olx_listings: any[];
  olx_lowest: number | null;
  olx_average: number | null;
  olx_highest: number | null;
}

export interface RefurbishedPrices {
  cashify_price: number | null;
  cashify_condition: string;
  cashify_url: string | null;
  cashify_warranty: string;
}

export interface NewPrices {
  amazon_price: number | null;
  amazon_url: string | null;
  flipkart_price: number | null;
  flipkart_url: string | null;
  lowest_new: number | null;
}

export interface MarketSummary {
  fair_used_price: number | null;
  price_trend: string;
  demand_level: string;
  depreciation_note: string;
}

export interface MarketData {
  product_searched: string;
  search_successful: boolean;
  used_prices: UsedPrices;
  refurbished_prices: RefurbishedPrices;
  new_prices: NewPrices;
  market_summary: MarketSummary;
  alternatives: any[];
  sources_checked: string[];
}

export interface DealScoreBreakdown {
  seller_price: number;
  fair_value: number;
  condition_score: number;
  olx_average: number | null;
  damage_severity: string;
}

export interface DealScore {
  score: number;
  verdict: string;
  emoji: string;
  breakdown: DealScoreBreakdown;
}

