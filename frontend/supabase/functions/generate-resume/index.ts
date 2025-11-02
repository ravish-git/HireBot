import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personalInfo, experience, education, skills } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construct the prompt for AI resume generation
    const prompt = `Create a professional, ATS-friendly resume based on the following information:

PERSONAL INFORMATION:
Name: ${personalInfo.name}
Email: ${personalInfo.email}
Phone: ${personalInfo.phone}
Location: ${personalInfo.location}
${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ''}
${personalInfo.website ? `Website: ${personalInfo.website}` : ''}

PROFESSIONAL SUMMARY:
${personalInfo.summary || 'No summary provided'}

WORK EXPERIENCE:
${experience.map((exp: any, idx: number) => `
${idx + 1}. ${exp.position} at ${exp.company}
   ${exp.startDate} - ${exp.endDate || 'Present'}
   ${exp.description}
`).join('\n')}

EDUCATION:
${education.map((edu: any, idx: number) => `
${idx + 1}. ${edu.degree} in ${edu.field}
   ${edu.school}, ${edu.year}
   ${edu.gpa ? `GPA: ${edu.gpa}` : ''}
`).join('\n')}

SKILLS:
${skills.join(', ')}

Generate a professional resume in a clean, well-structured format. Include:
1. A compelling professional summary
2. Properly formatted work experience with bullet points highlighting achievements
3. Education details
4. Skills section organized by category
5. Use action verbs and quantify achievements where possible
6. Make it ATS-friendly with clear section headers

Format the resume in Markdown with proper headers (##) and bullet points.`;

    console.log("Generating resume with Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional resume writer with expertise in creating ATS-friendly resumes that highlight candidates' strengths and achievements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedResume = data.choices[0].message.content;

    console.log("Resume generated successfully");

    return new Response(
      JSON.stringify({ resume: generatedResume }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in generate-resume function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
