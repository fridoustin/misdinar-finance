import { homeSummary } from "@/application/home";
import { totalCollected } from "@/application/iuran";
import { HomeView } from "@/components/Home/HomeView";
import { financeRepository } from "@/infrastructure/financeRepository";
import { iuranRepository } from "@/infrastructure/iuranRepository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [finance, iuran] = await Promise.all([
    financeRepository.getFinance(),
    iuranRepository.getIuran(),
  ]);
  return <HomeView summary={homeSummary(finance, totalCollected(iuran))} />;
}