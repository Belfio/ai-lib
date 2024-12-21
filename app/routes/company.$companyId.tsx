import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search } from "lucide-react";
import { Link } from "@remix-run/react";

export default function CompanyPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:opacity-80">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <img
                src="https://www.revolut.com/favicon.ico"
                alt="Revolut"
                className="h-8 w-8"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Revolut</h1>
              <a
                href="https://www.revolut.com/en-EE/"
                className="text-sm text-gray-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.revolut.com/en-EE/
              </a>
            </div>
          </div>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Search" className="pl-8" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start gap-2 h-auto bg-transparent  border-b-[1.5px] border-gray-200">
          <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="financials"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Financials
          </TabsTrigger>
          <TabsTrigger
            value="benchmarking"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Benchmarking
          </TabsTrigger>
          <TabsTrigger
            value="ownership"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Ownership
          </TabsTrigger>
          <TabsTrigger
            value="datasources"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Data Sources
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="meetings"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Meetings
          </TabsTrigger>
          <TabsTrigger
            value="deals"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Deals
          </TabsTrigger>
          <TabsTrigger
            value="keypeople"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Key people
          </TabsTrigger>
          <TabsTrigger
            value="aichat"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            AI Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Overview</h3>
                  <p className="text-sm text-gray-600">
                    Founded in 2015 in London, Revolut is a global financial
                    technology company that provides digital-first financial
                    services to individuals and businesses. Its core offerings
                    include payments, foreign exchange, savings, investments,
                    and credit, with a focus on accessibility, transparency, and
                    cost efficiency.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Global Reach</h3>
                  <p className="text-sm text-gray-600">
                    Revolut operates across 38 countries and serves 45 million
                    retail customers as of 2023. Its geographical expansion
                    includes markets in Europe, Asia-Pacific, and the Americas,
                    with a significant presence in the European Economic Area
                    (EEA), where it holds a banking license in 30 countries.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Model</h3>
                  <p className="text-sm text-gray-600">
                    Revolut's business model combines transactional revenues
                    (payments, FX), subscription income from premium accounts,
                    and banking revenue from lending and deposits.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Financials Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Key financials (€'000) and KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metrics</TableHead>
                      <TableHead className="text-right">2020</TableHead>
                      <TableHead className="text-right">2021</TableHead>
                      <TableHead className="text-right">2022</TableHead>
                      <TableHead className="text-right">2023</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Retail customers (m)</TableCell>
                      <TableCell className="text-right">11</TableCell>
                      <TableCell className="text-right">16</TableCell>
                      <TableCell className="text-right">26</TableCell>
                      <TableCell className="text-right">38</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Employees</TableCell>
                      <TableCell className="text-right">2,200</TableCell>
                      <TableCell className="text-right">2,795</TableCell>
                      <TableCell className="text-right">5,913</TableCell>
                      <TableCell className="text-right">8,152</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cash & cash equivalents</TableCell>
                      <TableCell className="text-right">5,055,023</TableCell>
                      <TableCell className="text-right">7,052,609</TableCell>
                      <TableCell className="text-right">10,581,018</TableCell>
                      <TableCell className="text-right">12,827,654</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total assets</TableCell>
                      <TableCell className="text-right">5,273,103</TableCell>
                      <TableCell className="text-right">8,631,755</TableCell>
                      <TableCell className="text-right">14,066,779</TableCell>
                      <TableCell className="text-right">17,361,013</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Customer liabilities</TableCell>
                      <TableCell className="text-right">2,121,085</TableCell>
                      <TableCell className="text-right">7,361,196</TableCell>
                      <TableCell className="text-right">12,593,188</TableCell>
                      <TableCell className="text-right">15,197,968</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    Multi-Currency Accounts
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hold, spend, and transfer over 30 currencies at real-time
                    exchange rates, with no hidden fees.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cards</h3>
                  <p className="text-sm text-gray-600">
                    Physical and virtual debit cards, including premium options
                    like Metal and Ultra, with features like global spending,
                    security controls, and cashback.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Savings & Investments</h3>
                  <p className="text-sm text-gray-600">
                    Savings Vaults: Sub-accounts for saving, with interest
                    options.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">2015:</span> Revolut founded
                  in the UK.
                </div>
                <div className="text-sm">
                  <span className="font-semibold">2016:</span> Reached 300,000
                  customers; raised $15M Series A funding.
                </div>
                <div className="text-sm">
                  <span className="font-semibold">2018:</span> Obtained first
                  banking license (Bank of Lithuania) and launched Metal cards.
                </div>
                <div className="text-sm">
                  <span className="font-semibold">2019:</span> Expanded to
                  Australia and Singapore; introduced fractional stock trading.
                </div>
                <div className="text-sm">
                  <span className="font-semibold">2020:</span> Launched Revolut
                  Insurance and Open Banking in the UK and EEA.
                </div>
                <div className="text-sm">
                  <span className="font-semibold">2021:</span> Achieved banking
                  services in 18 EEA countries and launched Stays for travel
                  booking.
                </div>
                <div className="text-sm">
                  <span className="font-semibold">2022:</span> Surpassed €100B
                  in transactions; introduced Local IBANs and Revolut Chat.
                </div>
                <div className="text-sm">
                  <span className="font-semibold">2023:</span> Expanded to 38
                  countries, including Brazil and New Zealand; launched
                  Robo-advisor, Joint Accounts, and the premium Ultra plan.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
