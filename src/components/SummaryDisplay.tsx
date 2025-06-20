
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
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-blue-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <span className="text-gray-800">AI-Generated Summary</span>
          </CardTitle>
          <div className="flex space-x-2">
            {summaryData.documentType && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
          <TabsList className="grid w-full grid-cols-4 m-4 bg-blue-50">
            <TabsTrigger value="detailed" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <BookOpen size={16} className="mr-2" />
              Detailed
            </TabsTrigger>
            <TabsTrigger value="brief" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <FileText size={16} className="mr-2" />
              Brief
            </TabsTrigger>
            <TabsTrigger value="keypoints" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <List size={16} className="mr-2" />
              Key Points
            </TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Lightbulb size={16} className="mr-2" />
              Overview
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6">
            <TabsContent value="detailed" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Detailed Summary</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.detailed, 'Detailed Summary')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {copiedSection === 'Detailed Summary' ? (
                      <Check size={16} className="mr-2" />
                    ) : (
                      <Copy size={16} className="mr-2" />
                    )}
                    Copy
                  </Button>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{summaryData.detailed}</p>
              </div>
            </TabsContent>

            <TabsContent value="brief" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Brief Summary</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.brief, 'Brief Summary')}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    {copiedSection === 'Brief Summary' ? (
                      <Check size={16} className="mr-2" />
                    ) : (
                      <Copy size={16} className="mr-2" />
                    )}
                    Copy
                  </Button>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{summaryData.brief}</p>
              </div>
            </TabsContent>

            <TabsContent value="keypoints" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Key Points</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summaryData.keyPoints.join('\n• '), 'Key Points')}
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
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
                      <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Document Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Main Topics</h4>
                    <p className="text-gray-700">{summaryData.mainTopics}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Document Classification</h4>
                    <div className="space-y-1">
                      <p className="text-gray-700">Type: <span className="font-medium">{summaryData.documentType}</span></p>
                      <p className="text-gray-700">Difficulty: <span className="font-medium">{summaryData.difficulty}</span></p>
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
