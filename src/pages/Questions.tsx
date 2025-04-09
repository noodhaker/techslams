
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, PlusCircle } from "lucide-react";
import QuestionCard from "@/components/question/QuestionCard";
import { questions } from "@/data/mockData";
import { Link } from "react-router-dom";

const Questions = () => {
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get("tag");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Filter questions based on search term and tag filter
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchTerm === "" || 
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !tagFilter || question.tags.some(tag => tag === tagFilter);
    
    return matchesSearch && matchesTag;
  });
  
  // Sort questions based on sort selection
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "votes":
        return b.votes - a.votes;
      case "answers":
        return b.answers.length - a.answers.length;
      case "views":
        return b.views - a.views;
      default:
        return 0;
    }
  });
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
                {tagFilter ? `Questions tagged [${tagFilter}]` : "All Questions"}
              </h1>
              <Link to="/ask">
                <Button className="bg-tech-primary hover:bg-tech-secondary">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </Link>
            </div>
            
            {tagFilter && (
              <div className="mb-4">
                <Badge variant="outline" className="bg-tech-light text-tech-primary">
                  {tagFilter}
                </Badge>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search questions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="votes">Most Votes</SelectItem>
                    <SelectItem value="answers">Most Answers</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              {sortedQuestions.length} {sortedQuestions.length === 1 ? 'question' : 'questions'}
            </div>
          </div>
          
          <div className="space-y-6">
            {sortedQuestions.length > 0 ? (
              sortedQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No questions found</p>
                <p className="text-sm text-gray-400 mb-6">
                  {searchTerm || tagFilter ? "Try different search criteria" : "Be the first to ask a question!"}
                </p>
                <Link to="/ask">
                  <Button>Ask a Question</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Questions;
