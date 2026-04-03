import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage all crm users",
};
export default function page() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Users</h1>
    </div>
  );
}
