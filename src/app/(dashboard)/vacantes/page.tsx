import { mockVacancies } from "@/data/mock-vacancies";
import { VacanciesModule } from "@/components/vacancies/vacancies-module";

export default function VacantesPage() {
  return <VacanciesModule initialVacancies={mockVacancies} />;
}
