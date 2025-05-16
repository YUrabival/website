import { api } from "~/utils/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminPanel from "~/app/admin/AdminPanel";
import { authOptions } from "~/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return <AdminPanel />;
} 