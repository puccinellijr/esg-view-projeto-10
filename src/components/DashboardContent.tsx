
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, PieChart } from 'lucide-react';

const DashboardContent = () => {
  return (
    <main className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-custom-blue">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-t-4 border-t-custom-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-custom-gray">Indicadores Ambientais</CardTitle>
            <PieChart className="h-4 w-4 text-custom-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-custom-blue">85%</div>
            <p className="text-xs text-custom-gray">
              +2.1% em relação ao período anterior
            </p>
            <div className="h-32 mt-4 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-custom-blue/10 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-custom-blue/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-custom-blue text-white flex items-center justify-center font-bold">
                    85%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-custom-yellow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-custom-gray">Indicadores Sociais</CardTitle>
            <LineChart className="h-4 w-4 text-custom-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-custom-yellow">72%</div>
            <p className="text-xs text-custom-gray">
              +0.9% em relação ao período anterior
            </p>
            <div className="h-32 mt-4 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-custom-yellow/10 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-custom-yellow/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-custom-yellow text-white flex items-center justify-center font-bold">
                    72%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-custom-red">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-custom-gray">Indicadores de Governança</CardTitle>
            <BarChart3 className="h-4 w-4 text-custom-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-custom-red">93%</div>
            <p className="text-xs text-custom-gray">
              +5.4% em relação ao período anterior
            </p>
            <div className="h-32 mt-4 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-custom-red/10 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-custom-red/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-custom-red text-white flex items-center justify-center font-bold">
                    93%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DashboardContent;
