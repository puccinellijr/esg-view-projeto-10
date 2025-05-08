
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Droplet, 
  Weight, 
  Zap, 
  Fuel, 
  Percent, 
  AlertTriangle, 
  Bandage, 
  Handshake, 
  Users, 
  Gavel, 
  Bell,
  Server
} from 'lucide-react';

const DashboardContent = () => {
  return (
    <main className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-custom-blue">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-t-4 border-t-custom-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-custom-gray">Indicadores Ambientais</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-custom-blue">85%</div>
            <p className="text-xs text-custom-gray mb-4">
              +2.1% em relação ao período anterior
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplet size={18} className="text-custom-blue" />
                <span className="text-sm">Litro / TM</span>
                <span className="ml-auto text-sm font-medium">435 L</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Weight size={18} className="text-custom-blue" />
                <span className="text-sm">KG / TM</span>
                <span className="ml-auto text-sm font-medium">1.234 kg</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-custom-blue" />
                <span className="text-sm">KWH / TM</span>
                <span className="ml-auto text-sm font-medium">156 kwh</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Fuel size={18} className="text-custom-blue" />
                <span className="text-sm">L Combustível / TM</span>
                <span className="ml-auto text-sm font-medium">48 L</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-custom-blue" />
                <span className="text-sm">% de Resíduos Gerados</span>
                <span className="ml-auto text-sm font-medium">5.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-custom-yellow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-custom-gray">Indicadores Sociais</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-custom-yellow">72%</div>
            <p className="text-xs text-custom-gray mb-4">
              +0.9% em relação ao período anterior
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-custom-yellow" />
                <span className="text-sm">Incidentes de Processo</span>
                <span className="ml-auto text-sm font-medium">3</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Bandage size={18} className="text-custom-yellow" />
                <span className="text-sm">Acidentes com Afastamento</span>
                <span className="ml-auto text-sm font-medium">1</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Users size={18} className="text-custom-yellow" />
                <span className="text-sm">Denúncias por Discriminação</span>
                <span className="ml-auto text-sm font-medium">0</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Handshake size={18} className="text-custom-yellow" />
                <span className="text-sm">Mulheres no Trabalho</span>
                <span className="ml-auto text-sm font-medium">42%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-custom-red">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-custom-gray">Indicadores de Governança</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-custom-red">93%</div>
            <p className="text-xs text-custom-gray mb-4">
              +5.4% em relação ao período anterior
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gavel size={18} className="text-custom-red" />
                <span className="text-sm">Denúncias por Corrupção</span>
                <span className="ml-auto text-sm font-medium">0</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-custom-red" />
                <span className="text-sm">Reclamação de Vizinhos</span>
                <span className="ml-auto text-sm font-medium">2</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Server size={18} className="text-custom-red" />
                <span className="text-sm">Incidentes Cibernéticos</span>
                <span className="ml-auto text-sm font-medium">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DashboardContent;
