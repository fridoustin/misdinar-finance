import { KategoriView } from "@/components/kategori/KategoriView";
import { financeRepository } from "@/infrastructure/financeRepository";

export const dynamic = "force-dynamic";

export default async function KategoriPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  return <KategoriView data={await financeRepository.getFinance()} initialId={c ?? null} />;
}