import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import {
  Users,
  Target,
  Eye,
  Shield,
  Zap,
  Globe,
  Heart,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${APP_NAME} — our mission to make PDF tools accessible, fast, and free for everyone.`,
};

const values = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your files never leave your control. We encrypt everything and auto-delete after 24 hours.",
  },
  {
    icon: Zap,
    title: "Speed Matters",
    description:
      "Every tool is optimized for performance. No unnecessary steps, no bloated processes.",
  },
  {
    icon: Globe,
    title: "Accessible to All",
    description:
      "Free for everyone, everywhere. No account required for core tools — just open and use.",
  },
  {
    icon: Heart,
    title: "User-Centered Design",
    description:
      "Built from real user feedback. Every feature exists because someone needed it.",
  },
];

export default function AboutPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <section className="mb-20 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            About <span className="gradient-text">{APP_NAME}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            We believe working with PDFs should be simple, secure, and free.{" "}
            {APP_NAME} brings together all the tools you need — no downloads, no
            sign-ups, no hassle.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="mb-20 grid gap-8 md:grid-cols-2">
          <div className="glass rounded-2xl p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mb-3 text-2xl font-bold">Our Mission</h2>
            <p className="leading-relaxed text-muted-foreground">
              To democratize PDF tools by providing a fast, secure, and
              completely free platform that anyone can use. We&apos;re committed
              to removing barriers between people and their documents.
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Eye className="h-6 w-6 text-accent" />
            </div>
            <h2 className="mb-3 text-2xl font-bold">Our Vision</h2>
            <p className="leading-relaxed text-muted-foreground">
              A world where document management is effortless. We envision{" "}
              {APP_NAME} as the go-to platform for all PDF operations —
              trusted by millions for its simplicity and reliability.
            </p>
          </div>
        </section>

        {/* Why PDF Dost */}
        <section className="mb-20">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Why <span className="gradient-text">{APP_NAME}</span>?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="flex gap-4 rounded-xl border border-border p-6 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{value.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team */}
        <section className="text-center">
          <h2 className="mb-4 text-3xl font-bold">Our Team</h2>
          <p className="mb-10 text-muted-foreground">
            A passionate team of developers and designers building the best PDF
            tools on the web.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { name: "Alex Johnson", role: "Founder & Lead Developer" },
              { name: "Sarah Chen", role: "UI/UX Designer" },
              { name: "Michael Park", role: "Backend Engineer" },
            ].map((member) => (
              <div
                key={member.name}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
