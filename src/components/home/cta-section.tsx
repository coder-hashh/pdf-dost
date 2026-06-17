import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Ready to{" "}
          <span className="gradient-text">Get Started</span>?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Join thousands of users who trust PDF Dost for their document needs.
          No sign-up required.
        </p>
        <Button
          asChild
          size="lg"
          className="gradient-primary h-12 rounded-xl px-8 text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
        >
          <Link href="/tools">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
