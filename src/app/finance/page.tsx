import { FinanceView } from "@/components/finance/FinanceView";
import { financeRepository } from "@/infrastructure/financeRepository";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  return <FinanceView data={await financeRepository.getFinance()} />;
}