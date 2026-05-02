import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";

export default async function AdminIndex() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  redirect("/admin/markets");
}
