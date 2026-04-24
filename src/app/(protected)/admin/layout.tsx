import { supabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await supabase();
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile || !profile.isActive) {
    await client.auth.signOut();
    redirect("/login");
  }

  // Strict Admin Gate for the entire /admin subtree
  if (profile.role !== Role.ADMIN) {
    redirect("/");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-4">
        <div className="pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
