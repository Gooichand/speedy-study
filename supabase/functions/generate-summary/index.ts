
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!content || content.trim().length === 0) {
      throw new Error('No content provided for summary generation');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured. Please add it in Edge Function Secrets.');
    }

    console.log('Processing document:', title, 'Size:', fileSize);

    // Determine summary complexity and quiz length based on file size
    const isLargeFile = fileSize > 1000000; // 1MB
    const isMediumFile = fileSize > 500000; // 500KB
    const numQuestions = isLargeFile ? 15 : isMediumFile ? 10 : 5;

    // Truncate content if too long to avoid token limits
    const maxContentLength = 8000;
    const processedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + "... [content truncated]"
      : content;

    // Generate comprehensive summary
    const summaryPrompt = `
    Analyze the following document and create a comprehensive summary in JSON format:

    Document Title: ${title}
    Content: ${processedContent}

    Please provide a detailed analysis with:
    1. A comprehensive long summary (250-400 words) that covers all major points
    2. A concise short summary (80-120 words) highlighting the essence
    3. Key points (6-8 specific bullet points) covering main concepts
    4. Main topics covered in the document
    5. Document type classification
    6. Difficulty assessment

    Return ONLY valid JSON with this exact structure:
    {
      "longSummary": "detailed comprehensive summary here",
      "shortSummary": "concise summary here", 
      "keyPoints": ["specific point 1", "specific point 2", "specific point 3", "specific point 4", "specific point 5", "specific point 6"],
      "mainTopics": ["topic 1", "topic 2", "topic 3", "topic 4"],
      "documentType": "academic/business/technical/general/educational",
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
          { role: 'system', content: 'You are an expert document analyzer. Always return valid JSON only, no additional text.' },
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!summaryResponse.ok) {
      throw new Error(`OpenAI API error: ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();
    let summaryResult;
    
    try {
      summaryResult = JSON.parse(summaryData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse summary JSON:', summaryData.choices[0].message.content);
      throw new Error('Failed to parse summary response');
    }

    // Generate quiz questions based on the specific content
    const quizPrompt = `
    Based on the following document content, create ${numQuestions} diverse quiz questions that test understanding of THIS SPECIFIC DOCUMENT:

    Document: ${title}
    Content: ${processedContent}

    Create questions that are SPECIFIC to this document's content. Include:
    - ${Math.ceil(numQuestions * 0.6)} multiple choice questions (60%)
    - ${Math.ceil(numQuestions * 0.25)} fill-in-the-blank questions (25%) 
    - ${Math.floor(numQuestions * 0.15)} short answer questions (15%)

    Make questions progressively harder and cover different sections. Each question must be answerable only by someone who read THIS document.

    Return ONLY valid JSON array with this exact structure:
    [
      {
        "id": 1,
        "type": "mcq",
        "question": "specific question about document content",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": "correct option",
        "explanation": "why this is correct based on document"
      },
      {
        "id": 2,
        "type": "fill",
        "question": "Complete based on document: The main concept discussed is ___",
        "correctAnswer": "specific answer from document",
        "explanation": "explanation based on document content"
      }
    ]
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
          { role: 'system', content: 'You are an expert quiz creator. Always return valid JSON array only, no additional text.' },
          { role: 'user', content: quizPrompt }
        ],
        temperature: 0.4,
        max_tokens: 2500,
      }),
    });

    if (!quizResponse.ok) {
      throw new Error(`OpenAI API error for quiz: ${quizResponse.status}`);
    }

    const quizData = await quizResponse.json();
    let questions;
    
    try {
      questions = JSON.parse(quizData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', quizData.choices[0].message.content);
      throw new Error('Failed to parse quiz response');
    }

    console.log('Successfully generated summary and quiz for:', title);

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
