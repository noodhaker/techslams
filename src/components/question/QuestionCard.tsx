
import React from "react";
import { Link } from "react-router-dom";
import { Question } from "@/data/mockData";
import { MessageSquare, Eye, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface QuestionCardProps {
  question: Question;
  detailed?: boolean;
}

const QuestionCard = ({ question, detailed = false }: QuestionCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(question.createdAt), { addSuffix: true });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-tech-primary transition-colors">
      <div className="flex flex-col md:flex-row">
        {/* Stats column */}
        <div className="flex md:flex-col md:w-24 space-x-4 md:space-x-0 md:space-y-2 md:mr-4 mb-4 md:mb-0 items-center md:items-start">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <ArrowUp className="h-5 w-5 text-gray-400 hover:text-tech-primary cursor-pointer" />
              <span className="text-lg font-medium text-gray-700">{question.votes}</span>
              <ArrowDown className="h-5 w-5 text-gray-400 hover:text-tech-primary cursor-pointer" />
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
        
        {/* Content column */}
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
