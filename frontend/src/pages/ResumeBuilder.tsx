import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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

  const [experience, setExperience] = useState([
    { position: "", company: "", startDate: "", endDate: "", description: "" }
  ]);

  const [education, setEducation] = useState([
    { degree: "", field: "", school: "", year: "", gpa: "" }
  ]);

  const [skills, setSkills] = useState<string[]>([""]);

  const addExperience = () => {
    setExperience([...experience, { position: "", company: "", startDate: "", endDate: "", description: "" }]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", field: "", school: "", year: "", gpa: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    setSkills([...skills, ""]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleGenerate = async () => {
    try {
      // Validate personal info
      const validatedInfo = personalInfoSchema.parse(personalInfo);
      
      // Filter out empty entries
      const validExperience = experience.filter(exp => exp.position && exp.company);
      const validEducation = education.filter(edu => edu.degree && edu.school);
      const validSkills = skills.filter(skill => skill.trim());

      if (validExperience.length === 0) {
        toast({
          title: "Missing information",
          description: "Please add at least one work experience entry",
          variant: "destructive",
        });
        return;
      }

      if (validEducation.length === 0) {
        toast({
          title: "Missing information",
          description: "Please add at least one education entry",
          variant: "destructive",
        });
        return;
      }

      if (validSkills.length === 0) {
        toast({
          title: "Missing information",
          description: "Please add at least one skill",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('generate-resume', {
        body: {
          personalInfo: validatedInfo,
          experience: validExperience,
          education: validEducation,
          skills: validSkills,
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedResume(data.resume);
      toast({
        title: "Success!",
        description: "Your AI-powered resume has been generated",
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        console.error("Error generating resume:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to generate resume. Please try again.",
          variant: "destructive",
        });
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
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Resume Builder</h1>
            <p className="text-xl text-muted-foreground">
              Create an ATS-friendly resume powered by AI in minutes
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <Card className="p-6 border-2">
                <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                      placeholder="John Doe"
                      maxLength={100}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                        placeholder="john@example.com"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        placeholder="+1 234 567 8900"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                      placeholder="New York, NY"
                      maxLength={100}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn (optional)</Label>
                      <Input
                        id="linkedin"
                        value={personalInfo.linkedin}
                        onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website (optional)</Label>
                      <Input
                        id="website"
                        value={personalInfo.website}
                        onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="summary">Professional Summary (optional)</Label>
                    <Textarea
                      id="summary"
                      value={personalInfo.summary}
                      onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                      placeholder="Brief overview of your professional background..."
                      rows={4}
                      maxLength={500}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Work Experience *</h2>
                  <Button onClick={addExperience} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="space-y-6">
                  {experience.map((exp, index) => (
                    <div key={index} className="p-4 border rounded-lg relative">
                      {experience.length > 1 && (
                        <Button
                          onClick={() => removeExperience(index)}
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Position</Label>
                            <Input
                              value={exp.position}
                              onChange={(e) => {
                                const newExp = [...experience];
                                newExp[index].position = e.target.value;
                                setExperience(newExp);
                              }}
                              placeholder="Software Engineer"
                              maxLength={100}
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const newExp = [...experience];
                                newExp[index].company = e.target.value;
                                setExperience(newExp);
                              }}
                              placeholder="Tech Corp"
                              maxLength={100}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              value={exp.startDate}
                              onChange={(e) => {
                                const newExp = [...experience];
                                newExp[index].startDate = e.target.value;
                                setExperience(newExp);
                              }}
                              placeholder="Jan 2020"
                              maxLength={50}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              value={exp.endDate}
                              onChange={(e) => {
                                const newExp = [...experience];
                                newExp[index].endDate = e.target.value;
                                setExperience(newExp);
                              }}
                              placeholder="Present"
                              maxLength={50}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => {
                              const newExp = [...experience];
                              newExp[index].description = e.target.value;
                              setExperience(newExp);
                            }}
                            placeholder="Key responsibilities and achievements..."
                            rows={3}
                            maxLength={500}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Education *</h2>
                  <Button onClick={addEducation} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div key={index} className="p-4 border rounded-lg relative">
                      {education.length > 1 && (
                        <Button
                          onClick={() => removeEducation(index)}
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => {
                                const newEdu = [...education];
                                newEdu[index].degree = e.target.value;
                                setEducation(newEdu);
                              }}
                              placeholder="Bachelor of Science"
                              maxLength={100}
                            />
                          </div>
                          <div>
                            <Label>Field of Study</Label>
                            <Input
                              value={edu.field}
                              onChange={(e) => {
                                const newEdu = [...education];
                                newEdu[index].field = e.target.value;
                                setEducation(newEdu);
                              }}
                              placeholder="Computer Science"
                              maxLength={100}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>School</Label>
                            <Input
                              value={edu.school}
                              onChange={(e) => {
                                const newEdu = [...education];
                                newEdu[index].school = e.target.value;
                                setEducation(newEdu);
                              }}
                              placeholder="University Name"
                              maxLength={150}
                            />
                          </div>
                          <div>
                            <Label>Year</Label>
                            <Input
                              value={edu.year}
                              onChange={(e) => {
                                const newEdu = [...education];
                                newEdu[index].year = e.target.value;
                                setEducation(newEdu);
                              }}
                              placeholder="2020"
                              maxLength={50}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>GPA (optional)</Label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].gpa = e.target.value;
                              setEducation(newEdu);
                            }}
                            placeholder="3.8/4.0"
                            maxLength={20}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Skills *</h2>
                  <Button onClick={addSkill} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        placeholder="e.g., JavaScript, Project Management"
                        maxLength={50}
                      />
                      {skills.length > 1 && (
                        <Button
                          onClick={() => removeSkill(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

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
                ) : (
                  "Generate AI Resume"
                )}
              </Button>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Preview</h2>
                  {generatedResume && (
                    <Button onClick={downloadResume} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
                <div className="prose prose-sm max-w-none bg-muted/30 p-6 rounded-lg min-h-[600px]">
                  {generatedResume ? (
                    <ReactMarkdown>{generatedResume}</ReactMarkdown>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Fill in the form and click "Generate AI Resume" to see your resume here
                    </div>
                  )}
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
