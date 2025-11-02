import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, Sparkles, Lightbulb, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

interface Question {
  id: number;
  question: string;
  type: string;
  category: string;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
  overallFeedback: string;
}

const InterviewPrep = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid-level');
  const [questionCount, setQuestionCount] = useState(5);
  
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Sales', 'Engineering', 'Design', 'Consulting', 'Retail',
    'Hospitality', 'Real Estate', 'Manufacturing', 'Media', 'Other'
  ];

  const experienceLevels = [
    { value: 'entry-level', label: 'Entry Level' },
    { value: 'mid-level', label: 'Mid Level' },
    { value: 'senior-level', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' }
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const generateQuestions = async () => {
    if (!role.trim() || !industry) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a job role and select an industry',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingQuestions(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFeedback(null);
    setShowFeedback(false);

    try {
      const token = authAPI.getToken();
      const response = await fetch(`${API_URL}/interview/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          industry,
          experienceLevel,
          questionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate questions');
      }

      setQuestions(data.questions);
      toast({
        title: 'Success!',
        description: `Generated ${data.questions.length} interview questions`,
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      let errorMessage = error instanceof Error ? error.message : 'Failed to generate questions. Please try again.';
      
      // Check if it's a rate limit error
      if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
        errorMessage = 'Rate limit exceeded. OpenAI has limits on requests. Please wait a minute and try again, or consider upgrading your OpenAI plan for higher limits.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 6000, // Show longer for rate limit errors
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: 'Missing Answer',
        description: 'Please provide an answer before submitting',
        variant: 'destructive',
      });
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setIsLoadingFeedback(true);
    setShowFeedback(false);
    setFeedback(null);

    try {
      const token = authAPI.getToken();
      const response = await fetch(`${API_URL}/interview/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: currentAnswer,
          role,
          industry,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get feedback');
      }

      setAnswers({ ...answers, [currentQuestion.id]: currentAnswer });
      setFeedback(data.feedback);
      setShowFeedback(true);
      toast({
        title: 'Feedback Generated!',
        description: 'Review your feedback below',
      });
    } catch (error) {
      console.error('Error getting feedback:', error);
      let errorMessage = error instanceof Error ? error.message : 'Failed to get feedback. Please try again.';
      
      // Check if it's a rate limit error
      if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please wait a minute before getting feedback, or upgrade your OpenAI plan.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 6000, // Show longer for rate limit errors
      });
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const currentQuestion = questions[currentQuestionIndex];
      setAnswers({ ...answers, [currentQuestion.id]: currentAnswer });
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextQuestion = questions[currentQuestionIndex + 1];
      setCurrentAnswer(answers[nextQuestion.id] || '');
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      setAnswers({ ...answers, [currentQuestion.id]: currentAnswer });
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevQuestion = questions[currentQuestionIndex - 1];
      setCurrentAnswer(answers[prevQuestion.id] || '');
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  const goToQuestion = (index: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({ ...answers, [currentQuestion.id]: currentAnswer });
    setCurrentQuestionIndex(index);
    const targetQuestion = questions[index];
    setCurrentAnswer(answers[targetQuestion.id] || '');
    setFeedback(null);
    setShowFeedback(false);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the Interview Prep Bot</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link to="/login" className="flex-1">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link to="/signup" className="flex-1">
              <Button variant="outline" className="w-full">Sign Up</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Interview Prep Bot</h1>
          </div>
        </div>

        {/* Setup Form */}
        {questions.length === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configure Your Interview Practice</CardTitle>
              <CardDescription>
                Tell us about the position you're interviewing for to get personalized questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Job Role *</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger id="experience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(Number(v))}>
                    <SelectTrigger id="questionCount">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateQuestions}
                disabled={isLoadingQuestions || !role.trim() || !industry}
                className="w-full"
                size="lg"
              >
                {isLoadingQuestions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Interview Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Questions Interface */}
        {questions.length > 0 && (
          <>
            {/* Progress Bar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Question Card */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">
                          {currentQuestion?.question}
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{currentQuestion?.type}</Badge>
                          <Badge variant="outline">{currentQuestion?.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="answer">Your Answer</Label>
                      <Textarea
                        id="answer"
                        placeholder="Type your answer here... Be specific, use examples, and highlight your achievements."
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={submitAnswer}
                        disabled={isLoadingFeedback || !currentAnswer.trim()}
                        className="flex-1"
                      >
                        {isLoadingFeedback ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Get AI Feedback
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={previousQuestion}
                        disabled={currentQuestionIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback Card */}
                {showFeedback && feedback && (
                  <Card className="border-primary/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        AI Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Score */}
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-primary">
                          {feedback.score}/10
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(feedback.score / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Strengths */}
                      {feedback.strengths && feedback.strengths.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <h4 className="font-semibold">Strengths</h4>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                            {feedback.strengths.map((strength, idx) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {feedback.improvements && feedback.improvements.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <h4 className="font-semibold">Areas for Improvement</h4>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                            {feedback.improvements.map((improvement, idx) => (
                              <li key={idx}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sample Answer */}
                      {feedback.sampleAnswer && (
                        <div>
                          <h4 className="font-semibold mb-2">Sample Answer</h4>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {feedback.sampleAnswer}
                          </p>
                        </div>
                      )}

                      {/* Overall Feedback */}
                      {feedback.overallFeedback && (
                        <div>
                          <h4 className="font-semibold mb-2">Overall Assessment</h4>
                          <p className="text-sm text-muted-foreground">
                            {feedback.overallFeedback}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Question List Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>All Questions</CardTitle>
                    <CardDescription>Navigate between questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {questions.map((q, index) => (
                        <button
                          key={q.id}
                          onClick={() => goToQuestion(index)}
                          className={`w-full text-left p-3 rounded-md border-2 transition-all ${
                            index === currentQuestionIndex
                              ? 'border-primary bg-primary/5'
                              : answers[q.id]
                              ? 'border-green-200 bg-green-50/50'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Q{index + 1}: {q.question.substring(0, 50)}...
                            </span>
                            {answers[q.id] && (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        setQuestions([]);
                        setCurrentQuestionIndex(0);
                        setAnswers({});
                        setCurrentAnswer('');
                        setFeedback(null);
                        setShowFeedback(false);
                      }}
                    >
                      Start New Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;

