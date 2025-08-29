import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download } from "lucide-react";

interface StudentChartProps {
  enrollments: number[];
  completions: number[];
}

export default function StudentChart({ enrollments, completions }: StudentChartProps) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = months.map((month, index) => ({
    month,
    enrollments: enrollments[index] || 0,
    completions: completions[index] || 0,
  }));

  return (
    <Card className="bg-card glassmorphism neumorphism" data-testid="card-student-chart">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-lg">Student Growth</h3>
            <p className="text-muted-foreground text-sm">New enrollments vs course completions</p>
          </div>
          <Button variant="ghost" size="sm" data-testid="button-export-student-data">
            <Download className="w-4 h-4" />
          </Button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                dataKey="enrollments" 
                fill="var(--secondary)" 
                radius={[4, 4, 0, 0]}
                name="New Enrollments"
              />
              <Bar 
                dataKey="completions" 
                fill="var(--chart-5)" 
                radius={[4, 4, 0, 0]}
                name="Course Completions"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
