
export interface ParsedSummary {
  detailed: string;
  brief: string;
  keyPoints: string[];
  mainTopics: string;
  documentType: string;
  difficulty: string;
}

export const parseSummary = (summaryText: string): ParsedSummary => {
  if (!summaryText || typeof summaryText !== 'string') {
    return {
      detailed: 'Summary not available',
      brief: 'Brief summary not available',
      keyPoints: [],
      mainTopics: 'Topics not available',
      documentType: 'Unknown',
      difficulty: 'Unknown'
    };
  }

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
      parsed.detailed = content || 'Detailed summary not available';
    } else if (heading.includes('brief summary')) {
      parsed.brief = content || 'Brief summary not available';
    } else if (heading.includes('key points')) {
      parsed.keyPoints = content.split('\n')
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.replace('•', '').trim())
        .filter(point => point.length > 0);
    } else if (heading.includes('main topics')) {
      parsed.mainTopics = content || 'Topics not available';
    } else if (heading.includes('document classification')) {
      const classificationLines = content.split('\n');
      classificationLines.forEach(line => {
        if (line.includes('Type:')) {
          parsed.documentType = line.replace('Type:', '').trim() || 'Unknown';
        }
        if (line.includes('Difficulty:')) {
          parsed.difficulty = line.replace('Difficulty:', '').trim() || 'Unknown';
        }
      });
    }
  });

  // Ensure we have at least some content
  if (!parsed.detailed) parsed.detailed = 'Detailed summary not available';
  if (!parsed.brief) parsed.brief = 'Brief summary not available';
  if (parsed.keyPoints.length === 0) parsed.keyPoints = ['Key points not available'];
  if (!parsed.mainTopics) parsed.mainTopics = 'Topics not available';

  return parsed;
};
