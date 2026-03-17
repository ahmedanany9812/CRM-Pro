import { prisma } from "../lib/prisma";
import { createClient } from "../lib/supabase/admin";

const AdminUser = async () => {
  const { data, error } = await createClient().auth.admin.createUser({
    email: "ahmed98@gmail.com",
    password: "ahm123",
    email_confirm: true,
  });
  if (error) {
    throw error;
  }
  if (data.user) {
    console.log("admin created successfully", data.user);
    const admin = await prisma.profile.create({
      data: {
        id: data.user.id,
        name: "Ahmed",
        email: "ahmed98@gmail.com",
        role: "ADMIN",
      },
    });
    return admin;
  }
};

AdminUser()
  .then(async (admin) => {
    console.log("Admin user created successfully", admin);
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log(err);
    await prisma.$disconnect();
    process.exit(1);
  });
