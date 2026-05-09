import { HowItWorks as HowItWorksBlock } from "@/components/ui/how-it-works";

export function HowItWorks() {
  return (
    <HowItWorksBlock
      id="about"
      aria-labelledby="steps-heading"
      headingId="steps-heading"
      className="py-14 sm:py-20"
    />
  );
}