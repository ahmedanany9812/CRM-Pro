import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { supabaseAdmin as supabase } from "../src/lib/supabase/admin";
import { Role } from "../src/generated/prisma/enums";

const AGENTS_TO_SEED = [
  {
    name: "Sarah Agent",
    email: "sarah.agent@example.com",
    password: "agent123",
  },
  {
    name: "Mike Agent",
    email: "mike.agent@example.com",
    password: "agent123",
  },
  {
    name: "Elena Rossi",
    email: "elena.rossi@example.com",
    password: "agent123",
  },
  {
    name: "James Chen",
    email: "james.chen@example.com",
    password: "agent123",
  },
];

async function seedAgents() {
  console.log("🚀 Starting agent seeding...");

  for (const agentData of AGENTS_TO_SEED) {
    console.log(`\n🔍 Checking agent: ${agentData.email}`);

    // 1. Check if profile already exists in Prisma
    const existingProfile = await prisma.profile.findUnique({
      where: { email: agentData.email },
    });

    if (existingProfile) {
      console.log(`⏩ Agent ${agentData.email} already exists. Skipping.`);
      continue;
    }

    try {
      // 2. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: agentData.email,
        password: agentData.password,
        email_confirm: true,
      });

      if (authError) {
        // If user already exists in Supabase but not in Prisma, we'll try to find them
        if (authError.message.includes("already registered")) {
            console.log(`⚠️ User already in Auth but missing Profile. Fetching ID...`);
            const { data: listData } = await supabase.auth.admin.listUsers();
            const user = listData.users.find(u => u.email === agentData.email);
            if (user) {
                await createPrismaProfile(user.id, agentData.name, agentData.email);
                continue;
            }
        }
        throw new Error(`Supabase Auth Error: ${authError.message}`);
      }

      if (authData.user) {
        console.log(`✅ Auth user created: ${authData.user.id}`);
        await createPrismaProfile(authData.user.id, agentData.name, agentData.email);
      }
    } catch (err: any) {
      console.error(`❌ Error seeding ${agentData.email}:`, err.message);
    }
  }

  console.log("\n✨ Seeding complete.");
}

async function createPrismaProfile(id: string, name: string, email: string) {
  const profile = await prisma.profile.create({
    data: {
      id,
      name,
      email,
      role: Role.AGENT,
    },
  });
  console.log(`✅ Prisma profile created: ${profile.name} (${profile.role})`);
}

seedAgents()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
