
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getDifficultyColor, getDocumentTypeColor } from '@/utils/badgeUtils';

interface OverviewTabProps {
  mainTopics: string;
  documentType: string;
  difficulty: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  mainTopics,
  documentType,
  difficulty
}) => {
  return (
    <TabsContent value="overview" className="space-y-4 mt-0">
      <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-8 rounded-xl border border-slate-600/30 shadow-lg">
        <h3 className="text-2xl font-bold text-slate-100 mb-6">Document Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-200 text-lg">Main Topics</h4>
            <p className="text-slate-300 text-lg leading-relaxed">{mainTopics}</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-200 text-lg">Document Classification</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-slate-400">Type:</span>
                <Badge className={getDocumentTypeColor(documentType)}>
                  {documentType}
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-400">Difficulty:</span>
                <Badge className={getDifficultyColor(difficulty)}>
                  {difficulty}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

export default OverviewTab;
