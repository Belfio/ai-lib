// Basic utility types
type URL = string;
type Year = number;
type Percentage = number;
type Currency = number;

// Main Company Profile Type
export interface CompanyProfile {
  basicInfo: CompanyBasicInfo;
  productInfo: ProductInfo;
  teamInfo: TeamInfo;
  ownershipInfo: OwnershipInfo;
  financials: FinancialMetrics;
  benchmarking: BenchmarkingMetrics;
}

// Company Basic Information
interface CompanyBasicInfo {
  companyName: string;
  urls: {
    website?: URL;
    linkedin?: URL;
    companiesHouse?: URL;
  };
  headquarters: {
    city: string;
    country: string;
    regionalFocus?: string;
  };
  founded: Year;
  industry: {
    primarySector: string;
    subSector: string;
  };
  businessModel: "B2B" | "B2C" | "SaaS" | "Marketplace" | string;
  stage: "Seed" | "Series A" | "Series B" | "Growth" | "Pre-IPO" | string;
  overview: string;
}

// Product Information
interface ProductInfo {
  productServiceOffering: string;
  targetMarket: string;
  addressableMarket: {
    tam?: Currency;
    sam?: Currency;
    som?: Currency;
  };
  marketShare: Percentage;
  competitiveAdvantage: string;
  pricingModel: "Subscription" | "One-time" | "Freemium" | string;
  useCases: string[];
  productRoadmap?: string;
  competition: Array<{
    name: string;
    website?: URL;
  }>;
}

// Team Information
interface TeamMember {
  name: string;
  title: string;
  background: string;
}

interface TeamInfo {
  leadership: TeamMember[];
  teamSize: number;
  keyRoles: TeamMember[];
  governance: {
    boardMembers?: TeamMember[];
    advisoryBoard?: TeamMember[];
  };
  cultureValues?: string;
}

// Ownership Information
interface FundingRound {
  round: string;
  date: Date;
  amount: Currency;
  valuation: Currency;
  leadInvestor: string;
}

interface OwnershipInfo {
  capTable: Array<{
    stakeholder: string;
    ownership: Percentage;
  }>;
  fundingHistory: FundingRound[];
  legalEntityStructure: {
    subsidiaries?: string[];
    parentCompany?: string;
    partnerships?: string[];
  };
}

// Financial Information
interface FinancialMetrics {
  historical: PeriodFinancials[];
  projected: PeriodFinancials[];
}

interface PeriodFinancials {
  period: {
    year: number;
    quarter?: number;
    month?: number;
  };
  revenueMetrics: {
    revenue: Currency;
    mrr?: Currency;
    arr?: Currency;
    carr?: Currency;
    revenueGrowthRate: Percentage;
  };
  profitabilityMetrics: {
    cogs: Currency;
    grossProfit: Currency;
    grossProfitMargin: Percentage;
    personnelCosts: Currency;
    salesAndMarketing: Currency;
    rAndD: Currency;
    otherOperatingCosts: Currency;
    ebitda: Currency;
    ebitdaMargin: Percentage;
    deprecationAndAmortization: Currency;
    ebit: Currency;
    interestExpense: Currency;
    incomeTax: Currency;
    netIncome: Currency;
    breakEvenPoint: Currency;
  };
  cashMetrics: {
    startingCashBalance: Currency;
    operationalCashFlow: Currency;
    investingCashFlow: Currency;
    financingCashFlow: Currency;
    freeCashFlows: Currency;
    endingCashBalance: Currency;
    cashBreakEvenPoint: Currency;
    monthlyBurnRate: Currency;
    runway: number; // months
    outstandingDebt: Currency;
  };
  unitEconomics: {
    contractCount: number;
    averageContractValue: Currency;
    customerCount: number;
    activeCustomerCount: number;
    cac: Currency;
    ltv: Currency;
    cacLtvRatio: number;
    paybackPeriod: number; // months
    churnRate: Percentage;
  };
  valuation: {
    currentValuation: Currency;
    impliedMultiples: {
      revenueMultiple?: number;
      ebitdaMultiple?: number;
      // Add other multiples as needed
    };
    transactionComps?: Array<{
      companyName: string;
      date: Date;
      multiple: number;
      type: string;
    }>;
  };
}

// Benchmarking
interface BenchmarkingMetrics {
  peers: Array<{
    companyName: string;
    metrics: {
      revenue?: Currency;
      revenueGrowthRate?: Percentage;
      mrrArr?: Currency;
      ebitda?: Currency;
      ebitdaMargin?: Percentage;
      freeCashFlows?: Currency;
      contractCount?: number;
      activeCustomers?: number;
      cacLtvRatio?: number;
      paybackRatio?: number;
    };
  }>;
}
