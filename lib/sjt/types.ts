export type Question = {
  id: string;
  label: string;
  type?: 'single' | 'likert' | 'text';
  options?: string[]; // si besoin pour QCM
};
