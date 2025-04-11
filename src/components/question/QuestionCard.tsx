import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Question } from "@/types";
import { MessageSquare, Eye, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { voteOnQuestion, getUserQuestionVote } from "@/api/votes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface QuestionCardProps {
  question: Question;
  detailed?: boolean;
}

const QuestionCard = ({ question, detailed = false }: QuestionCardProps) => {
  const [votes, setVotes] = useState(question.votes);
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const formattedDate = formatDistanceToNow(new Date(question.createdAt), { addSuffix: true });

  useEffect(() => {
    const fetchUserVote = async () => {
      if (user) {
        const vote = await getUserQuestionVote(question.id);
        setUserVote(vote);
      }
    };
    
    fetchUserVote();
  }, [question.id, user]);

  const handleVote = async (voteType: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }
    
    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      const success = await voteOnQuestion(question.id, voteType);
      
      if (success) {
        if (userVote === voteType) {
          setVotes(prev => prev - voteType);
          setUserVote(0);
        } 
        else if (userVote !== 0) {
          setVotes(prev => prev - userVote + voteType);
          setUserVote(voteType);
        } 
        else {
          setVotes(prev => prev + voteType);
          setUserVote(voteType);
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-tech-primary transition-colors">
      <div className="flex flex-col md:flex-row">
        <div className="flex md:flex-col md:w-24 space-x-4 md:space-x-0 md:space-y-2 md:mr-4 mb-4 md:mb-0 items-center md:items-start">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${userVote === 1 ? 'text-tech-primary' : 'text-gray-400'} hover:text-tech-primary h-5 w-5 p-0`}
                onClick={() => handleVote(1)}
                disabled={isVoting}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
              <span className="text-lg font-medium text-gray-700">{votes}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${userVote === -1 ? 'text-tech-primary' : 'text-gray-400'} hover:text-tech-primary h-5 w-5 p-0`}
                onClick={() => handleVote(-1)}
                disabled={isVoting}
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>
            <span className="text-xs text-gray-500">votes</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`flex items-center space-x-1 ${question.hasBestAnswer ? 'text-tech-success' : 'text-gray-500'}`}>
              <MessageSquare className="h-5 w-5" />
              <span className="text-lg font-medium">{question.answerCount}</span>
            </div>
            <span className="text-xs text-gray-500">answers</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <Eye className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-medium text-gray-700">{question.views}</span>
            </div>
            <span className="text-xs text-gray-500">views</span>
          </div>
        </div>
        
        <div className="flex-1">
          <Link to={`/questions/${question.id}`}>
            <h2 className="text-xl font-semibold text-gray-900 hover:text-tech-primary mb-2">
              {question.title}
            </h2>
          </Link>
          
          {detailed && (
            <div className="mb-4 text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: question.content }} />
          )}
          
          {!detailed && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {question.content.replace(/```[\s\S]*?```/g, '').replace(/<[^>]*>/g, '')}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map(tag => (
              <Link to={`/tags/${tag.name}`} key={tag.id}>
                <Badge variant="outline" className="bg-tech-light text-tech-primary hover:bg-tech-primary hover:text-white">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Link to={`/users/${question.author.username}`} className="flex items-center hover:text-tech-primary">
                <img 
                  src={question.author.avatar || "https://i.pravatar.cc/150?img=1"} 
                  alt={question.author.name} 
                  className="w-6 h-6 rounded-full mr-2" 
                />
                <span>{question.author.name}</span>
              </Link>
              <span className="text-gray-400">&bull;</span>
              <span>{formattedDate}</span>
            </div>
            
            {question.hasBestAnswer && (
              <div className="flex items-center text-tech-success">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Solved</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
