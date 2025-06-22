
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSummaryGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSummaryAndQuiz = async (documentId: string, content: string, title: string, fileSize: number) => {
    try {
      setLoading(true);
      console.log('Starting summary generation for:', title, 'Content length:', content?.length, 'File size:', fileSize);

      // Enhanced content validation
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('Document content is empty or invalid');
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length < 100) {
        throw new Error('Document content is too short for meaningful analysis (minimum 100 characters required)');
      }

      // Validate file size
      if (!fileSize || fileSize <= 0) {
        console.warn('Invalid file size, using default');
        fileSize = trimmedContent.length;
      }

      console.log('Calling edge function with validated content...');

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          content: trimmedContent,
          title: title || 'Untitled Document',
          fileSize: fileSize
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Summary generation failed: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Failed to generate summary and quiz';
        console.error('Function returned error:', errorMessage);
        throw new Error(errorMessage);
      }

      const { summary, quiz, documentHash } = data;

      // Validate response data
      if (!summary || !quiz || !Array.isArray(quiz)) {
        throw new Error('Invalid response format from AI service');
      }

      if (quiz.length === 0) {
        throw new Error('No quiz questions were generated');
      }

      console.log('Generated content successfully:', {
        hash: documentHash,
        quizQuestions: quiz.length,
        summaryKeys: Object.keys(summary)
      });

      // Create formatted summary text
      const summaryText = `
## Detailed Summary
${summary.longSummary || 'No detailed summary available'}

## Brief Summary
${summary.shortSummary || 'No brief summary available'}

## Key Points
${(summary.keyPoints || []).map((point: string) => `• ${point}`).join('\n')}

## Main Topics
${(summary.mainTopics || []).join(', ')}

## Document Classification
Type: ${summary.documentType || 'Unknown'}
Difficulty: ${summary.difficulty || 'Unknown'}
      `.trim();

      // Update document with summary
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          summary: summaryText,
          processed: true 
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error(`Failed to save summary: ${updateError.message}`);
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User authentication required');
      }

      // Save quiz questions
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
        console.error('Quiz save error:', quizError);
        throw new Error(`Failed to save quiz: ${quizError.message}`);
      }

      toast({
        title: "Success!",
        description: `Generated detailed summary and ${quiz.length} custom quiz questions for "${title}"`,
      });

      console.log('Summary and quiz generation completed successfully');
      return { summary, quiz, documentHash };

    } catch (error) {
      console.error('Error in generateSummaryAndQuiz:', error);
      
      // Mark document as processed to prevent retry loops
      try {
        await supabase
          .from('documents')
          .update({ processed: true })
          .eq('id', documentId);
      } catch (updateError) {
        console.error('Failed to mark document as processed:', updateError);
      }

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Error",
        description: errorMessage,
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
