import { Zap, Shield, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Process your files in seconds with optimized algorithms. No waiting, no hassle.",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "Your files are encrypted and automatically deleted after 24 hours. Privacy guaranteed.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "bg-emerald-500/10",
  },
  {
    icon: Gift,
    title: "100% Free",
    description:
      "No hidden costs, no registration required for basic tools. Just open and use.",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "bg-violet-500/10",
  },
] as const;

export function FeaturesSection() {
  return (
    <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose{" "}
            <span className="gradient-text">PDF Dost</span>?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Built with performance, security, and simplicity in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={cn(
                  "glass group relative rounded-2xl p-8 transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-xl"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "mb-6 flex h-14 w-14 items-center justify-center rounded-xl",
                    feature.bgGradient
                  )}
                >
                  <Icon
                    className={cn(
                      "h-7 w-7 bg-gradient-to-br bg-clip-text",
                      feature.gradient
                    )}
                    style={{
                      color: `var(--color-${feature.gradient.split("-")[1]})`,
                    }}
                  />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
