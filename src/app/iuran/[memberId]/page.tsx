import { notFound } from "next/navigation";
import { MemberDetail } from "@/components/iuran/MemberDetail";
import { iuranRepository } from "@/infrastructure/iuranRepository";

export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  const [data, attachments] = await Promise.all([
    iuranRepository.getIuran(),
    iuranRepository.getAttachments(memberId),
  ]);

  const member = data.members.find((m) => m.id === memberId);
  if (!member) notFound();

  return <MemberDetail data={data} member={member} attachments={attachments} />;
}