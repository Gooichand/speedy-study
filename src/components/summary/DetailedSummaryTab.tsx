
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import CopyButton from './CopyButton';

interface DetailedSummaryTabProps {
  summary: string;
  copiedSection: string | null;
  onCopy: (text: string, section: string) => void;
}

const DetailedSummaryTab: React.FC<DetailedSummaryTabProps> = ({
  summary,
  copiedSection,
  onCopy
}) => {
  return (
    <TabsContent value="detailed" className="space-y-4 mt-0">
      <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-8 rounded-xl border border-slate-600/30 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-100">Detailed Summary</h3>
          <CopyButton
            text={summary}
            section="Detailed Summary"
            isActive={copiedSection === 'Detailed Summary'}
            onCopy={onCopy}
            colorClass="border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200"
          />
        </div>
        <p className="text-slate-300 leading-relaxed text-lg">{summary}</p>
      </div>
    </TabsContent>
  );
};

export default DetailedSummaryTab;
