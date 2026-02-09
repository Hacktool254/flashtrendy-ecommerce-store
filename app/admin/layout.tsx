import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OrderNotificationListener } from "@/components/admin/OrderNotificationListener";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <OrderNotificationListener />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
