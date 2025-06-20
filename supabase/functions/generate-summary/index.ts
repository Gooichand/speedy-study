
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title, fileSize } = await req.json();
    
    if (!content) {
      throw new Error('No content provided for summary generation');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine summary complexity based on file size
    const isLargeFile = fileSize > 1000000; // 1MB
    const isMediumFile = fileSize > 500000; // 500KB

    // Generate comprehensive summary with different formats
    const summaryPrompt = `
    Analyze the following document content and create a comprehensive summary in JSON format:

    Document Title: ${title}
    Content: ${content}

    Please provide:
    1. A detailed long summary (200-300 words)
    2. A short summary (50-80 words)
    3. Key points (5-7 bullet points)
    4. Main topics covered
    5. Document type classification

    Return as JSON with this structure:
    {
      "longSummary": "detailed summary here",
      "shortSummary": "brief summary here",
      "keyPoints": ["point 1", "point 2", ...],
      "mainTopics": ["topic 1", "topic 2", ...],
      "documentType": "academic/business/technical/general",
      "difficulty": "beginner/intermediate/advanced"
    }
    `;

    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert document analyzer. Always return valid JSON.' },
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const summaryData = await summaryResponse.json();
    const summaryResult = JSON.parse(summaryData.choices[0].message.content);

    // Generate quiz based on file size
    const numQuestions = isLargeFile ? 15 : isMediumFile ? 10 : 5;
    
    const quizPrompt = `
    Based on the following document content, create ${numQuestions} diverse quiz questions:

    Content: ${content}

    Create a mix of:
    - Multiple choice questions (60%)
    - Fill-in-the-blank questions (25%)
    - Short answer questions (15%)

    Return as JSON array with this structure:
    [
      {
        "id": 1,
        "type": "mcq",
        "question": "question text",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": "correct option",
        "explanation": "why this is correct"
      },
      {
        "id": 2,
        "type": "fill",
        "question": "Complete the sentence: The main concept is ___",
        "correctAnswer": "answer",
        "explanation": "explanation"
      }
    ]
    
    Make questions progressively harder and cover different sections of the content.
    `;

    const quizResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert quiz creator. Always return valid JSON array.' },
          { role: 'user', content: quizPrompt }
        ],
        temperature: 0.4,
      }),
    });

    const quizData = await quizResponse.json();
    const questions = JSON.parse(quizData.choices[0].message.content);

    return new Response(JSON.stringify({
      summary: summaryResult,
      quiz: questions,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
