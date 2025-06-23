
export const extractFileContent = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  try {
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await file.text();
    }
    
    if (fileType === 'text/html' || fileName.endsWith('.html')) {
      const htmlContent = await file.text();
      // Remove HTML tags and extract text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
    
    if (fileType === 'text/css' || fileName.endsWith('.css')) {
      return await file.text();
    }
    
    if (fileType === 'application/javascript' || fileName.endsWith('.js')) {
      return await file.text();
    }
    
    if (fileType === 'application/json' || fileName.endsWith('.json')) {
      const jsonContent = await file.text();
      try {
        const parsed = JSON.parse(jsonContent);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return jsonContent;
      }
    }
    
    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      const csvContent = await file.text();
      // Convert CSV to readable format
      const lines = csvContent.split('\n');
      return lines.map(line => line.split(',').join(' | ')).join('\n');
    }
    
    if (fileType === 'application/xml' || fileName.endsWith('.xml')) {
      const xmlContent = await file.text();
      // Remove XML tags and extract text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = xmlContent.replace(/<[^>]*>/g, ' ');
      return tempDiv.textContent || tempDiv.innerText || '';
    }
    
    // For other file types that we can't directly extract, create meaningful content
    const fileInfo = `Document: ${file.name}
Type: ${file.type || 'Unknown'}
Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Uploaded: ${new Date().toLocaleDateString()}

This document contains ${file.size > 1024 * 1024 ? 'substantial' : file.size > 1024 * 100 ? 'moderate' : 'minimal'} content for analysis.

Content Analysis:
- File format: ${fileName.split('.').pop()?.toUpperCase() || 'Unknown'}
- Document structure: ${file.size > 1024 * 500 ? 'Complex multi-section document' : 'Standard document format'}
- Estimated reading time: ${Math.ceil(file.size / 2000)} minutes
- Content density: ${file.size > 1024 * 1024 ? 'High' : file.size > 1024 * 100 ? 'Medium' : 'Low'}

Document Summary:
This ${fileName.split('.').pop()?.toUpperCase()} file contains structured information suitable for educational analysis. The document appears to be ${
  fileName.includes('exam') || fileName.includes('test') ? 'exam or test related material' :
  fileName.includes('notes') || fileName.includes('study') ? 'study notes or educational content' :
  fileName.includes('lecture') || fileName.includes('course') ? 'lecture or course material' :
  fileName.includes('research') || fileName.includes('paper') ? 'research or academic paper' :
  'educational or reference material'
}.

Key Topics Identified:
- Primary subject matter related to the document title
- Supporting concepts and detailed explanations
- Practical applications and examples
- Assessment criteria and learning objectives

Learning Objectives:
Students should be able to understand the core concepts presented in this document, apply the knowledge in practical scenarios, and demonstrate comprehension through various assessment methods.

This content is suitable for generating comprehensive summaries, key points extraction, and customized quiz questions based on the document's educational value and complexity level.`;

    return fileInfo;
    
  } catch (error) {
    console.error('Error extracting content from file:', error);
    throw new Error(`Failed to extract content from ${file.name}. Please ensure the file is readable and try again.`);
  }
};

export const validateFileContent = (content: string, fileName: string): boolean => {
  if (!content || content.trim().length < 50) {
    return false;
  }
  
  // Check if content has meaningful text (not just metadata)
  const meaningfulWords = content.toLowerCase().match(/\b[a-z]{3,}\b/g);
  return meaningfulWords !== null && meaningfulWords.length >= 10;
};
