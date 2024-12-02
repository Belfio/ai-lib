import { z } from "zod";

// Basic Utility Schemas
const URLSchema = z.string().url();
const YearSchema = z.number().int().min(0);
const PercentageSchema = z.number().min(0).max(100);
const CurrencySchema = z.number().min(0);

// Team Member Schema
const TeamMemberSchema = z.object({
  name: z.string(),
  title: z.string(),
  background: z.string(),
});

// Funding Round Schema
const FundingRoundSchema = z.object({
  round: z.string(),
  date: z.date(),
  amount: CurrencySchema,
  valuation: CurrencySchema,
  leadInvestor: z.string(),
});

// Ownership Information Schema
const OwnershipInfoSchema = z.object({
  capTable: z.array(
    z.object({
      stakeholder: z.string(),
      ownership: PercentageSchema,
    })
  ),
  fundingHistory: z.array(FundingRoundSchema),
  legalEntityStructure: z.object({
    subsidiaries: z.array(z.string()).optional(),
    parentCompany: z.string().optional(),
    partnerships: z.array(z.string()).optional(),
  }),
});

// Company Basic Information Schema
const CompanyBasicInfoSchema = z.object({
  companyName: z.string(),
  urls: z.object({
    website: URLSchema.optional(),
    linkedin: URLSchema.optional(),
    companiesHouse: URLSchema.optional(),
  }),
  headquarters: z.object({
    city: z.string(),
    country: z.string(),
    regionalFocus: z.string().optional(),
  }),
  founded: YearSchema,
  industry: z.object({
    primarySector: z.string(),
    subSector: z.string(),
  }),
  businessModel: z.string(),
  stage: z.string(),
  overview: z.string(),
});

// Product Information Schema
const ProductInfoSchema = z.object({
  productServiceOffering: z.string(),
  targetMarket: z.string(),
  addressableMarket: z.object({
    tam: CurrencySchema.optional(),
    sam: CurrencySchema.optional(),
    som: CurrencySchema.optional(),
  }),
  marketShare: PercentageSchema,
  competitiveAdvantage: z.string(),
  pricingModel: z.string(),
  useCases: z.array(z.string()),
  productRoadmap: z.string().optional(),
  competition: z.array(
    z.object({
      name: z.string(),
      website: URLSchema.optional(),
    })
  ),
});

// Team Information Schema
const TeamInfoSchema = z.object({
  leadership: z.array(TeamMemberSchema),
  teamSize: z.number().int().min(0),
  keyRoles: z.array(TeamMemberSchema),
  governance: z.object({
    boardMembers: z.array(TeamMemberSchema).optional(),
    advisoryBoard: z.array(TeamMemberSchema).optional(),
  }),
  cultureValues: z.string().optional(),
});

// Financial Metrics Schema
const FinancialMetricsSchema = z.object({
  historical: z.array(z.lazy(() => PeriodFinancialsSchema)),
  projected: z.array(z.lazy(() => PeriodFinancialsSchema)),
});

// Period Financials Schema
const PeriodFinancialsSchema = z.object({
  period: z.object({
    year: z.number().int(),
    quarter: z.number().int().optional(),
    month: z.number().int().optional(),
  }),
  revenueMetrics: z.object({
    revenue: CurrencySchema,
    mrr: CurrencySchema.optional(),
    arr: CurrencySchema.optional(),
    carr: CurrencySchema.optional(),
    revenueGrowthRate: PercentageSchema,
  }),
  profitabilityMetrics: z.object({
    cogs: CurrencySchema,
    grossProfit: CurrencySchema,
    grossProfitMargin: PercentageSchema,
    personnelCosts: CurrencySchema,
    salesAndMarketing: CurrencySchema,
    rAndD: CurrencySchema,
    otherOperatingCosts: CurrencySchema,
    ebitda: CurrencySchema,
    ebitdaMargin: PercentageSchema,
    deprecationAndAmortization: CurrencySchema,
    ebit: CurrencySchema,
    interestExpense: CurrencySchema,
    incomeTax: CurrencySchema,
    netIncome: CurrencySchema,
    breakEvenPoint: CurrencySchema,
  }),
  cashMetrics: z.object({
    startingCashBalance: CurrencySchema,
    operationalCashFlow: CurrencySchema,
    investingCashFlow: CurrencySchema,
    financingCashFlow: CurrencySchema,
    freeCashFlows: CurrencySchema,
    endingCashBalance: CurrencySchema,
    cashBreakEvenPoint: CurrencySchema,
    monthlyBurnRate: CurrencySchema,
    runway: z.number().int(), // months
    outstandingDebt: CurrencySchema,
  }),
  unitEconomics: z.object({
    contractCount: z.number().int(),
    averageContractValue: CurrencySchema,
    customerCount: z.number().int(),
    activeCustomerCount: z.number().int(),
    cac: CurrencySchema,
    ltv: CurrencySchema,
    cacLtvRatio: z.number(),
    paybackPeriod: z.number().int(), // months
    churnRate: PercentageSchema,
  }),
  valuation: z.object({
    currentValuation: CurrencySchema,
    impliedMultiples: z.object({
      revenueMultiple: z.number().optional(),
      ebitdaMultiple: z.number().optional(),
      // Add other multiples as needed
    }),
    transactionComps: z
      .array(
        z.object({
          companyName: z.string(),
          date: z.date(),
          multiple: z.number(),
          type: z.string(),
        })
      )
      .optional(),
  }),
});

// Benchmarking Metrics Schema
const BenchmarkingMetricsSchema = z.object({
  peers: z.array(
    z.object({
      companyName: z.string(),
      metrics: z.object({
        revenue: CurrencySchema.optional(),
        revenueGrowthRate: PercentageSchema.optional(),
        mrrArr: CurrencySchema.optional(),
        ebitda: CurrencySchema.optional(),
        ebitdaMargin: PercentageSchema.optional(),
        freeCashFlows: CurrencySchema.optional(),
        contractCount: z.number().int().optional(),
        activeCustomers: z.number().int().optional(),
        cacLtvRatio: z.number().optional(),
        paybackRatio: z.number().optional(),
      }),
    })
  ),
});

// Company Profile Schema
export const CompanyProfileSchema = z.object({
  basicInfo: CompanyBasicInfoSchema,
  productInfo: ProductInfoSchema,
  teamInfo: TeamInfoSchema,
  ownershipInfo: OwnershipInfoSchema,
  financials: FinancialMetricsSchema,
  benchmarking: BenchmarkingMetricsSchema,
  emailId: z.string().email(),
  companyId: z.string(),
});

// Company Raw Data Schema
export const CompanyRawDataSchema = z.object({
  company: z.string(),
  problem: z.string(),
  solution: z.string(),
  product: z.string(),
  market: z.string(),
  businessModel: z.string(),
  team: z.string(),
  raising: z.string(),
  financials: z.string(),
  milestones: z.string(),
  other: z.string(),
});

// Main Company Profile Type
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;

export type CompanyRawData = z.infer<typeof CompanyRawDataSchema>;
