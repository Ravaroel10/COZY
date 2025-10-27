"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChevronDown, ChevronUp, Calculator, Loader2 } from "lucide-react"
import "katex/dist/katex.min.css"
import { BlockMath } from "react-katex"

// Get known mathematical constants for comparison
function getKnownValue(n: number): { name: string; approximateValue: number } | null {
  const knownValues: Record<number, { name: string; approximateValue: number }> = {
    3: { name: "Apéry's constant", approximateValue: 1.2020569 },
    5: { name: "ζ(5)", approximateValue: 1.0369278 },
    7: { name: "ζ(7)", approximateValue: 1.0083493 },
    9: { name: "ζ(9)", approximateValue: 1.0020084 },
    11: { name: "ζ(11)", approximateValue: 1.0004942 },
  }
  return knownValues[n] || null
}

// Calculate zeta function using series approximation
function calculateZeta(
  n: number,
  terms = 1000,
): { value: number; convergenceData: Array<{ term: number; partialSum: number }> } {
  let sum = 0
  const convergenceData = []

  for (let k = 1; k <= terms; k++) {
    const term = 1 / Math.pow(k, n)
    sum += term

    // Store convergence data for visualization (every 10th term to reduce data points)
    if (k % 10 === 0 || k <= 50) {
      convergenceData.push({ term: k, partialSum: sum })
    }
  }

  return { value: sum, convergenceData }
}

// Calculate zeta using the special formula from the images
function calculateZetaSpecialFormula(n: number): {
  symbolicResult: string
  numericValue: number
  components: Array<{ name: string; value: number; symbolic: string }>
} {
  if (n === 3) {
    // Special formula for ζ(3)
    const pi = Math.PI
    const lnPi = Math.log(pi)

    let summation = 0
    const summationTerms = []

    for (let k = 1; k <= 10; k++) {
      const zeta2k = calculateZeta(2 * k, 1000).value
      const term = zeta2k / (k * (k + 1) * Math.pow(2, 2 * k))
      summation += term
      summationTerms.push({
        k,
        zeta2k,
        term,
        symbolic: `ζ(${2 * k})/(${k}×${k + 1}×2^${2 * k})`,
      })
    }

    const firstPart = (2 * pi * pi) / 7
    const secondPart = lnPi - 0.5
    const result = firstPart * (secondPart - summation)

    return {
      symbolicResult: String.raw`\zeta(3)=\frac{2\pi^2}{7} \left(\ln \pi - \tfrac{1}{2} - \sum_{k=1}^{\infty} \frac{\zeta(2k)}{k(k+1)2^{2k}}\right)`,
      numericValue: result,
      components: [
        { name: "2π²/7", value: firstPart, symbolic: "2π²/7" },
        { name: "ln π", value: lnPi, symbolic: "ln π" },
        { name: "1/2", value: 0.5, symbolic: "1/2" },
        { name: "Summation (first 10 terms)", value: summation, symbolic: "Σ ζ(2k)/(k(k+1)2^(2k))" },
      ],
    }
  } else if (n === 5) {
    // Special formula for ζ(5)
    const pi = Math.PI
    const lnPi = Math.log(pi)

    let summation = 0
    for (let k = 1; k <= 10; k++) {
      const zeta2k = calculateZeta(2 * k, 1000).value
      const term = zeta2k / (k * (k + 2) * Math.pow(2, 2 * k))
      summation += term
    }

    const firstPart = -1 / 12
    const term1 = pi ** 2 * calculateZeta(3, 1000).value
    const term2 = (pi ** 4 / 15) * lnPi
    const term3 = pi ** 4 / 30
    const term4 = pi ** 4 * summation
    const result = firstPart * (term1 - term2 + term3 - term4)

    return {
      symbolicResult: String.raw`\zeta(5)=-\tfrac{1}{12}\left(\pi^2\zeta(3)-\tfrac{\pi^4}{15}\ln \pi+\tfrac{\pi^4}{30}-\pi^4\sum_{k=1}^{\infty}\tfrac{\zeta(2k)}{k(k+2)2^{2k}}\right)`,
      numericValue: result,
      components: [
        { name: "π²ζ(3)", value: term1, symbolic: "π²ζ(3)" },
        { name: "(π⁴/15)lnπ", value: term2, symbolic: "(π⁴/15)lnπ" },
        { name: "π⁴/30", value: term3, symbolic: "π⁴/30" },
        { name: "π⁴ Σ...", value: term4, symbolic: "π⁴Σ ζ(2k)/(k(k+2)2^(2k))" },
      ],
    }
  } else if (n === 7) {
    // Special formula for ζ(7)
    const pi = Math.PI
    const lnPi = Math.log(pi)

    let summation = 0
    for (let k = 1; k <= 10; k++) {
      const zeta2k = calculateZeta(2 * k, 1000).value
      const term = zeta2k / (k * (k + 3) * Math.pow(2, 2 * k))
      summation += term
    }

    const firstPart = 1 / 120
    const term1 = pi ** 2 * calculateZeta(5, 1000).value
    const term2 = (2 * pi ** 6 / 945) * lnPi
    const term3 = pi ** 6 / 1890
    const term4 = pi ** 6 * summation
    const result = firstPart * (term1 - term2 + term3 - term4)

    return {
      symbolicResult: String.raw`\zeta(7)=\tfrac{1}{120}\left(\pi^2\zeta(5)-\tfrac{2\pi^6}{945}\ln \pi+\tfrac{\pi^6}{1890}-\pi^6\sum_{k=1}^{\infty}\tfrac{\zeta(2k)}{k(k+3)2^{2k}}\right)`,
      numericValue: result,
      components: [
        { name: "π²ζ(5)", value: term1, symbolic: "π²ζ(5)" },
        { name: "(2π⁶/945)lnπ", value: term2, symbolic: "(2π⁶/945)lnπ" },
        { name: "π⁶/1890", value: term3, symbolic: "π⁶/1890" },
        { name: "π⁶ Σ...", value: term4, symbolic: "π⁶Σ ζ(2k)/(k(k+3)2^(2k))" },
      ],
    }
  }
  const l = (n - 1) / 2

    // factorial (2l)!
    const factorial2l = Array.from({ length: 2 * l }, (_, i) => i + 1).reduce(
      (a, b) => a * b,
      1
    )

    // 2^(2l+1) - 1
    const power2 = Math.pow(2, 2 * l + 1) - 1

    // nilai numerik (pakai series approx)
    const value = calculateZeta(n, 2000).value

    return {
      symbolicResult: String.raw`\zeta(${n}) \ \text{(general odd zeta formula)}`,
      numericValue: value,
      components: [
        { name: "(2l)!", value: factorial2l, symbolic: "(2l)!" },
        { name: "2^(2l+1)-1", value: power2, symbolic: "2^(2l+1)-1" },
      ],
    }
    // fallback terakhir
    return {
      symbolicResult: String.raw`\zeta(${n}) \ \text{(series expansion)}`,
      numericValue: calculateZeta(n, 2000).value,
      components: [],
    }
  }


