
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSummaryGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSummaryAndQuiz = async (documentId: string, content: string, title: string, fileSize: number) => {
    try {
      setLoading(true);
      console.log('=== SUMMARY GENERATION DEBUG ===');
      console.log('Starting summary generation for:', title);
      console.log('Content length:', content?.length);
      console.log('File size:', fileSize);
      console.log('Document ID:', documentId);

      // Enhanced content validation
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        console.error('Content validation failed: empty or invalid content');
        throw new Error('Document content is empty or invalid. Please upload a document with readable text content.');
      }

      const trimmedContent = content.trim();
      console.log('Trimmed content length:', trimmedContent.length);
      
      if (trimmedContent.length < 100) {
        console.error('Content too short:', trimmedContent.length);
        throw new Error('Document content is too short for meaningful analysis. Minimum 100 characters required for AI processing.');
      }

      // Validate file size
      if (!fileSize || fileSize <= 0) {
        console.warn('Invalid file size, using default');
        fileSize = trimmedContent.length;
      }

      console.log('Calling edge function with validated content...');

      // Show initial progress toast
      toast({
        title: "Processing Started",
        description: "AI is analyzing your document content...",
        className: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
      });

      // Call the edge function with additional debugging
      console.log('Invoking generate-summary function...');
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          content: trimmedContent,
          title: title || 'Untitled Document',
          fileSize: fileSize
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`AI service error: ${error.message || 'Failed to connect to AI service'}`);
      }

      if (!data) {
        console.error('No data returned from edge function');
        throw new Error('No response from AI service. Please try again.');
      }

      if (!data.success) {
        const errorMessage = data?.error || 'AI failed to generate summary and quiz';
        console.error('Function returned error:', errorMessage);
        throw new Error(errorMessage);
      }

      const { summary, quiz, documentHash } = data;
      console.log('Received data structure:', {
        hasSummary: !!summary,
        hasQuiz: !!quiz,
        quizLength: Array.isArray(quiz) ? quiz.length : 'not array',
        documentHash
      });

      // Validate response data
      if (!summary || !quiz || !Array.isArray(quiz)) {
        console.error('Invalid response structure:', { summary: !!summary, quiz: !!quiz, isArray: Array.isArray(quiz) });
        throw new Error('Invalid response from AI service. Please try again.');
      }

      if (quiz.length === 0) {
        console.error('No quiz questions generated');
        throw new Error('AI could not generate quiz questions from this content. Please ensure your document has substantial readable text.');
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

      console.log('Updating document with summary...');
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
        console.error('User authentication error:', userError);
        throw new Error('User authentication required');
      }

      console.log('Saving quiz questions...');
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
        title: "AI Analysis Complete!",
        description: `Successfully generated detailed summary and ${quiz.length} custom quiz questions for "${title}"`,
        className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      });

      console.log('=== SUMMARY GENERATION COMPLETED SUCCESSFULLY ===');
      return { summary, quiz, documentHash };

    } catch (error) {
      console.error('=== SUMMARY GENERATION ERROR ===');
      console.error('Error in generateSummaryAndQuiz:', error);
      
      // Mark document as processed to prevent retry loops, but only if it's a content issue
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      if (errorMessage.includes('content') || errorMessage.includes('short') || errorMessage.includes('empty')) {
        try {
          await supabase
            .from('documents')
            .update({ processed: true })
            .eq('id', documentId);
        } catch (updateError) {
          console.error('Failed to mark document as processed:', updateError);
        }
      }
      
      toast({
        title: "AI Generation Failed",
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
