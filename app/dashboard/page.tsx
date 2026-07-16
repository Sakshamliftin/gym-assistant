import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import Footer from "@/components/Footer";
import SessionResetRedirect from "@/components/SessionResetRedirect";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Ensure the user exists in the database
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser) {
    return <SessionResetRedirect />;
  }

  // Fetch real profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  });

  // Redirect to onboarding if not yet complete
  if (!profile?.onboardingDone) {
    redirect("/onboarding");
  }

  // 1. Fetch subscriptions & posts
  let subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      creator: {
        include: {
          posts: {
            orderBy: { createdAt: "desc" },
          }
        }
      }
    }
  });

  // 2. Seed demo data if user has no subscriptions
  if (subscriptions.length === 0) {
    let creators = await prisma.creator.findMany();
    
    if (creators.length === 0) {
      const creatorUsersData = [
        {
          email: "coach_alex@gymbuddy.com",
          name: "Alex Mercer",
          displayName: "Alex Mercer (Strength Coach)",
          bio: "Elite Powerlifter & Strength Coach. Teaching you the art of the heavy squat and deadlift."
        },
        {
          email: "sarah_fit@gymbuddy.com",
          name: "Sarah Jenkins",
          displayName: "Sarah Jenkins (HIIT & Mobility)",
          bio: "Yoga therapist & HIIT instructor. Helping you move better and build functional strength."
        },
        {
          email: "nutrition_guru@gymbuddy.com",
          name: "David Vance",
          displayName: "David Vance (Nutritionist)",
          bio: "Registered dietitian. Clean eating, macro tracking, and meal prep made simple."
        }
      ];

      for (const cu of creatorUsersData) {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: cu.email,
            name: cu.name,
            username: cu.email.split("@")[0],
            password: "democreatorpass",
          }
        });
        // Create creator
        const creator = await prisma.creator.create({
          data: {
            userId: user.id,
            displayName: cu.displayName,
            bio: cu.bio,
          }
        });
        // Create posts
        if (cu.email.includes("alex")) {
          await prisma.post.createMany({
            data: [
              {
                creatorId: creator.id,
                title: "Mastering the Squat Depth",
                content: "Squat depth is determined by your hip and ankle mobility. Try holding a deep goblet squat stretch for 30s before your next leg day to warm up your hip capsules!"
              },
              {
                creatorId: creator.id,
                title: "The 5-3-1 Method for Power",
                content: "If your bench press is stalling, shift to a block-periodized 5-3-1 cycle. Focus on submaximal load speed rather than grinding out failure sets every single week."
              }
            ]
          });
        } else if (cu.email.includes("sarah")) {
          await prisma.post.createMany({
            data: [
              {
                creatorId: creator.id,
                title: "10 Min Morning Mobility Flow",
                content: "Start your day with: 1. Cat-Cow (10 reps), 2. World's Greatest Stretch (5 per side), 3. Deep Squat to hamstring stretch (8 reps). Your joints will thank you!"
              },
              {
                creatorId: creator.id,
                title: "Hydration & Recovery",
                content: "Muscle soreness (DOMS) is heavily amplified by dehydration. Aim for at least 3.5 liters of water daily, and make sure you're getting sodium and magnesium post-workout."
              }
            ]
          });
        } else {
          await prisma.post.createMany({
            data: [
              {
                creatorId: creator.id,
                title: "The Truth About Protein Spacing",
                content: "Your body can absorb protein all day, but muscle protein synthesis is optimized when you space out protein intake into 30-40g boluses every 3 to 4 hours."
              },
              {
                creatorId: creator.id,
                title: "Easy Meal Prep: Lemon Herb Chicken",
                content: "Prep 4 meals in 20 mins: Dice 600g chicken breast, season with garlic powder, oregano, lemon juice, salt, and pepper. Sear in olive oil. Serve with 150g jasmine rice and roasted broccoli!"
              }
            ]
          });
        }
      }
      creators = await prisma.creator.findMany();
    }

    // Subscribe user to these creators
    for (const creator of creators) {
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          creatorId: creator.id
        }
      }).catch(() => {});
    }

    // Re-fetch subscriptions
    subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: {
        creator: {
          include: {
            posts: {
              orderBy: { createdAt: "desc" },
            }
          }
        }
      }
    });
  }

  // 3. Flatten and sort posts
  const posts = subscriptions
    .flatMap((sub) =>
      sub.creator.posts.map((post) => ({
        ...post,
        creator: sub.creator
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Welcome back, <strong style={{ color: "var(--text-primary)" }}>{session.user.name || session.user.email}</strong>! Here is your training summary and feed.
          </p>
        </div>

        {/* Carousel / Banner */}
        <div style={{ borderRadius: "1rem", overflow: "hidden", marginBottom: "2.5rem", border: "1px solid var(--border-subtle)" }}>
          <Carousel />
        </div>

        {/* Main Columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="dashboard-grid">
          {/* Custom style helper for responsive layouts */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media (min-width: 900px) {
              .dashboard-grid {
                grid-template-columns: 1.8fr 1.2fr !important;
              }
            }
          ` }} />

          {/* Left Column: Community Feed */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
              Your Feed
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {posts.length === 0 ? (
                <div style={{ padding: "3rem", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "1rem", textAlign: "center" }}>
                  <p style={{ color: "var(--text-muted)" }}>No updates from your subscribed communities yet.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <article
                    key={post.id}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "1rem",
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, color: "var(--accent)", fontSize: "0.875rem" }}>
                        {post.creator.displayName}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {post.title && (
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {post.title}
                      </h3>
                    )}
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.9375rem", whiteSpace: "pre-wrap" }}>
                      {post.content}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Actions & Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Quick Actions */}
            <div style={{ padding: "1.5rem", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
                Quick Actions
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Link href="/workouts/new" className="btn-primary" style={{ width: "100%", textAlign: "center" }}>
                  🏋️ Start Workout
                </Link>
                <Link href="/workouts/generator" className="btn-primary" style={{ width: "100%", textAlign: "center", background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)" }}>
                  🤖 AI Routine Generator
                </Link>
                <Link href="/coach" className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
                  🤖 Ask AI Coach
                </Link>
                <Link href="/community" className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
                  🌍 Explore Communities
                </Link>
                <Link href="/messages" className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
                  ✉️ Messages
                </Link>
                <Link href="/history" className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
                  📈 Workout History
                </Link>
              </div>
            </div>

            {/* Profile Summary */}
            <div style={{ padding: "1.5rem", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                Your Profile
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {[
                  { label: "Goal", value: profile?.fitnessGoal?.replace("-", " ") },
                  { label: "Experience", value: profile?.experienceLevel },
                  { label: "Age", value: profile?.age ? `${profile.age} yrs` : null },
                  { label: "Weight", value: profile?.weightKg ? `${profile.weightKg} kg` : null },
                  { label: "Height", value: profile?.heightCm ? `${profile.heightCm} cm` : null },
                  { label: "Training Days", value: profile?.workoutFrequency ? `${profile.workoutFrequency}x / week` : null },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 500, textTransform: "capitalize" }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
              <Link href="/onboarding" style={{ display: "block", marginTop: "1rem", fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none", textAlign: "center" }}>
                ✏️ Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
