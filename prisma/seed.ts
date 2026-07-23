import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12)

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@moxn.com" },
    update: {},
    create: {
      email: "admin@moxn.com",
      passwordHash,
      role: "admin",
    },
  })
  console.log("  Admin:", admin.email)

  // --- Companies & Employers ---
  const companiesData = [
    {
      name: "Vercel",
      description: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
      website: "https://vercel.com",
      employer: { email: "hiring@vercel.com", name: "Sarah Chen" },
    },
    {
      name: "Stripe",
      description: "Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size use our software to accept payments and manage their operations online.",
      website: "https://stripe.com",
      employer: { email: "hiring@stripe.com", name: "Marcus Johnson" },
    },
    {
      name: "Linear",
      description: "Linear is a purpose-built tool for planning and building products. It helps teams streamline issues, sprints, and product roadmaps.",
      website: "https://linear.app",
      employer: { email: "hiring@linear.app", name: "Aiko Tanaka" },
    },
    {
      name: "Cal.com",
      description: "Cal.com is the open-source scheduling infrastructure for everyone. We make scheduling simple and secure for millions of users worldwide.",
      website: "https://cal.com",
      employer: { email: "hiring@cal.com", name: "James Miller" },
    },
  ]

  const companies: { id: string; name: string }[] = []

  for (const c of companiesData) {
    const user = await prisma.user.upsert({
      where: { email: c.employer.email },
      update: {},
      create: {
        email: c.employer.email,
        passwordHash,
        role: "employer",
      },
    })

    const company = await prisma.company.upsert({
      where: { ownerUserId: user.id },
      update: {},
      create: {
        ownerUserId: user.id,
        name: c.name,
        description: c.description,
        website: c.website,
        status: "active",
      },
    })
    companies.push({ id: company.id, name: company.name })
    console.log("  Company:", company.name, "/", c.employer.email)
  }

  const vercelId = companies.find((c) => c.name === "Vercel")!.id
  const stripeId = companies.find((c) => c.name === "Stripe")!.id
  const linearId = companies.find((c) => c.name === "Linear")!.id
  const calId = companies.find((c) => c.name === "Cal.com")!.id

  // --- Jobs ---
  const jobsData = [
    { companyId: vercelId, title: "Senior Frontend Engineer", description: "Build and maintain the Next.js dashboard and Vercel platform UI. Work with React, TypeScript, and our design system to create delightful developer experiences.", location: "San Francisco, CA", employmentType: "full-time", salaryMin: 180000, salaryMax: 250000, tags: ["React", "TypeScript", "Next.js", "UI"], status: "published" },
    { companyId: vercelId, title: "Platform Engineer - Edge", description: "Design and build the edge compute platform that powers millions of deployments. Deep systems knowledge and experience with distributed systems required.", location: "San Francisco, CA", employmentType: "full-time", salaryMin: 200000, salaryMax: 280000, tags: ["Go", "Rust", "Distributed Systems", "Edge"], status: "published" },
    { companyId: stripeId, title: "Software Engineer, Payments", description: "Build and maintain the core payments infrastructure that processes billions of dollars in transactions. Work on high-throughput, low-latency systems.", location: "Remote", employmentType: "full-time", salaryMin: 190000, salaryMax: 270000, tags: ["Java", "Kafka", "Distributed Systems", "Payments"], status: "published" },
    { companyId: stripeId, title: "Developer Experience Engineer", description: "Create exceptional API documentation, SDKs, and developer tools that make it easy for millions of developers to integrate with Stripe.", location: "Remote", employmentType: "full-time", salaryMin: 170000, salaryMax: 240000, tags: ["Documentation", "API Design", "SDKs", "Developer Tools"], status: "published" },
    { companyId: linearId, title: "Full Stack Engineer", description: "Work across the stack to build features that delight users. From the database layer to the UI, you'll own features end-to-end.", location: "New York, NY", employmentType: "full-time", salaryMin: 175000, salaryMax: 240000, tags: ["TypeScript", "React", "GraphQL", "PostgreSQL"], status: "published" },
    { companyId: linearId, title: "Mobile Engineer - iOS", description: "Build the Linear iOS app from the ground up. You'll be responsible for architecture, implementation, and delivery of a world-class mobile experience.", location: "New York, NY", employmentType: "full-time", salaryMin: 170000, salaryMax: 235000, tags: ["Swift", "SwiftUI", "iOS", "Mobile"], status: "published" },
    { companyId: calId, title: "Open Source Community Manager", description: "Grow and nurture the Cal.com open source community. Manage contributions, write documentation, and organize community events.", location: "Remote", employmentType: "full-time", salaryMin: 90000, salaryMax: 140000, tags: ["Open Source", "Community", "Documentation", "Events"], status: "published" },
    { companyId: calId, title: "Full Stack Engineer - Scheduling", description: "Build scheduling infrastructure that powers millions of bookings. Work across our TypeScript stack to ship features quickly.", location: "Remote", employmentType: "full-time", salaryMin: 140000, salaryMax: 200000, tags: ["TypeScript", "React", "tRPC", "Prisma"], status: "published" },
    { companyId: vercelId, title: "Design Intern", description: "Join our design team for a 3-month internship. Work on real projects that ship to millions of developers.", location: "San Francisco, CA", employmentType: "internship", salaryMin: 40000, salaryMax: 60000, tags: ["Design", "Figma", "UI/UX"], status: "published" },
    { companyId: linearId, title: "Engineering Intern", description: "Summer internship on the Linear engineering team. Contribute to our product and learn from experienced engineers.", location: "New York, NY", employmentType: "internship", salaryMin: 50000, salaryMax: 70000, tags: ["TypeScript", "React", "Engineering"], status: "draft" },
  ]

  const jobs: { id: string; companyId: string }[] = []
  for (const j of jobsData) {
    const job = await prisma.job.create({
      data: {
        companyId: j.companyId,
        title: j.title,
        description: j.description,
        location: j.location,
        employmentType: j.employmentType,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        tags: JSON.stringify(j.tags),
        status: j.status,
      },
    })
    jobs.push({ id: job.id, companyId: job.companyId })
    console.log("  Job:", job.title, `(${j.status})`)
  }

  // --- Candidates ---
  const candidatesData = [
    { email: "alice@example.com", name: "Alice Rivera", headline: "Senior Frontend Engineer", location: "San Francisco, CA", skills: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind CSS"] },
    { email: "bob@example.com", name: "Bob Kim", headline: "Full Stack Developer", location: "New York, NY", skills: ["TypeScript", "Node.js", "React", "PostgreSQL", "Docker"] },
    { email: "carol@example.com", name: "Carol Davis", headline: "Backend Engineer", location: "Remote", skills: ["Go", "Python", "PostgreSQL", "Kubernetes", "gRPC"] },
  ]

  const candidates: { id: string; userId: string; profileId: string }[] = []
  for (const cd of candidatesData) {
    const user = await prisma.user.upsert({
      where: { email: cd.email },
      update: {},
      create: {
        email: cd.email,
        passwordHash,
        role: "candidate",
      },
    })

    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: cd.name,
        headline: cd.headline,
        location: cd.location,
        skills: JSON.stringify(cd.skills),
      },
    })
    candidates.push({ id: user.id, userId: user.id, profileId: profile.id })
    console.log("  Candidate:", cd.name, "/", cd.email)
  }

  // --- Applications ---
  const applicationsData = [
    { jobIdx: 0, candidateIdx: 0, status: "interview", note: "I've been using Next.js since v9 and would love to join Vercel to help shape the future of the platform." },
    { jobIdx: 1, candidateIdx: 2, status: "reviewing", note: "My background in distributed systems and Go makes me a great fit for the Edge platform team." },
    { jobIdx: 2, candidateIdx: 1, status: "new", note: "I have extensive experience building payment systems and would love to contribute to Stripe's infrastructure." },
    { jobIdx: 3, candidateIdx: 0, status: "offer", note: "Creating great developer experiences is my passion. I've built SDKs and tools at my previous role." },
    { jobIdx: 4, candidateIdx: 1, status: "reviewing", note: "Linear is my favorite project management tool. I'd love to help build it." },
    { jobIdx: 6, candidateIdx: 2, status: "new", note: "I'm passionate about open source and have contributed to several projects in the scheduling space." },
    { jobIdx: 7, candidateIdx: 1, status: "closed", note: "I've built scheduling systems before and would love to work on Cal.com's infrastructure." },
  ]

  for (const app of applicationsData) {
    const job = jobs[app.jobIdx]
    const candidate = candidates[app.candidateIdx]
    const now = new Date()
    const created = new Date(now.getTime() - Math.floor(Math.random() * 14 * 86400000))

    const statusHistory: { from: string | null; to: string; timestamp: string; note: string }[] = [
      { from: null, to: "new", timestamp: created.toISOString(), note: "Application submitted" },
    ]

    if (app.status !== "new") {
      const transitionTime = new Date(created.getTime() + 86400000)
      statusHistory.push({
        from: "new",
        to: app.status,
        timestamp: transitionTime.toISOString(),
        note: `Status changed to ${app.status}`,
      })
    }

    await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.profileId,
        coverNote: app.note,
        status: app.status,
        statusHistory: JSON.stringify(statusHistory),
        createdAt: created,
      },
    })
    console.log(`  Application: ${candidatesData[app.candidateIdx].name} -> ${jobsData[app.jobIdx].title} (${app.status})`)
  }

  // --- Flags ---
  const flagTargets = [
    { targetType: "job", targetId: jobs[5].id, reason: "This job posting appears to be a duplicate of another listing.", reportedByEmail: candidatesData[0].email },
    { targetType: "company", targetId: companies.find((c) => c.name === "Cal.com")!.id, reason: "The company description contains misleading information about the team size.", reportedByEmail: candidatesData[1].email },
  ]

  for (const ft of flagTargets) {
    const reportedBy = await prisma.user.findUnique({ where: { email: ft.reportedByEmail } })
    await prisma.flag.create({
      data: {
        targetType: ft.targetType,
        targetId: ft.targetId,
        reason: ft.reason,
        reportedById: reportedBy?.id ?? null,
        status: "open",
      },
    })
    console.log("  Flag:", ft.reason)
  }

  console.log("\nSeed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
