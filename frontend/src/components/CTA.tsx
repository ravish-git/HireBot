import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-muted/30">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Start Your Journey Today</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-foreground">
            Ready to Transform Your{" "}
            <span className="relative inline-block">
              Career?
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary" />
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who are already using AI to land better jobs 
            and grow their careers faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="xl" variant="hero" className="group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="xl" variant="outline">
              Schedule a Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required • Free forever plan available • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};
