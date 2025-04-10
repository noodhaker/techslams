
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import QuestionCard from "@/components/question/QuestionCard";
import AnswerCard from "@/components/question/AnswerCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  MessageSquare, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  ThumbsUp, 
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchQuestionById, addAnswer, markBestAnswer, deleteQuestion } from "@/api/questions";
import { useAuth } from "@/context/AuthContext";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<any>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Load question data
  useEffect(() => {
    const loadQuestionData = async () => {
      if (!id) return;
      setIsLoading(true);
      
      try {
        const questionData = await fetchQuestionById(id);
        if (questionData) {
          setQuestion(questionData);
        }
      } catch (error) {
        console.error("Error loading question:", error);
        toast({
          title: "Error",
          description: "Failed to load question details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestionData();
  }, [id, toast]);
  
  // Check if the current user is the author
  const isQuestionAuthor = user && question?.authorId === user.id;
  
  // Handler for submitting an answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to answer questions.",
        variant: "destructive",
      });
      return;
    }
    
    if (answerContent.trim().length < 10) {
      toast({
        title: "Answer too short",
        description: "Your answer must be at least 10 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!id) return;
      
      const result = await addAnswer(id, answerContent);
      
      if (result) {
        toast({
          title: "Answer submitted",
          description: "Your answer has been posted successfully.",
        });
        
        // Update the question with the new answer
        setQuestion((prev: any) => ({
          ...prev,
          answers: [...prev.answers, result],
          answerCount: prev.answerCount + 1
        }));
        
        setAnswerContent("");
      } else {
        toast({
          title: "Error",
          description: "Failed to submit your answer. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for marking an answer as best
  const handleMarkBestAnswer = async (answerId: string) => {
    if (!id) return;
    
    try {
      const result = await markBestAnswer(id, answerId);
      
      if (result) {
        // Update local state
        setQuestion((prev: any) => {
          const updatedAnswers = prev.answers.map((answer: any) => ({
            ...answer,
            isBestAnswer: answer.id === answerId
          }));
          
          return {
            ...prev,
            hasBestAnswer: true,
            answers: updatedAnswers
          };
        });
        
        toast({
          title: "Answer marked as best",
          description: "This answer has been marked as the best solution to the question.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to mark the answer as best. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking best answer:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handler for deleting a question
  const handleDeleteQuestion = async () => {
    if (!id) return;
    
    try {
      const result = await deleteQuestion(id);
      
      if (result) {
        toast({
          title: "Question deleted",
          description: "Your question has been successfully deleted.",
        });
        
        // Redirect to questions page
        navigate("/questions");
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the question. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p>Loading question details...</p>
        </div>
      </Layout>
    );
  }
  
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
          {/* Navigation */}
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-tech-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/questions" className="hover:text-tech-primary">Questions</Link>
          </div>
          
          {/* Question with action buttons for author */}
          <div className="mb-6">
            <QuestionCard question={question} detailed={true} />
            
            {isQuestionAuthor && (
              <div className="flex space-x-2 mt-4 justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Question</DialogTitle>
                      <DialogDescription>
                        Make changes to your question here.
                      </DialogDescription>
                    </DialogHeader>
                    {/* Edit form would go here - simplified for now */}
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Please use the edit question page to update your question details.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => navigate(`/questions/${id}/edit`)}>
                        Go to Edit Page
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex items-center gap-1">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your question
                        and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteQuestion}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          
          {/* Answers */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {question.answerCount} {question.answerCount === 1 ? 'Answer' : 'Answers'}
              </h2>
              <div className="ml-auto">
                <Button variant="ghost" className="text-gray-500">
                  Oldest
                </Button>
                <Button variant="ghost" className="text-tech-primary font-medium">
                  Highest Score
                </Button>
              </div>
            </div>
            
            {question.answers && question.answers.length > 0 ? (
              <div className="space-y-6">
                {question.answers.map((answer: any) => (
                  <div key={answer.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex">
                      {/* Voting column */}
                      <div className="flex flex-col items-center mr-4 space-y-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                          <ChevronUp className="h-5 w-5" />
                        </Button>
                        <span className="text-lg font-medium">{answer.votes}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                          <ChevronDown className="h-5 w-5" />
                        </Button>
                        
                        {isQuestionAuthor && !answer.isBestAnswer && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2 text-xs"
                            onClick={() => handleMarkBestAnswer(answer.id)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Mark as Best
                          </Button>
                        )}
                        
                        {answer.isBestAnswer && (
                          <div className="flex flex-col items-center mt-2">
                            <div className="text-tech-success flex items-center">
                              <ThumbsUp className="h-5 w-5" />
                            </div>
                            <span className="text-xs text-tech-success font-medium mt-1">Best Answer</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content column */}
                      <div className="flex-1">
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: answer.content }} />
                        
                        <div className="flex justify-end items-center mt-4 text-sm text-gray-500">
                          <div>
                            Answered by {answer.author.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
              
              <Button 
                type="submit" 
                className="bg-tech-primary hover:bg-tech-secondary"
                disabled={isSubmitting || !user}
              >
                {isSubmitting ? 'Posting...' : 'Post Your Answer'}
              </Button>
              
              {!user && (
                <p className="mt-2 text-sm text-gray-500">
                  You need to <Link to="/login" className="text-tech-primary hover:underline">log in</Link> to post an answer.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionDetail;
