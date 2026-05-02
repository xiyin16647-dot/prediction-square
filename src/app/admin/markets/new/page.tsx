import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { NewMarketForm } from "@/components/admin/NewMarketForm";
import { getCurrentAdmin } from "@/lib/admin-auth";

export default async function NewMarketPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell
      active="events"
      crumbs={["事件管理", "+ 新建市场"]}
      adminName={admin.username}
    >
      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-admin-text">手动建市场</h1>
          <p className="text-[13px] text-admin-sub mt-1">
            创建后立即上线，绕过 DRAFT 审核流程
          </p>
        </div>
        <NewMarketForm />
      </div>
    </AdminShell>
  );
}
