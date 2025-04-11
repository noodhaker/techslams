
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Answer } from "@/types";
import { ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { voteOnAnswer, getUserAnswerVote } from "@/api/votes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface AnswerCardProps {
  answer: Answer;
  isQuestionAuthor?: boolean;
  onMarkAsBest?: (answerId: string) => void;
}

const AnswerCard = ({ answer, isQuestionAuthor = false, onMarkAsBest }: AnswerCardProps) => {
  const [votes, setVotes] = useState(answer.votes);
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const formattedDate = formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true });

  // Fetch the user's existing vote when component mounts
  useEffect(() => {
    const fetchUserVote = async () => {
      if (user) {
        const vote = await getUserAnswerVote(answer.id);
        setUserVote(vote);
      }
    };
    
    fetchUserVote();
  }, [answer.id, user]);

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
      const success = await voteOnAnswer(answer.id, voteType);
      
      if (success) {
        // If clicking the same vote button, toggle off
        if (userVote === voteType) {
          setVotes(prev => prev - voteType);
          setUserVote(0);
        } 
        // If changing vote
        else if (userVote !== 0) {
          setVotes(prev => prev - userVote + voteType);
          setUserVote(voteType);
        } 
        // If new vote
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
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${answer.isBestAnswer ? 'border-tech-success bg-green-50' : 'border-gray-200'}`}>
      <div className="flex">
        {/* Voting */}
        <div className="flex flex-col items-center mr-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${userVote === 1 ? 'text-tech-primary' : 'text-gray-400'} hover:text-tech-primary`}
            onClick={() => handleVote(1)}
            disabled={isVoting}
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
          <span className="text-xl font-semibold my-1">{votes}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${userVote === -1 ? 'text-tech-primary' : 'text-gray-400'} hover:text-tech-primary`}
            onClick={() => handleVote(-1)}
            disabled={isVoting}
          >
            <ArrowDown className="h-6 w-6" />
          </Button>
          
          {answer.isBestAnswer && (
            <div className="mt-4 text-tech-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: answer.content }} />
          
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center text-sm text-gray-500">
              <span>Answered {formattedDate} by</span>
              <Link to={`/users/${answer.author.username}`} className="flex items-center ml-2 hover:text-tech-primary">
                <img 
                  src={answer.author.avatar || "https://i.pravatar.cc/150?img=1"} 
                  alt={answer.author.name} 
                  className="w-6 h-6 rounded-full mr-2" 
                />
                <span className="font-medium">{answer.author.name}</span>
              </Link>
              <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded-md">
                Reputation: {answer.author.reputation}
              </span>
            </div>
            
            {isQuestionAuthor && !answer.isBestAnswer && (
              <Button 
                variant="outline" 
                className="text-tech-success border-tech-success hover:bg-tech-success hover:text-white"
                onClick={() => onMarkAsBest && onMarkAsBest(answer.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Best Answer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
