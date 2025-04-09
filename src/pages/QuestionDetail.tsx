
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import QuestionCard from "@/components/question/QuestionCard";
import AnswerCard from "@/components/question/AnswerCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { questions } from "@/data/mockData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [answerContent, setAnswerContent] = useState("");
  const { toast } = useToast();
  
  // Find the question with the matching ID
  const question = questions.find(q => q.id === id);
  
  // Simulating current user - in a real app, this would come from authentication
  const currentUser = {
    id: "1" // This matches one of our mock users
  };
  
  const isQuestionAuthor = question?.authorId === currentUser.id;
  
  // Handler for marking an answer as best
  const handleMarkBestAnswer = (answerId: string) => {
    // In a real app, this would be an API call
    toast({
      title: "Answer marked as best",
      description: "This answer has been marked as the best solution to the question.",
    });
  };
  
  // Handler for submitting an answer
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answerContent.trim().length < 10) {
      toast({
        title: "Answer too short",
        description: "Your answer must be at least 10 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would be an API call
    toast({
      title: "Answer submitted",
      description: "Your answer has been posted successfully.",
    });
    
    setAnswerContent("");
  };
  
  if (!question) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-tech-warning mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Not Found</h1>
          <p className="text-gray-600 mb-6">The question you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Link to="/" className="hover:text-tech-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/questions" className="hover:text-tech-primary">Questions</Link>
            </div>
            
            <QuestionCard question={question} detailed={true} />
          </div>
          
          {/* Answers */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{question.answerCount} Answers</h2>
              <div className="ml-auto">
                <Button variant="ghost" className="text-gray-500">
                  Oldest
                </Button>
                <Button variant="ghost" className="text-tech-primary font-medium">
                  Highest Score
                </Button>
              </div>
            </div>
            
            {question.answers.length > 0 ? (
              <div className="space-y-6">
                {question.answers.map(answer => (
                  <AnswerCard 
                    key={answer.id} 
                    answer={answer} 
                    isQuestionAuthor={isQuestionAuthor}
                    onMarkAsBest={handleMarkBestAnswer}
                  />
                ))}
              </div>
            ) : (
              <Alert className="mb-6">
                <MessageSquare className="h-4 w-4" />
                <AlertTitle>No answers yet</AlertTitle>
                <AlertDescription>
                  Be the first to answer this question and help a fellow developer!
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Submit Answer */}
          <div>
            <Separator className="mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h3>
            
            <form onSubmit={handleSubmitAnswer}>
              <Textarea 
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Type your answer here... You can use markdown for code blocks."
                className="min-h-[200px] mb-4"
              />
              
              <Button type="submit" className="bg-tech-primary hover:bg-tech-secondary">
                Post Your Answer
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionDetail;
