import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Mail, 
  ClipboardList, 
  MessageSquare, 
  Linkedin, 
  Target,
  Briefcase,
  FileEdit,
  Users,
  ArrowRight,
  User,
  Sparkles
} from "lucide-react";

const jobSeekerFeatures = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    description: "Create professional, ATS-friendly resumes in minutes. Add your experience, education, and skills, then generate a polished resume with AI-powered formatting and optimization.",
    link: "/resume-builder",
    available: true
  },
  {
    icon: User,
    title: "Secure Account Management",
    description: "Sign up and log in securely with JWT authentication. Your account data is safely stored and encrypted. Access your saved resumes and track your progress.",
    link: "/signup",
    available: true
  },
  {
    icon: Mail,
    title: "Cover Letter Generator",
    description: "Generate personalized, compelling cover letters tailored to each job application with AI assistance.",
    available: false
  },
  {
    icon: ClipboardList,
    title: "Job Tracker Dashboard",
    description: "Organize your applications, track statuses, set reminders, and never miss an interview date.",
    available: false
  },
  {
    icon: MessageSquare,
    title: "Interview Prep Bot",
    description: "Practice with AI-generated interview questions based on your role and industry. Get instant feedback on your responses.",
    link: "/interview-prep",
    available: true
  },
  {
    icon: Linkedin,
    title: "LinkedIn Optimizer",
    description: "Optimize your LinkedIn profile with AI suggestions to attract more recruiters and increase your visibility.",
    available: false
  },
  {
    icon: Target,
    title: "Smart Job Matcher",
    description: "Get personalized job recommendations based on your skills, experience, and preferences. Find your perfect match faster.",
    available: false
  }
];

const freelancerFeatures = [
  {
    icon: FileEdit,
    title: "Proposal Generator",
    description: "Create winning proposals for Upwork, Fiverr, and other freelance platforms in seconds. AI-powered proposals that convert.",
    available: false
  },
  {
    icon: Briefcase,
    title: "Gig Optimizer",
    description: "Craft compelling titles and descriptions that get noticed by clients. Optimize your gig listings for maximum visibility.",
    available: false
  },
  {
    icon: Users,
    title: "Client Communication",
    description: "Access pre-built templates for professional client communication. Maintain professionalism while saving time.",
    available: false
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Job Seekers Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              For <span className="relative inline-block">Job Seekers<div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" /></span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to land your next opportunity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobSeekerFeatures.map((feature, index) => (
              <Card 
                key={index}
                className={`p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 ${
                  feature.available ? 'border-primary/50' : 'border-border opacity-75'
                } bg-card group relative`}
              >
                {feature.available && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                )}
                {!feature.available && (
                  <Badge variant="outline" className="absolute top-4 right-4">
                    Coming Soon
                  </Badge>
                )}
                <div className={`w-12 h-12 ${feature.available ? 'bg-primary' : 'bg-muted'} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.available ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                {feature.link && feature.available && (
                  <Link to={feature.link}>
                    <Button variant="ghost" size="sm" className="group/btn">
                      Try it now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Freelancers Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              For <span className="relative inline-block">Freelancers<div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" /></span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Win more gigs and grow your freelance business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {freelancerFeatures.map((feature, index) => (
              <Card 
                key={index}
                className={`p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 ${
                  feature.available ? 'border-primary/50' : 'border-border opacity-75'
                } bg-card group relative`}
              >
                {feature.available && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                )}
                {!feature.available && (
                  <Badge variant="outline" className="absolute top-4 right-4">
                    Coming Soon
                  </Badge>
                )}
                <div className={`w-12 h-12 ${feature.available ? 'bg-secondary' : 'bg-muted'} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.available ? 'text-secondary-foreground' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
