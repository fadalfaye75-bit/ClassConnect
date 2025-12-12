
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type CorrectionStyle = 'FIX' | 'PROFESSIONAL' | 'ACADEMIC' | 'SIMPLE' | 'CONCISE' | 'CASUAL' | 'PERSUASIVE';

// Service désactivé suite à la suppression de l'IA
export const chatWithAssistant = async (history: ChatMessage[], message: string): Promise<string> => {
  return "Assistant désactivé.";
};

export const correctTextAdvanced = async (text: string, style: CorrectionStyle): Promise<string> => {
  return text;
};
