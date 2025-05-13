
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, FileText, ClipboardList, BookText } from 'lucide-react';

const TreeLegend: React.FC = () => {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 border-t pt-4">
      <div className="flex items-center gap-1 mr-2">
        <div className="w-3 h-3 bg-[#f3f4f6] border border-[#d1d5db] rounded-sm"></div>
        <span>Regular State</span>
      </div>
      
      <div className="flex items-center gap-1 mr-2">
        <div className="w-3 h-3 bg-[#2563eb] border border-[#2563eb] rounded-sm"></div>
        <span>Current State</span>
      </div>
      
      <div className="flex items-center gap-1 mr-2">
        <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#eab308] rounded-sm"></div>
        <Shield className="h-3 w-3 text-yellow-500" />
        <span>Sensitive Data</span>
      </div>
      
      <div className="flex items-center gap-1 mr-2">
        <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#3b82f6] rounded-sm"></div>
        <Shield className="h-3 w-3 text-blue-500" />
        <span>Verification</span>
      </div>
      
      <div className="flex items-center gap-1 mr-2">
        <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#22c55e] rounded-sm"></div>
        <Info className="h-3 w-3 text-green-500" />
        <span>Information</span>
      </div>
      
      <div className="flex items-center gap-1 mr-2">
        <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#8b5cf6] rounded-sm"></div>
        <FileText className="h-3 w-3 text-purple-500" />
        <span>Contract</span>
      </div>
      
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#f59e0b] rounded-sm"></div>
        <ClipboardList className="h-3 w-3 text-amber-500" />
        <span>Module</span>
      </div>
    </div>
  );
};

export default TreeLegend;