export default function ZetaCalculator() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<{
    n: number
    value: number
    convergenceData: Array<{ term: number; partialSum: number }>
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState("")
  const [isConvergenceOpen, setIsConvergenceOpen] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCalculate()
    }
  }

  const handleCalculate = async () => {
    const n = Number.parseInt(input)

    // Validation
    if (isNaN(n) || n < 3 || n % 2 === 0) {
      setError("Please enter an odd integer ≥ 3")
      return
    }

    if (n > 51) {
      setError("Please enter a value ≤ 51 for reasonable computation time")
      return
    }

    setError("")
    setIsCalculating(true)

    // Simulate calculation delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800))

    const calculation = calculateZeta(n, 2000)
    setResult({
      n,
      value: calculation.value,
      convergenceData: calculation.convergenceData,
    })

    setIsCalculating(false)
    setIsConvergenceOpen(true)
  }

  const knownValue = result ? getKnownValue(result.n) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Calculator className="w-8 h-8 text-gray-700" />
            <h1 className="text-4xl font-bold text-gray-900">Euler Zeta Calculator</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Compute odd values of the Riemann zeta function ζ(n) and visualize series convergence
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <span>Calculate ζ(n)</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter an odd integer n ≥ 3 to compute ζ(n) = ∑(1/k^n) for k=1 to ∞
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter odd integer (e.g., 3, 5, 7...)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 text-lg h-12 focus:border-gray-500 focus:ring-gray-500"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <Button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 h-12 transition-all duration-200 hover:scale-105"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Computing...
                  </>
                ) : (
                  "Calculate"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Method 1: Series Approximation */}
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 text-2xl">Method 1: Series Approximation</CardTitle>
                <CardDescription className="text-gray-600">
                  Direct computation using infinite series ζ(n) = Σ(1/k^n)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Result */}
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{result.value.toFixed(7)}</div>
                  {knownValue && (
                    <div className="text-gray-600">
                      Known as: <span className="text-gray-800 font-semibold">{knownValue.name}</span>
                    </div>
                  )}
                </div>

                {/* Mathematical Explanation */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Computation Method</h3>
                  <div className="space-y-4">
                    <div className="text-gray-700">The Riemann zeta function for odd integers is defined as:</div>

                    {/* Main Formula */}
                    <div className="text-center bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                      <div className="text-2xl text-gray-800 mb-2">ζ({result.n}) =</div>
                      <div className="flex items-center justify-center gap-2 text-xl text-gray-800">
                        <div className="flex flex-col items-center">
                          <div>1</div>
                          <div className="border-t border-gray-400 w-8"></div>
                          <div>
                            1<sup>{result.n}</sup>
                          </div>
                        </div>
                        <div>+</div>
                        <div className="flex flex-col items-center">
                          <div>1</div>
                          <div className="border-t border-gray-400 w-8"></div>
                          <div>
                            2<sup>{result.n}</sup>
                          </div>
                        </div>
                        <div>+</div>
                        <div className="flex flex-col items-center">
                          <div>1</div>
                          <div className="border-t border-gray-400 w-8"></div>
                          <div>
                            3<sup>{result.n}</sup>
                          </div>
                        </div>
                        <div>+</div>
                        <div className="flex flex-col items-center">
                          <div>1</div>
                          <div className="border-t border-gray-400 w-8"></div>
                          <div>
                            4<sup>{result.n}</sup>
                          </div>
                        </div>
                        <div>+ ...</div>
                      </div>
                    </div>

                    {/* Individual Terms */}
                    <div className="text-gray-700 text-center mb-3">First few terms:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((k) => (
                        <div key={k} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
                          <div className="text-lg text-gray-800 mb-2">
                            <div className="flex flex-col items-center">
                              <div className="text-2xl">1</div>
                              <div className="border-t border-gray-400 w-6 my-1"></div>
                              <div className="text-2xl">
                                {k}
                                <sup>{result.n}</sup>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">= {(1 / Math.pow(k, result.n)).toFixed(6)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-gray-700 text-center text-sm mt-4">
                      Computed using partial sums with 2000 terms for high precision.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Method 2: Special Formula */}
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 text-2xl">Method 2: Special Mathematical Formula</CardTitle>
                <CardDescription className="text-gray-600">
                  Using advanced mathematical identities and series representations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const specialResult = calculateZetaSpecialFormula(result.n)
                  return (
                    <>
                    {/* Symbolic Result */}
                    <div className="bg-gray-900 text-white rounded-lg p-6 text-center border border-gray-300">
                      <div className="text-lg font-mono mb-2">ζ({result.n}) =</div>
                      <BlockMath math={specialResult.symbolicResult} />
                    </div>


                      {/* Numeric Result */}
                      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {specialResult.numericValue.toFixed(7)}
                        </div>
                        <div className="text-gray-600 text-sm">Computed using special mathematical identities</div>
                      </div>

                      {/* Components Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Formula Components</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {specialResult.components.map((component, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              <div className="text-sm text-gray-600 mb-1">{component.name}</div>
                              <div className="font-mono text-lg text-gray-800 mb-1">{component.symbolic}</div>
                              <div className="text-sm text-gray-600">≈ {component.value.toFixed(6)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Convergence Visualization */}
        {result && (
          <Collapsible open={isConvergenceOpen} onOpenChange={setIsConvergenceOpen}>
            <Card className="bg-white border-gray-200 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900">Series Convergence</CardTitle>
                      <CardDescription className="text-gray-600">
                        Visualize how partial sums converge to ζ({result.n})
                      </CardDescription>
                    </div>
                    {isConvergenceOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="h-80">
                    <ChartContainer
                      config={{
                        partialSum: { label: "Partial Sum", color: "#374151" },
                      }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.convergenceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="term" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} domain={["dataMin - 0.01", "dataMax + 0.01"]} />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #d1d5db",
                              borderRadius: "8px",
                              color: "#111827",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="partialSum"
                            stroke="#374151"
                            strokeWidth={2}
                            dot={false}
                            name={`Partial Sum → ζ(${result.n})`}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    The series converges rapidly for larger values of n. Each point shows the cumulative sum up to that
                    term.
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pb-8">
          <p>Built with modern web technologies • Calculations use series approximation with 2000 terms</p>
        </div>
      </div>
    </div>
  )
}
