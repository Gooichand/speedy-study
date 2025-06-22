
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
    if (!summaryText || typeof summaryText !== 'string') {
      return {
        detailed: 'Summary not available',
        brief: 'Brief summary not available',
        keyPoints: [],
        mainTopics: 'Topics not available',
        documentType: 'Unknown',
        difficulty: 'Unknown'
      };
    }

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
        parsed.detailed = content || 'Detailed summary not available';
      } else if (heading.includes('brief summary')) {
        parsed.brief = content || 'Brief summary not available';
      } else if (heading.includes('key points')) {
        parsed.keyPoints = content.split('\n')
          .filter(line => line.trim().startsWith('•'))
          .map(line => line.replace('•', '').trim())
          .filter(point => point.length > 0);
      } else if (heading.includes('main topics')) {
        parsed.mainTopics = content || 'Topics not available';
      } else if (heading.includes('document classification')) {
        const classificationLines = content.split('\n');
        classificationLines.forEach(line => {
          if (line.includes('Type:')) {
            parsed.documentType = line.replace('Type:', '').trim() || 'Unknown';
          }
          if (line.includes('Difficulty:')) {
            parsed.difficulty = line.replace('Difficulty:', '').trim() || 'Unknown';
          }
        });
      }
    });

    // Ensure we have at least some content
    if (!parsed.detailed) parsed.detailed = 'Detailed summary not available';
    if (!parsed.brief) parsed.brief = 'Brief summary not available';
    if (parsed.keyPoints.length === 0) parsed.keyPoints = ['Key points not available'];
    if (!parsed.mainTopics) parsed.mainTopics = 'Topics not available';

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
      case 'beginner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'intermediate': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'academic': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'business': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'technical': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'research': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  return (
    <Card className="glass-card border-slate-700/50 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <span className="text-slate-100 text-2xl">AI-Generated Summary</span>
              <p className="text-slate-400 text-sm mt-1">Intelligent analysis of your document</p>
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
          <TabsList className="grid w-full grid-cols-4 m-6 bg-slate-800/50 rounded-xl">
            <TabsTrigger value="detailed" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300 rounded-lg transition-all">
              <BookOpen size={16} className="mr-2" />
              Detailed
            </TabsTrigger>
            <TabsTrigger value="brief" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300 rounded-lg transition-all">
              <FileText size={16} className="mr-2" />
              Brief
            </TabsTrigger>
            <TabsTrigger value="keypoints" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300 rounded-lg transition-all">
              <List size={16} className="mr-2" />
              Key Points
            </TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300 rounded-lg transition-all">
              <Lightbulb size={16} className="mr-2" />
              Overview
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6">
            <TabsContent value="detailed" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-8 rounded-xl border border-slate-600/30 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-100">Detailed Summary</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.detailed, 'Detailed Summary')}
                    className="bg-slate-800/50 border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 transform hover:scale-105 transition-all duration-200"
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
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-8 rounded-xl border border-slate-600/30 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-100">Brief Summary</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.brief, 'Brief Summary')}
                    className="bg-slate-800/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/20 hover:text-emerald-200 transform hover:scale-105 transition-all duration-200"
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
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-8 rounded-xl border border-slate-600/30 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-100">Key Points</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.keyPoints.map(point => `• ${point}`).join('\n'), 'Key Points')}
                    className="bg-slate-800/50 border-amber-500/50 text-amber-300 hover:bg-amber-600/20 hover:text-amber-200 transform hover:scale-105 transition-all duration-200"
                  >
                    {copiedSection === 'Key Points' ? (
                      <Check size={16} className="mr-2" />
                    ) : (
                      <Copy size={16} className="mr-2" />
                    )}
                    Copy
                  </Button>
                </div>
                <ul className="space-y-4">
                  {summaryData.keyPoints.map((point, index) => (
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

            <TabsContent value="overview" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-8 rounded-xl border border-slate-600/30 shadow-lg">
                <h3 className="text-2xl font-bold text-slate-100 mb-6">Document Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-200 text-lg">Main Topics</h4>
                    <p className="text-slate-300 text-lg leading-relaxed">{summaryData.mainTopics}</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-200 text-lg">Document Classification</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400">Type:</span>
                        <Badge className={getDocumentTypeColor(summaryData.documentType)}>
                          {summaryData.documentType}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400">Difficulty:</span>
                        <Badge className={getDifficultyColor(summaryData.difficulty)}>
                          {summaryData.difficulty}
                        </Badge>
                      </div>
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
