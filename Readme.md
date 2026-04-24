# Whispyr CRM Pro

Whispyr CRM Pro is a state-of-the-art Customer Relationship Management system built with Next.js 16, designed to streamline lead management with AI-powered insights and robust automation.

## 🚀 Key Features

- **Lead Management**: Efficiently track and manage your sales pipeline.
- **AI Insights**: Automatically generate lead briefs and call follow-ups using the Vercel AI SDK.
- **Reminders & Tasks**: Never miss a beat with scheduled reminders powered by Upstash QStash and Redis.
- **Real-time Notifications**: Stay updated with instant in-app notifications.
- **Admin Dashboard**: Comprehensive user management and system configuration.
- **Import/Export**: Seamlessly migrate your data with robust CSV import and export capabilities.
- **Advanced Analytics**: Visualize your performance with interactive charts and dashboards.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (SSR & JS SDK)
- **Database & ORM**: [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Automation & Queueing**: [Upstash QStash](https://upstash.com/docs/qstash), [Redis](https://redis.io/)
- **Email Service**: [Resend](https://resend.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

## 🏁 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Supabase account
- Upstash account (for Redis and QStash)
- Resend account (for emails)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/crm-pro.git
   cd crm-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add the necessary configuration (see `.env.example` if available).

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```text
src/
├── app/          # Next.js App Router (pages and API routes)
├── components/   # Reusable UI components (shadcn/ui)
├── hooks/        # Custom React hooks
├── lib/          # Core libraries and singletons (Prisma, Supabase, etc.)
├── services/     # Business logic and domain-specific services
├── utils/        # Helper functions and utilities
└── providers/    # React context providers
```

## 📄 License

This project is proprietary. All rights reserved.
