import { iuranRepository } from "@/infrastructure/iuranRepository";
import { IuranView } from "@/presentation/iuran/IuranView";

export const dynamic = "force-dynamic";

export default async function IuranPage() {
  return <IuranView data={await iuranRepository.getIuran()} />;
}
