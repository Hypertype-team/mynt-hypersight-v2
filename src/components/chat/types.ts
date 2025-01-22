export interface ChatMessage {
  text: string;
  isUser: boolean;
  chartData?: any;
  chartType?: 'line' | 'bar';
  analysis?: string;
  followUpQuestions?: string[];
}