import React, { useState, useEffect } from 'react';
import { useESGDashboardData } from '@/hooks/useESGDashboardData';
import { useESGIndicatorEditor } from '@/hooks/useESGIndicatorEditor';
import IndicatorEditDialog from './dashboard/IndicatorEditDialog';
import IndicatorsSection from './dashboard/IndicatorsSection';
import DashboardLoading from './dashboard/DashboardLoading';
import { addIconsToIndicators } from '@/utils/dashboardUtils';
import { getCategoryIcon, getCategoryBgColor, getMonthName } from '@/utils/dashboardUtils';

interface DashboardContentProps {
  selectedMonth: string;
  selectedYear: string;
  isEditable: boolean;
  refreshTrigger?: number;
  selectedTerminal?: string;
  isLoading?: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  selectedMonth, 
  selectedYear, 
  isEditable,
  refreshTrigger = 0,
  selectedTerminal = "Rio Grande",
  isLoading: parentIsLoading = false
}) => {
  const {
    indicators: rawIndicators,
    environmentalIndicators: rawEnvironmentalIndicators,
    socialIndicators: rawSocialIndicators,
    governanceIndicators: rawGovernanceIndicators,
    tonnageIndicator: rawTonnageIndicator,
    isLoading: dataIsLoading,
    tonnage
  } = useESGDashboardData({
    selectedMonth,
    selectedYear,
    selectedTerminal,
    refreshTrigger
  });
  
  // Add icons to all indicators
  const [indicators, setIndicators] = useState(addIconsToIndicators(rawIndicators));
  const [environmentalIndicators, setEnvironmentalIndicators] = useState(addIconsToIndicators(rawEnvironmentalIndicators));
  const [socialIndicators, setSocialIndicators] = useState(addIconsToIndicators(rawSocialIndicators));
  const [governanceIndicators, setGovernanceIndicators] = useState(addIconsToIndicators(rawGovernanceIndicators));
  const [tonnageIndicator, setTonnageIndicator] = useState(
    rawTonnageIndicator ? { ...rawTonnageIndicator, icon: addIconsToIndicators([rawTonnageIndicator])[0].icon } : null
  );
  
  // Update local state when raw data changes
  useEffect(() => {
    setIndicators(addIconsToIndicators(rawIndicators));
    setEnvironmentalIndicators(addIconsToIndicators(rawEnvironmentalIndicators));
    setSocialIndicators(addIconsToIndicators(rawSocialIndicators));
    setGovernanceIndicators(addIconsToIndicators(rawGovernanceIndicators));
    setTonnageIndicator(
      rawTonnageIndicator ? { ...rawTonnageIndicator, icon: addIconsToIndicators([rawTonnageIndicator])[0].icon } : null
    );
  }, [rawIndicators, rawEnvironmentalIndicators, rawSocialIndicators, rawGovernanceIndicators, rawTonnageIndicator]);
  
  // Handle indicator updates
  const handleIndicatorUpdate = (updatedIndicator: any) => {
    // Update the specific indicator in all relevant arrays
    setIndicators(prev => prev.map(ind => 
      ind.name === updatedIndicator.name ? { ...ind, value: updatedIndicator.value, id: updatedIndicator.id } : ind
    ));
    
    // Update the category-specific arrays
    if (updatedIndicator.category === 'environmental') {
      setEnvironmentalIndicators(prev => prev.map(ind => 
        ind.name === updatedIndicator.name ? { ...ind, value: updatedIndicator.value, id: updatedIndicator.id } : ind
      ));
      
      // If it's the tonnage indicator, update that specifically
      if (updatedIndicator.name === 'tonelada') {
        setTonnageIndicator({ ...updatedIndicator, icon: tonnageIndicator?.icon });
      }
    } else if (updatedIndicator.category === 'social') {
      setSocialIndicators(prev => prev.map(ind => 
        ind.name === updatedIndicator.name ? { ...ind, value: updatedIndicator.value, id: updatedIndicator.id } : ind
      ));
    } else if (updatedIndicator.category === 'governance') {
      setGovernanceIndicators(prev => prev.map(ind => 
        ind.name === updatedIndicator.name ? { ...ind, value: updatedIndicator.value, id: updatedIndicator.id } : ind
      ));
    }
  };
  
  // Set up the editor hook
  const {
    editingIndicator,
    newValue,
    isDialogOpen,
    setNewValue,
    handleEdit,
    handleSave,
    closeDialog
  } = useESGIndicatorEditor({
    selectedMonth,
    selectedYear,
    selectedTerminal,
    onIndicatorUpdate: handleIndicatorUpdate
  });
  
  if (dataIsLoading || parentIsLoading) {
    return <DashboardLoading selectedMonth={selectedMonth} selectedYear={selectedYear} />;
  }

  return (
    <main className="flex-1 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-black">
        Resumo - Terminal {selectedTerminal}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Environmental Section */}
        <IndicatorsSection 
          title="Dimensão Ambiental"
          indicators={environmentalIndicators}
          category="environmental"
          iconComponent={getCategoryIcon('environmental')}
          bgColorClass={getCategoryBgColor('environmental').bgClass}
          isEditable={isEditable}
          tonnage={tonnage}
          onEdit={handleEdit}
        />
        
        {/* Social Section - Changed to red */}
        <IndicatorsSection 
          title="Dimensão Social"
          indicators={socialIndicators}
          category="social"
          iconComponent={getCategoryIcon('social')}
          bgColorClass="red-600" // Changed to a strong red
          isEditable={isEditable}
          tonnage={tonnage}
          onEdit={handleEdit}
        />
        
        {/* Governance Section - Changed to header blue */}
        <IndicatorsSection 
          title="Dimensão Governança"
          indicators={governanceIndicators}
          category="governance"
          iconComponent={getCategoryIcon('governance')}
          bgColorClass="sidebar" // Using the same blue as the header (sidebar color)
          isEditable={isEditable}
          tonnage={tonnage}
          onEdit={handleEdit}
        />
      </div>

      {/* Edit Dialog */}
      <IndicatorEditDialog 
        isOpen={isDialogOpen}
        onClose={closeDialog}
        editingIndicator={editingIndicator}
        newValue={newValue}
        onValueChange={setNewValue}
        onSave={handleSave}
      />
    </main>
  );
};

export default DashboardContent;
