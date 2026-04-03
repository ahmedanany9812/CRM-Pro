import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reminders",
  description: "Manage and View your Reminders",
};
export default function RemindersPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Reminders</h1>
    </div>
  );
}
