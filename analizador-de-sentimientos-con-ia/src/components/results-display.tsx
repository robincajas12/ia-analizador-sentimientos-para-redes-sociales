'use client';

import type { AnalysisResult } from '@/app/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { BarChart as BarChartIcon, Bot } from 'lucide-react';

const sentimentColors = {
  Positive: 'hsl(var(--chart-2))',
  Negative: 'hsl(var(--chart-5))',
  Neutral: 'hsl(var(--chart-4))',
};

const sentimentStyles = {
    Positive: {
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
    Negative: {
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/20',
    },
    Neutral: {
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/20',
    },
  };

export function ResultsDisplay({ result }: { result: AnalysisResult | null }) {
  if (!result) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[400px] border-dashed">
        <CardContent className="flex flex-col items-center justify-center text-center p-6">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Bot className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground">Analysis Results</h3>
          <p className="text-muted-foreground mt-2 max-w-xs">
            Submit some text to see the simulated sentiment analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { sentiment, confidence, probabilities } = result;
  const chartConfig = {
    value: { label: 'Value' },
    ...probabilities.reduce((acc, cur) => {
        acc[cur.name] = { label: cur.name, color: sentimentColors[cur.name] };
        return acc;
    }, {} as any)
  };

  const currentStyle = sentimentStyles[sentiment];
  const chartData = probabilities.filter(p => p.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="w-6 h-6" />
            Results
        </CardTitle>
        <CardDescription>
          Sentiment prediction based on the provided text.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`p-4 rounded-lg border ${currentStyle.bgColor} ${currentStyle.borderColor}`}>
          <div className="flex justify-between items-center">
            <span className={`text-xl font-bold ${currentStyle.textColor}`}>
              {sentiment}
            </span>
            <span className={`text-3xl font-bold ${currentStyle.textColor}`}>
              {(confidence * 100).toFixed(0)}%
              <span className="text-base font-medium ml-1">Confidence</span>
            </span>
          </div>
        </div>

        <div>
            <h4 className="font-medium mb-4 text-center text-muted-foreground">Sentiment Distribution</h4>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                        stroke="hsl(var(--card))"
                    >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {(confidence * 100).toFixed(0)}%
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground"
                              >
                                {sentiment}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartConfig[entry.name].color} />
                    ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
