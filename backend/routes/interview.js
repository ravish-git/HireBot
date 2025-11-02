const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// For AI functionality, we'll use OpenAI-compatible API or similar
// You can configure this with an API key in .env
// Supports: Gemini, OpenAI, Lovable AI, or any OpenAI-compatible API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const AI_API_KEY = process.env.AI_API_KEY;

// Determine which API to use (priority: Gemini > OpenAI > Lovable > Custom)
let AI_API_URL, API_KEY, AI_MODEL, USE_GEMINI = false;

if (GEMINI_API_KEY) {
  USE_GEMINI = true;
  API_KEY = GEMINI_API_KEY;
  AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
  AI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
} else if (OPENAI_API_KEY) {
  API_KEY = OPENAI_API_KEY;
  AI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  AI_MODEL = process.env.AI_MODEL || 'gpt-3.5-turbo';
} else if (LOVABLE_API_KEY) {
  API_KEY = LOVABLE_API_KEY;
  AI_API_URL = process.env.AI_API_URL || 'https://ai.gateway.lovable.dev/v1/chat/completions';
  AI_MODEL = process.env.AI_MODEL || 'google/gemini-2.5-flash';
} else if (AI_API_KEY) {
  API_KEY = AI_API_KEY;
  AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  AI_MODEL = process.env.AI_MODEL || 'gpt-3.5-turbo';
}

