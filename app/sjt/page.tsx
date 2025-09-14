import { getQuestions } from '@/lib/sjt/getQuestions';
import SJTQuizPage from './SJTQuizPage';

export default async function Page() {
  const questions = await getQuestions();
  return <SJTQuizPage questions={questions} />;
}
