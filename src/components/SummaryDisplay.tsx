
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, List, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseSummary } from '@/utils/summaryParser';
import { getDifficultyColor, getDocumentTypeColor } from '@/utils/badgeUtils';
import DetailedSummaryTab from '@/components/summary/DetailedSummaryTab';
import BriefSummaryTab from '@/components/summary/BriefSummaryTab';
import KeyPointsTab from '@/components/summary/KeyPointsTab';
import OverviewTab from '@/components/summary/OverviewTab';

interface SummaryDisplayProps {
  summary: string;
  title: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, title }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const summaryData = parseSummary(summary);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
      toast({
        title: "Copied!",
        description: `${section} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="glass-card border-slate-700/50 shadow-2xl bg-slate-800/40 backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-b border-slate-600/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-glow-purple">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <span className="text-slate-100 text-2xl">AI-Generated Summary</span>
              <p className="text-slate-300 text-sm mt-1">Intelligent analysis of your document</p>
            </div>
          </CardTitle>
          <div className="flex space-x-3">
            {summaryData.documentType && summaryData.documentType !== 'Unknown' && (
              <Badge variant="outline" className={getDocumentTypeColor(summaryData.documentType)}>
                {summaryData.documentType}
              </Badge>
            )}
            {summaryData.difficulty && summaryData.difficulty !== 'Unknown' && (
              <Badge variant="outline" className={getDifficultyColor(summaryData.difficulty)}>
                {summaryData.difficulty}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="detailed" className="w-full">
          <TabsList className="grid w-full grid-cols-4 m-6 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/30">
            <TabsTrigger value="detailed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-slate-300 rounded-lg transition-all hover:bg-slate-700/50">
              <BookOpen size={16} className="mr-2" />
              Detailed
            </TabsTrigger>
            <TabsTrigger value="brief" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-slate-300 rounded-lg transition-all hover:bg-slate-700/50">
              <FileText size={16} className="mr-2" />
              Brief
            </TabsTrigger>
            <TabsTrigger value="keypoints" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-slate-300 rounded-lg transition-all hover:bg-slate-700/50">
              <List size={16} className="mr-2" />
              Key Points
            </TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-slate-300 rounded-lg transition-all hover:bg-slate-700/50">
              <Lightbulb size={16} className="mr-2" />
              Overview
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6">
            <DetailedSummaryTab
              summary={summaryData.detailed}
              copiedSection={copiedSection}
              onCopy={copyToClipboard}
            />
            <BriefSummaryTab
              summary={summaryData.brief}
              copiedSection={copiedSection}
              onCopy={copyToClipboard}
            />
            <KeyPointsTab
              keyPoints={summaryData.keyPoints}
              copiedSection={copiedSection}
              onCopy={copyToClipboard}
            />
            <OverviewTab
              mainTopics={summaryData.mainTopics}
              documentType={summaryData.documentType}
              difficulty={summaryData.difficulty}
            />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SummaryDisplay;
