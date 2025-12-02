import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Download, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

const personalInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(10, "Phone must be at least 10 characters").max(20),
  location: z.string().min(2).max(100),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  summary: z.string().max(500, "Summary must be less than 500 characters").optional(),
});

const ResumeBuilder = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState("");
  
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    summary: "",
  });

  const [experience, setExperience] = useState([{ position: "", company: "", startDate: "", endDate: "", description: "" }]);
  const [education, setEducation] = useState([{ degree: "", field: "", school: "", year: "", gpa: "" }]);
  const [skills, setSkills] = useState<string[]>([""]);

  // --- Add / Remove handlers (same as before) ---
  const addExperience = () => setExperience([...experience, { position: "", company: "", startDate: "", endDate: "", description: "" }]);
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));
  const addEducation = () => setEducation([...education, { degree: "", field: "", school: "", year: "", gpa: "" }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));
  const addSkill = () => setSkills([...skills, ""]);
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));
  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleGenerate = async () => {
    try {
      const validatedInfo = personalInfoSchema.parse(personalInfo);
      const validExperience = experience.filter(exp => exp.position && exp.company);
      const validEducation = education.filter(edu => edu.degree && edu.school);
      const validSkills = skills.filter(skill => skill.trim());

      if (!validExperience.length || !validEducation.length || !validSkills.length) {
        toast({
          title: "Missing information",
          description: "Please fill all required sections",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      // --- PUTER AI API Call ---
      const res = await fetch("https://api.puter.ai/resume", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_PUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalInfo: validatedInfo,
          experience: validExperience,
          education: validEducation,
          skills: validSkills,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate resume");
      }

      setGeneratedResume(data.resume);
      toast({
        title: "Success!",
        description: "Your AI-powered resume has been generated",
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({ title: "Validation Error", description: firstError.message, variant: "destructive" });
      } else {
        toast({ title: "Error", description: error instanceof Error ? error.message : "Something went wrong", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResume = () => {
    const blob = new Blob([generatedResume], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Resume Builder</h1>
            <p className="text-xl text-muted-foreground">Create an ATS-friendly resume powered by AI in minutes</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}  
            {/* ... All Cards for personal info, experience, education, skills ... */}
            {/* Use your existing form code here, unchanged */}

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              size="lg"
              className="w-full"
              variant="hero"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Resume...
                </>
              ) : "Generate AI Resume"}
            </Button>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Preview</h2>
                  {generatedResume && (
                    <Button onClick={downloadResume} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  )}
                </div>
                <div className="prose prose-sm max-w-none bg-muted/30 p-6 rounded-lg min-h-[600px]">
                  {generatedResume ? <ReactMarkdown>{generatedResume}</ReactMarkdown> :
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Fill in the form and click "Generate AI Resume" to see your resume here
                    </div>}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
