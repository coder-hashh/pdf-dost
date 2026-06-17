import type { Metadata } from "next";
import { ToolsGrid } from "@/components/home/tools-grid";

export const metadata: Metadata = {
  title: "All PDF Tools",
  description:
    "Choose from our collection of 15+ powerful PDF tools. Merge, split, compress, convert, protect, and more — all free.",
  openGraph: {
    title: "All PDF Tools | PDF Dost",
    description:
      "Choose from our collection of 15+ powerful PDF tools. Merge, split, compress, convert, protect, and more — all free.",
  },
};

export default function ToolsPage() {
  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            All <span className="gradient-text">PDF Tools</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose from our collection of powerful PDF tools designed to make
            your document workflows effortless.
          </p>
        </div>

        <ToolsGrid />
      </div>
    </div>
  );
}
