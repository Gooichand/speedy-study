
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
    
    console.log('Processing request for:', title, 'Size:', fileSize);
    
    if (!content || content.trim().length === 0) {
      throw new Error('No content provided for summary generation');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY in Edge Function Secrets.');
    }

    // Create content hash for uniqueness
    const encoder = new TextEncoder();
    const data = encoder.encode(content + title + Date.now().toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);

    // Determine quiz complexity based on file size
    let numQuestions = 5;
    if (fileSize > 2000000) numQuestions = 15; // 2MB+
    else if (fileSize > 1000000) numQuestions = 12; // 1MB+
    else if (fileSize > 500000) numQuestions = 8; // 500KB+

    // Process content strategically
    const maxContentLength = 15000;
    let processedContent = content.trim();
    
    if (processedContent.length > maxContentLength) {
      const partSize = Math.floor(maxContentLength / 3);
      const beginning = processedContent.substring(0, partSize);
      const middle = processedContent.substring(
        Math.floor(processedContent.length / 2) - Math.floor(partSize / 2),
        Math.floor(processedContent.length / 2) + Math.floor(partSize / 2)
      );
      const end = processedContent.substring(processedContent.length - partSize);
      
      processedContent = `${beginning}\n\n[CONTENT CONTINUES...]\n\n${middle}\n\n[CONTENT CONTINUES...]\n\n${end}`;
    }

    console.log('Generating summary for document hash:', hashHex);

    // Generate comprehensive summary
    const summaryPrompt = `
    Analyze this SPECIFIC document and create a comprehensive summary that is UNIQUE to this exact content.

    Document: "${title}"
    Unique ID: ${hashHex}
    File Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB
    
    Content to analyze:
    ${processedContent}

    CRITICAL INSTRUCTIONS:
    - This summary must be 100% SPECIFIC to THIS document's actual content
    - Do NOT provide generic information that could apply to any document
    - Reference specific details, data, examples, and quotes from THIS document only
    - Each summary section must contain information that proves you read THIS specific document

    Provide a JSON response with this EXACT structure:
    {
      "longSummary": "300-500 word detailed analysis of THIS specific document's content, themes, and unique insights",
      "shortSummary": "100-150 word concise summary highlighting THIS document's core message and findings", 
      "keyPoints": ["specific insight 1 from document", "specific insight 2 from document", "specific insight 3 from document", "specific insight 4 from document", "specific insight 5 from document", "specific insight 6 from document"],
      "mainTopics": ["specific topic 1 from document", "specific topic 2 from document", "specific topic 3 from document"],
      "documentType": "academic/business/technical/general/educational/research/legal/medical/other",
      "difficulty": "beginner/intermediate/advanced"
    }

    Return ONLY the JSON, no additional text.
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
            content: 'You are an expert document analyzer. Create detailed, specific summaries based on actual document content. Always return valid JSON only.' 
          },
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error('OpenAI Summary API error:', summaryResponse.status, errorText);
      throw new Error(`OpenAI Summary API error: ${summaryResponse.status} - ${errorText}`);
    }

    const summaryData = await summaryResponse.json();
    let summaryResult;
    
    try {
      const summaryContent = summaryData.choices[0].message.content.trim();
      console.log('Raw summary response:', summaryContent);
      
      // Clean JSON response
      const cleanedContent = summaryContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      summaryResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse summary JSON:', summaryData.choices[0]?.message?.content);
      throw new Error('Failed to parse AI summary response. Please try again.');
    }

    // Generate document-specific quiz questions
    const quizPrompt = `
    Create ${numQuestions} quiz questions that test understanding of THIS SPECIFIC DOCUMENT ONLY.

    Document: "${title}"
    Unique ID: ${hashHex}
    
    Document Content:
    ${processedContent}

    CRITICAL REQUIREMENTS:
    1. Questions MUST be answerable ONLY by reading THIS specific document
    2. Use specific names, dates, facts, quotes, and examples from THIS document
    3. Reference specific sections, arguments, or data points in THIS document
    4. Questions should test comprehension of THIS document's unique content

    Question Distribution:
    - ${Math.ceil(numQuestions * 0.6)} multiple choice questions
    - ${Math.ceil(numQuestions * 0.25)} fill-in-the-blank questions  
    - ${Math.floor(numQuestions * 0.15)} short answer questions

    Return ONLY a JSON array with this EXACT structure:
    [
      {
        "id": 1,
        "type": "mcq",
        "question": "According to this document, [specific question about document content]?",
        "options": ["option from document", "another option from document", "third option from document", "fourth option from document"],
        "correctAnswer": "exact answer from document",
        "explanation": "explanation referencing specific part of this document"
      },
      {
        "id": 2,
        "type": "fill",
        "question": "Based on this document: [specific statement from document] ____",
        "correctAnswer": "specific answer from document",
        "explanation": "explanation with reference to document content"
      },
      {
        "id": 3,
        "type": "short",
        "question": "Explain [specific concept from document] as described in this document",
        "correctAnswer": "answer based on document's explanation",
        "explanation": "detailed explanation from document"
      }
    ]

    Make each question progressively challenging and cover different sections of THIS document.
    Return ONLY the JSON array, no additional text.
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
            content: 'You are a quiz creation expert. Generate specific questions based on document content. Always return valid JSON array only.' 
          },
          { role: 'user', content: quizPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3500,
      }),
    });

    if (!quizResponse.ok) {
      const errorText = await quizResponse.text();
      console.error('OpenAI Quiz API error:', quizResponse.status, errorText);
      throw new Error(`OpenAI Quiz API error: ${quizResponse.status} - ${errorText}`);
    }

    const quizData = await quizResponse.json();
    let questions;
    
    try {
      const quizContent = quizData.choices[0].message.content.trim();
      console.log('Raw quiz response:', quizContent);
      
      // Clean JSON response
      const cleanedQuizContent = quizContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      questions = JSON.parse(cleanedQuizContent);
      
      if (!Array.isArray(questions)) {
        throw new Error('Quiz response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', quizData.choices[0]?.message?.content);
      throw new Error('Failed to parse AI quiz response. Please try again.');
    }

    console.log('Successfully generated content for:', title, 'Hash:', hashHex, 'Questions:', questions.length);

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
      error: error.message || 'An unexpected error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
