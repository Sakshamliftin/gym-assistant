import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // If there is no active session, redirect to login
  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name || session.user?.email}!</p>
      <p>This is a protected server component page.</p>
    </div>
  );
}
