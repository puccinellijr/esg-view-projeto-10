
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, PieChart } from 'lucide-react';

const DashboardContent = () => {
  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-semibold mb-6">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicadores Ambientais</CardTitle>
            <PieChart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% em relação ao período anterior
            </p>
            <div className="h-32 mt-4 flex items-center justify-center text-green-500">
              Dados do Gráfico Ambiental
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicadores Sociais</CardTitle>
            <LineChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">
              +0.9% em relação ao período anterior
            </p>
            <div className="h-32 mt-4 flex items-center justify-center text-blue-500">
              Dados do Gráfico Social
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicadores de Governança</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93%</div>
            <p className="text-xs text-muted-foreground">
              +5.4% em relação ao período anterior
            </p>
            <div className="h-32 mt-4 flex items-center justify-center text-purple-500">
              Dados do Gráfico de Governança
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DashboardContent;
