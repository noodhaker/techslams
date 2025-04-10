
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchQuestions } from '@/api/questions';
import { Question } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

interface Tag {
  id: number;
  name: string;
}

const Questions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Fetch questions data
  const { data: questions, isLoading, isError } = useQuery({
    queryKey: ['questions'],
    queryFn: () => fetchQuestions(),
  });

  // Create a consistent filter function that doesn't depend on conditionals
  const filterQuestionsByTag = (questions: Question[], tagFilter: string | null) => {
    if (!tagFilter || tagFilter === 'all-tags') return questions;
    return questions.filter(question => 
      question.tags.some(tag => tag.name === tagFilter)
    );
  };

  // Extract all unique tags from questions - always run this regardless of conditional logic
  const allTags: Tag[] = React.useMemo(() => {
    if (!questions) return [];
    
    const tagMap = new Map<string, Tag>();
    
    questions.forEach(question => {
      question.tags.forEach(tag => {
        if (!tagMap.has(tag.name)) {
          tagMap.set(tag.name, {
            id: parseInt(tag.id.toString()) || Math.random(),
            name: tag.name
          });
        }
      });
    });
    
    return Array.from(tagMap.values());
  }, [questions]);

  // Apply all filters consistently
  const filteredQuestions = React.useMemo(() => {
    if (!questions) return [];

    // Start with all questions
    let filtered = [...questions];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tag filter
    filtered = filterQuestionsByTag(filtered, selectedTag);

    // Apply user filter - only if user is defined
    if (user) {
      filtered = filtered.filter(question => question.author.id === user.id);
    }

    return filtered;
  }, [questions, searchQuery, selectedTag, user]);

  if (isLoading) return <Layout><div className="container mx-auto mt-8">Loading...</div></Layout>;
  if (isError) return <Layout><div className="container mx-auto mt-8">Error fetching questions</div></Layout>;
  
  return (
    <Layout>
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">My Questions</h1>

        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <Input
            type="text"
            placeholder="Search questions..."
            className="w-full md:w-1/3 mb-2 md:mb-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              <ScrollArea>
                <SelectItem value="all-tags">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          <Link to="/ask">
            <Button className="bg-tech-primary hover:bg-tech-secondary">
              Ask Question
            </Button>
          </Link>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">You haven't asked any questions yet.</p>
            <Link to="/ask">
              <Button className="bg-tech-primary hover:bg-tech-secondary">
                Ask Your First Question
              </Button>
            </Link>
          </div>
        ) : (
          <ul>
            {filteredQuestions.map(question => (
              <li key={question.id} className="mb-4 p-4 border rounded-md shadow-sm">
                <Link to={`/questions/${question.id}`} className="text-xl font-semibold hover:text-tech-primary">
                  {question.title}
                </Link>
                <p className="text-gray-600 mt-1">{question.content.substring(0, 100)}...</p>
                <div className="mt-2">
                  {question.tags.map(tag => (
                    <Badge key={tag.id} className="mr-2">{tag.name}</Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Questions;
