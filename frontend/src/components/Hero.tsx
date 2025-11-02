import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-card border-2 border-border rounded-full shadow-lg">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">AI-Powered Career Platform</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-foreground leading-tight tracking-tight">
            Boost Your Career
            <br />
            <span className="relative inline-block mt-2">
              with AI Power
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary" />
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional resume building, intelligent job matching, and expert interview preparation—all powered by cutting-edge artificial intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/resume-builder">
              <Button size="xl" variant="hero" className="group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="xl" variant="outline">
              Watch Demo
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
