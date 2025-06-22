
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, List, Lightbulb, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SummaryDisplayProps {
  summary: string;
  title: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, title }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const parseSummary = (summaryText: string) => {
    const sections = summaryText.split('##').filter(section => section.trim());
    
    const parsed = {
      detailed: '',
      brief: '',
      keyPoints: [] as string[],
      mainTopics: '',
      documentType: '',
      difficulty: ''
    };

    sections.forEach(section => {
      const lines = section.trim().split('\n');
      const heading = lines[0].trim().toLowerCase();
      const content = lines.slice(1).join('\n').trim();

      if (heading.includes('detailed summary')) {
        parsed.detailed = content;
      } else if (heading.includes('brief summary')) {
        parsed.brief = content;
      } else if (heading.includes('key points')) {
        parsed.keyPoints = content.split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim());
      } else if (heading.includes('main topics')) {
        parsed.mainTopics = content;
      } else if (heading.includes('document classification')) {
        const classificationLines = content.split('\n');
        classificationLines.forEach(line => {
          if (line.includes('Type:')) {
            parsed.documentType = line.replace('Type:', '').trim();
          }
          if (line.includes('Difficulty:')) {
            parsed.difficulty = line.replace('Difficulty:', '').trim();
          }
        });
      }
    });

    return parsed;
  };

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-900/50 text-green-300 border-green-600';
      case 'intermediate': return 'bg-yellow-900/50 text-yellow-300 border-yellow-600';
      case 'advanced': return 'bg-red-900/50 text-red-300 border-red-600';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <Card className="glass-card border-slate-700/50">
      <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <span className="text-slate-100">AI-Generated Summary</span>
          </CardTitle>
          <div className="flex space-x-2">
            {summaryData.documentType && (
              <Badge variant="outline" className="bg-slate-800/50 text-purple-300 border-purple-500/50">
                {summaryData.documentType}
              </Badge>
            )}
            {summaryData.difficulty && (
              <Badge variant="outline" className={getDifficultyColor(summaryData.difficulty)}>
                {summaryData.difficulty}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="detailed" className="w-full">
          <TabsList className="grid w-full grid-cols-4 m-4 bg-slate-800/50">
            <TabsTrigger value="detailed" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300">
              <BookOpen size={16} className="mr-2" />
              Detailed
            </TabsTrigger>
            <TabsTrigger value="brief" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300">
              <FileText size={16} className="mr-2" />
              Brief
            </TabsTrigger>
            <TabsTrigger value="keypoints" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300">
              <List size={16} className="mr-2" />
              Key Points
            </TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300">
              <Lightbulb size={16} className="mr-2" />
              Overview
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6">
            <TabsContent value="detailed" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-6 rounded-lg border border-slate-600/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-100">Detailed Summary</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.detailed, 'Detailed Summary')}
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200"
                  >
                    {copiedSection === 'Detailed Summary' ? (
                      <Check size={16} className="mr-2" />
                    ) : (
                      <Copy size={16} className="mr-2" />
                    )}
                    Copy
                  </Button>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg">{summaryData.detailed}</p>
              </div>
            </TabsContent>

            <TabsContent value="brief" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-6 rounded-lg border border-slate-600/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-100">Brief Summary</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.brief, 'Brief Summary')}
                    className="border-green-500/50 text-green-300 hover:bg-green-600/20 hover:text-green-200"
                  >
                    {copiedSection === 'Brief Summary' ? (
                      <Check size={16} className="mr-2" />
                    ) : (
                      <Copy size={16} className="mr-2" />
                    )}
                    Copy
                  </Button>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg">{summaryData.brief}</p>
              </div>
            </TabsContent>

            <TabsContent value="keypoints" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-6 rounded-lg border border-slate-600/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-100">Key Points</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.keyPoints.join('\n• '), 'Key Points')}
                    className="border-amber-500/50 text-amber-300 hover:bg-amber-600/20 hover:text-amber-200"
                  >
                    {copiedSection === 'Key Points' ? (
                      <Check size={16} className="mr-2" />
                    ) : (
                      <Copy size={16} className="mr-2" />
                    )}
                    Copy
                  </Button>
                </div>
                <ul className="space-y-3">
                  {summaryData.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-slate-300 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-6 rounded-lg border border-slate-600/30">
                <h3 className="text-xl font-bold text-slate-100 mb-4">Document Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-2">Main Topics</h4>
                    <p className="text-slate-300">{summaryData.mainTopics}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-2">Document Classification</h4>
                    <div className="space-y-1">
                      <p className="text-slate-300">Type: <span className="font-medium text-purple-300">{summaryData.documentType}</span></p>
                      <p className="text-slate-300">Difficulty: <span className="font-medium text-purple-300">{summaryData.difficulty}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SummaryDisplay;
