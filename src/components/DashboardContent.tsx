
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
  Users, 
  Handshake, 
  Gavel, 
  Bell,
  Server,
  Leaf,
  Shield
} from 'lucide-react';

const DashboardContent = () => {
  return (
    <main className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-black">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-t-4 border-t-custom-blue min-h-[500px] flex flex-col overflow-hidden">
          <div className="bg-[#F2FCE2] p-4 w-full flex items-center gap-2">
            <Leaf className="text-black h-5 w-5" />
            <h2 className="text-black font-bold">Dimensão Ambiental</h2>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Indicadores Ambientais</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex-grow flex flex-col">
            <div className="text-2xl font-bold text-black">85%</div>
            <p className="text-xs text-black mb-4">
              +2.1% em relação ao período anterior
            </p>
            
            <div className="space-y-3 flex-grow flex flex-col justify-between py-4">
              <div className="flex items-center gap-2">
                <Droplet size={18} className="text-black" />
                <span className="text-sm text-black">Litro / TM</span>
                <span className="ml-auto text-sm font-medium text-black">435 L</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Weight size={18} className="text-black" />
                <span className="text-sm text-black">KG / TM</span>
                <span className="ml-auto text-sm font-medium text-black">1.234 kg</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-black" />
                <span className="text-sm text-black">KWH / TM</span>
                <span className="ml-auto text-sm font-medium text-black">156 kwh</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Fuel size={18} className="text-black" />
                <span className="text-sm text-black">L Combustível / TM</span>
                <span className="ml-auto text-sm font-medium text-black">48 L</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-black" />
                <span className="text-sm text-black">% de Resíduos Gerados</span>
                <span className="ml-auto text-sm font-medium text-black">5.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-custom-yellow min-h-[500px] flex flex-col overflow-hidden">
          <div className="bg-[#ea384c]/10 p-4 w-full flex items-center gap-2">
            <Users className="text-black h-5 w-5" />
            <h2 className="text-black font-bold">Dimensão Social</h2>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Indicadores Sociais</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex-grow flex flex-col">
            <div className="text-2xl font-bold text-black">72%</div>
            <p className="text-xs text-black mb-4">
              +0.9% em relação ao período anterior
            </p>
            
            <div className="space-y-3 flex-grow flex flex-col justify-between py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-black" />
                <span className="text-sm text-black">Incidentes de Processo</span>
                <span className="ml-auto text-sm font-medium text-black">3</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Bandage size={18} className="text-black" />
                <span className="text-sm text-black">Acidentes com Afastamento</span>
                <span className="ml-auto text-sm font-medium text-black">1</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Users size={18} className="text-black" />
                <span className="text-sm text-black">Denúncias por Discriminação</span>
                <span className="ml-auto text-sm font-medium text-black">0</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Handshake size={18} className="text-black" />
                <span className="text-sm text-black">Mulheres no Trabalho</span>
                <span className="ml-auto text-sm font-medium text-black">42%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-custom-red min-h-[500px] flex flex-col overflow-hidden">
          <div className="bg-[#D3E4FD] p-4 w-full flex items-center gap-2">
            <Shield className="text-black h-5 w-5" />
            <h2 className="text-black font-bold">Dimensão Governança</h2>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Indicadores de Governança</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex-grow flex flex-col">
            <div className="text-2xl font-bold text-black">93%</div>
            <p className="text-xs text-black mb-4">
              +5.4% em relação ao período anterior
            </p>
            
            <div className="space-y-3 flex-grow flex flex-col justify-between py-4">
              <div className="flex items-center gap-2">
                <Gavel size={18} className="text-black" />
                <span className="text-sm text-black">Denúncias por Corrupção</span>
                <span className="ml-auto text-sm font-medium text-black">0</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-black" />
                <span className="text-sm text-black">Reclamação de Vizinhos</span>
                <span className="ml-auto text-sm font-medium text-black">2</span>
              </div>
              <Separator />
              
              <div className="flex items-center gap-2">
                <Server size={18} className="text-black" />
                <span className="text-sm text-black">Incidentes Cibernéticos</span>
                <span className="ml-auto text-sm font-medium text-black">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DashboardContent;
