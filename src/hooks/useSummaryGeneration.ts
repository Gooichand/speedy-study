
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
      console.log('Starting summary generation for:', title, 'Content length:', content?.length);

      // Validate inputs
      if (!content || content.trim().length === 0) {
        throw new Error('Document content is empty or not available');
      }

      // Ensure we have substantial content for AI analysis
      const trimmedContent = content.trim();
      if (trimmedContent.length < 50) {
        throw new Error('Document content is too short for meaningful analysis');
      }

      // Call the edge function to generate summary and quiz
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          content: trimmedContent,
          title,
          fileSize
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to generate summary and quiz');
      }

      const { summary, quiz, documentHash } = data;

      // Validate the response data
      if (!summary || !quiz) {
        throw new Error('Invalid response from AI service');
      }

      console.log('Generated content with hash:', documentHash, 'Quiz questions:', quiz.length);

      // Create comprehensive summary text with proper formatting
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

      // Update document with summary and mark as processed
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          summary: summaryText,
          processed: true 
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create or update quiz with document-specific content
      const { error: quizError } = await supabase
        .from('quizzes')
        .upsert({
          document_id: documentId,
          user_id: user.id,
          questions: quiz
        }, {
          onConflict: 'document_id,user_id'
        });

      if (quizError) {
        console.error('Quiz creation error:', quizError);
        throw quizError;
      }

      toast({
        title: "Success!",
        description: `Generated unique summary and ${quiz.length} custom quiz questions for "${title}"`,
      });

      console.log('Successfully completed summary generation for:', title, 'Hash:', documentHash);
      return { summary, quiz };

    } catch (error) {
      console.error('Error generating summary and quiz:', error);
      
      // Mark document as processed even if AI generation fails
      await supabase
        .from('documents')
        .update({ processed: true })
        .eq('id', documentId);

      toast({
        title: "Error",
        description: error.message || "Failed to generate summary and quiz. Please try again.",
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
