
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SummaryData {
  longSummary: string;
  shortSummary: string;
  keyPoints: string[];
  mainTopics: string[];
  documentType: string;
  difficulty: string;
}

interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export const useSummaryGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSummaryAndQuiz = async (documentId: string, content: string, title: string, fileSize: number) => {
    try {
      setLoading(true);

      // Call the edge function to generate summary and quiz
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          content,
          title,
          fileSize
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      const { summary, quiz } = data;

      // Update document with comprehensive summary
      const summaryText = `
## Detailed Summary
${summary.longSummary}

## Brief Summary
${summary.shortSummary}

## Key Points
${summary.keyPoints.map((point: string) => `• ${point}`).join('\n')}

## Main Topics
${summary.mainTopics.join(', ')}

## Document Classification
Type: ${summary.documentType}
Difficulty: ${summary.difficulty}
      `.trim();

      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          summary: summaryText,
          processed: true 
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // Create or update quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .upsert({
          document_id: documentId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          questions: quiz
        });

      if (quizError) throw quizError;

      toast({
        title: "Success!",
        description: `Generated comprehensive summary and ${quiz.length} quiz questions`,
      });

      return { summary, quiz };

    } catch (error) {
      console.error('Error generating summary and quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate summary and quiz. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSummaryAndQuiz,
    loading
  };
};
