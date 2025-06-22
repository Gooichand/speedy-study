
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import CopyButton from './CopyButton';

interface KeyPointsTabProps {
  keyPoints: string[];
  copiedSection: string | null;
  onCopy: (text: string, section: string) => void;
}

const KeyPointsTab: React.FC<KeyPointsTabProps> = ({
  keyPoints,
  copiedSection,
  onCopy
}) => {
  return (
    <TabsContent value="keypoints" className="space-y-4 mt-0">
      <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-8 rounded-xl border border-slate-600/30 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-100">Key Points</h3>
          <CopyButton
            text={keyPoints.map(point => `• ${point}`).join('\n')}
            section="Key Points"
            isActive={copiedSection === 'Key Points'}
            onCopy={onCopy}
            colorClass="border-amber-500/50 text-amber-300 hover:bg-amber-600/20 hover:text-amber-200"
          />
        </div>
        <ul className="space-y-4">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                <span className="text-white text-sm font-bold">{index + 1}</span>
              </div>
              <span className="text-slate-300 leading-relaxed text-lg">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </TabsContent>
  );
};

export default KeyPointsTab;
