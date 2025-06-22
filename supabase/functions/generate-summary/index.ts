
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

    console.log('Processing document:', title, 'Size:', fileSize, 'Content length:', content.length);

    // Determine summary complexity and quiz length based on file size
    const isLargeFile = fileSize > 1000000; // 1MB
    const isMediumFile = fileSize > 500000; // 500KB
    const numQuestions = isLargeFile ? 15 : isMediumFile ? 10 : 5;

    // Create a unique content hash to ensure different responses for different files
    const contentHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content + title));
    const hashArray = Array.from(new Uint8Array(contentHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);

    // Truncate content strategically - take beginning and end to preserve context
    const maxContentLength = 12000;
    let processedContent = content;
    if (content.length > maxContentLength) {
      const halfLength = Math.floor(maxContentLength / 2);
      processedContent = content.substring(0, halfLength) + 
        "\n\n[MIDDLE CONTENT TRUNCATED FOR PROCESSING]\n\n" + 
        content.substring(content.length - halfLength);
    }

    // Generate comprehensive summary with document-specific context
    const summaryPrompt = `
    You are analyzing a SPECIFIC document. Create a comprehensive summary that is UNIQUE to this exact document content.

    Document Details:
    - Title: "${title}"
    - Content Hash: ${hashHex}
    - File Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB
    - Content Preview: ${processedContent.substring(0, 500)}...

    Full Document Content:
    ${processedContent}

    CRITICAL: This summary must be SPECIFIC to THIS document only. Do not provide generic information.

    Analyze this EXACT document and provide:

    1. **Long Summary (300-500 words)**: Detailed analysis of THIS specific document's content, themes, arguments, data, conclusions, and unique insights
    
    2. **Short Summary (100-150 words)**: Concise version highlighting the core essence and main findings of THIS document
    
    3. **Key Points (6-10 bullet points)**: Specific, actionable takeaways that someone could only know by reading THIS document
    
    4. **Main Topics**: The primary subjects covered in THIS specific document
    
    5. **Document Classification**: Based on the actual content and writing style
    
    6. **Difficulty Assessment**: Based on vocabulary, concepts, and complexity of THIS document

    Return ONLY valid JSON with this exact structure:
    {
      "longSummary": "comprehensive analysis of this specific document content",
      "shortSummary": "concise summary of this document's core message", 
      "keyPoints": ["specific insight 1", "specific insight 2", "specific insight 3", "specific insight 4", "specific insight 5", "specific insight 6"],
      "mainTopics": ["topic 1 from document", "topic 2 from document", "topic 3 from document"],
      "documentType": "academic/business/technical/general/educational/research/legal/medical",
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
          { 
            role: 'system', 
            content: 'You are a document analysis expert. Create unique summaries based on specific document content. Always return valid JSON only, no additional text.' 
          },
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error('OpenAI API error:', summaryResponse.status, errorText);
      throw new Error(`OpenAI API error: ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();
    let summaryResult;
    
    try {
      const content = summaryData.choices[0].message.content;
      console.log('Raw summary response:', content);
      summaryResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse summary JSON:', summaryData.choices[0].message.content);
      throw new Error('Failed to parse summary response');
    }

    // Generate quiz questions that are HIGHLY SPECIFIC to this document
    const quizPrompt = `
    Create ${numQuestions} quiz questions that test understanding of THIS SPECIFIC DOCUMENT ONLY.

    Document Title: "${title}"
    Content Hash: ${hashHex}
    Document Content: ${processedContent}

    REQUIREMENTS:
    1. Questions MUST be answerable ONLY by reading THIS specific document
    2. Use specific names, dates, concepts, data points, and quotes from THIS document
    3. Questions should reference specific sections, examples, or arguments in THIS document
    4. Include diverse question types:
       - ${Math.ceil(numQuestions * 0.6)} multiple choice questions (60%)
       - ${Math.ceil(numQuestions * 0.25)} fill-in-the-blank questions (25%)
       - ${Math.floor(numQuestions * 0.15)} short answer questions (15%)

    Make each question progressively challenging and cover different aspects of THIS document.

    Return ONLY valid JSON array with this exact structure:
    [
      {
        "id": 1,
        "type": "mcq",
        "question": "According to this document, [specific question about document content]",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": "correct option from document",
        "explanation": "explanation with reference to specific part of document"
      },
      {
        "id": 2,
        "type": "fill",
        "question": "Based on this document: [specific statement] ___",
        "correctAnswer": "specific answer from document",
        "explanation": "explanation referencing document content"
      },
      {
        "id": 3,
        "type": "short",
        "question": "Explain [specific concept from document] as described in this document",
        "correctAnswer": "answer based on document explanation",
        "explanation": "detailed explanation from document"
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
          { 
            role: 'system', 
            content: 'You are a quiz creator expert. Create specific questions based on document content. Always return valid JSON array only, no additional text.' 
          },
          { role: 'user', content: quizPrompt }
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!quizResponse.ok) {
      const errorText = await quizResponse.text();
      console.error('OpenAI API error for quiz:', quizResponse.status, errorText);
      throw new Error(`OpenAI API error for quiz: ${quizResponse.status}`);
    }

    const quizData = await quizResponse.json();
    let questions;
    
    try {
      const content = quizData.choices[0].message.content;
      console.log('Raw quiz response:', content);
      questions = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', quizData.choices[0].message.content);
      throw new Error('Failed to parse quiz response');
    }

    console.log('Successfully generated summary and quiz for:', title, 'Hash:', hashHex);

    return new Response(JSON.stringify({
      summary: summaryResult,
      quiz: questions,
      success: true,
      documentHash: hashHex
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