// Generate interview questions
router.post('/questions', auth, async (req, res, next) => {
  try {
    const { role, industry, experienceLevel, questionCount = 5 } = req.body;

    if (!role || !industry) {
      return res.status(400).json({ 
        message: 'Please provide role and industry' 
      });
    }

    if (!API_KEY) {
      return res.status(500).json({ 
        message: 'AI service not configured. Please add GEMINI_API_KEY, OPENAI_API_KEY, or LOVABLE_API_KEY to your .env file.' 
      });
    }

    const prompt = `Generate ${questionCount} interview questions for a ${experienceLevel || 'mid-level'} ${role} position in the ${industry} industry.

The questions should be:
1. Relevant to the role and industry
2. A mix of behavioral, technical, and situational questions
3. Appropriate for the experience level
4. Challenging but fair

Format the response as a JSON array of question objects with this structure:
[
  {
    "id": 1,
    "question": "Question text here",
    "type": "behavioral|technical|situational",
    "category": "leadership|problem-solving|communication|technical-skills|culture-fit"
  }
]

Return ONLY the JSON array, no additional text or markdown.`;

    let response;
    
    if (USE_GEMINI) {
      // Gemini API format
      const fullPrompt = `You are an expert interview coach. Generate relevant, realistic interview questions that help candidates prepare effectively.\n\n${prompt}`;
      response = await fetch(`${AI_API_URL}/models/${AI_MODEL}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        }),
      });
    } else {
      // OpenAI-compatible API format
      response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert interview coach. Generate relevant, realistic interview questions that help candidates prepare effectively.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 404) {
        let errorMsg = 'API endpoint not found. ';
        if (USE_GEMINI) {
          errorMsg += 'Please check your GEMINI_API_KEY and GEMINI_MODEL (try gemini-1.5-flash or gemini-pro).';
        } else {
          errorMsg += 'Please check your API configuration.';
        }
        return res.status(404).json({ message: errorMsg });
      }
      
      if (response.status === 429) {
        // Check for retry-after header
        const retryAfter = response.headers.get('retry-after') || '60';
        return res.status(429).json({ 
          message: `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
          retryAfter: parseInt(retryAfter)
        });
      }
      
      if (response.status === 402 || response.status === 401) {
        return res.status(402).json({ 
          message: 'API key issue or insufficient credits. Please check your API account balance.' 
        });
      }
      
      // Try to parse error message from response
      let errorMessage = `AI API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // If parsing fails, use the text as is
        if (errorText) {
          errorMessage = errorText.substring(0, 200); // Limit error message length
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    let questionsText;
    
    if (USE_GEMINI) {
      // Extract text from Gemini response
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        questionsText = data.candidates[0].content.parts[0].text.trim();
      } else {
        throw new Error('Invalid Gemini API response format');
      }
    } else {
      // Extract text from OpenAI-compatible response
      if (data.choices && data.choices[0] && data.choices[0].message) {
        questionsText = data.choices[0].message.content.trim();
      } else {
        throw new Error('Invalid API response format');
      }
    }
    
    // Remove markdown code blocks if present
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let questions;
    try {
      questions = JSON.parse(questionsText);
    } catch (parseError) {
      // If parsing fails, create questions from the text
      const questionLines = questionsText.split('\n').filter(line => 
        line.trim() && (line.includes('?') || line.match(/^\d+[\.\)]/))
      );
      questions = questionLines.map((line, index) => ({
        id: index + 1,
        question: line.replace(/^\d+[\.\)]\s*/, '').trim(),
        type: 'general',
        category: 'general'
      }));
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    next(error);
  }
});

// Get feedback on an answer
router.post('/feedback', auth, async (req, res, next) => {
  try {
    const { question, answer, role, industry } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ 
        message: 'Please provide both question and answer' 
      });
    }

    if (!API_KEY) {
      return res.status(500).json({ 
        message: 'AI service not configured. Please add GEMINI_API_KEY, OPENAI_API_KEY, or LOVABLE_API_KEY to your .env file.' 
      });
    }

    const prompt = `You are an expert interview coach providing feedback on an interview answer.

INTERVIEW QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer}

${role ? `ROLE: ${role}` : ''}
${industry ? `INDUSTRY: ${industry}` : ''}

Provide constructive feedback in the following JSON format:
{
  "score": 1-10,
  "strengths": ["strength1", "strength2"],
  "improvements": ["suggestion1", "suggestion2"],
  "sampleAnswer": "A better example answer...",
  "overallFeedback": "Overall assessment..."
}

Be constructive and helpful. Return ONLY the JSON object, no additional text or markdown.`;

    let response;
    
    if (USE_GEMINI) {
      // Gemini API format
      const fullPrompt = `You are an expert interview coach providing constructive, helpful feedback to help candidates improve their interview skills.\n\n${prompt}`;
      response = await fetch(`${AI_API_URL}/models/${AI_MODEL}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          }
        }),
      });
    } else {
      // OpenAI-compatible API format
      response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert interview coach providing constructive, helpful feedback to help candidates improve their interview skills.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 404) {
        let errorMsg = 'API endpoint not found. ';
        if (USE_GEMINI) {
          errorMsg += 'Please check your GEMINI_API_KEY and GEMINI_MODEL (try gemini-1.5-flash or gemini-pro).';
        } else {
          errorMsg += 'Please check your API configuration.';
        }
        return res.status(404).json({ message: errorMsg });
      }
      
      if (response.status === 429) {
        // Check for retry-after header
        const retryAfter = response.headers.get('retry-after') || '60';
        return res.status(429).json({ 
          message: `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
          retryAfter: parseInt(retryAfter)
        });
      }
      
      if (response.status === 402 || response.status === 401) {
        return res.status(402).json({ 
          message: 'API key issue or insufficient credits. Please check your API account balance.' 
        });
      }
      
      // Try to parse error message from response
      let errorMessage = `AI API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // If parsing fails, use the text as is
        if (errorText) {
          errorMessage = errorText.substring(0, 200); // Limit error message length
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    let feedbackText;
    
    if (USE_GEMINI) {
      // Extract text from Gemini response
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        feedbackText = data.candidates[0].content.parts[0].text.trim();
      } else {
        throw new Error('Invalid Gemini API response format');
      }
    } else {
      // Extract text from OpenAI-compatible response
      if (data.choices && data.choices[0] && data.choices[0].message) {
        feedbackText = data.choices[0].message.content.trim();
      } else {
        throw new Error('Invalid API response format');
      }
    }
    
    // Remove markdown code blocks if present
    feedbackText = feedbackText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let feedback;
    try {
      feedback = JSON.parse(feedbackText);
    } catch (parseError) {
      // If parsing fails, provide basic feedback
      feedback = {
        score: 5,
        strengths: ['You provided an answer'],
        improvements: ['Could be more specific', 'Consider adding examples'],
        sampleAnswer: 'A strong answer would include specific examples and results.',
        overallFeedback: feedbackText || 'Consider practicing your answer and adding more specific examples.'
      };
    }

    res.json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    next(error);
  }
});

module.exports = router;

