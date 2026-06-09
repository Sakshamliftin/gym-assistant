import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Carousel from "@/components/Carousel";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  /* TEMPORARY BYPASS
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingDone) {
    redirect("/onboarding");
  }
  */
  // Dummy profile for display
  const profile = { onboardingDone: true, bypass: true };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Welcome back, {session.user.name || session.user.email}!</p>
      <Carousel/>
      <div style={{ marginTop: "2rem" }}>
        <h2>Quick Actions</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", gap: "1rem" }}>
          <li>
            <Link href="/workouts/new" className="btn-primary">
              Start Workout
            </Link>
          </li>
          <li>
            <Link href="/coach" className="btn-secondary">
              🤖 Ask AI Coach
            </Link>
          </li>
          <li>
            <Link href="/community" className="btn-secondary">
              🌍 Community
            </Link>
          </li>
          <li>
            <Link href="/messages" className="btn-secondary">
              ✉️ Messages
            </Link>
          </li>
          <li>
            <Link href="/history" className="btn-secondary">
              History
            </Link>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Your Profile Summary</h2>
        <pre style={{ background: "var(--bg-elevated)", padding: "1rem", borderRadius: "0.5rem" }}>
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  );
}
