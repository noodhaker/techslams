import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchQuestions } from '@/api/questions';
import { Question } from '@/types';
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";

interface Tag {
  id: number;
  name: string;
}

const tags: Tag[] = [
  { id: 1, name: 'javascript' },
  { id: 2, name: 'react' },
  { id: 3, name: 'node.js' },
  { id: 4, name: 'html' },
  { id: 5, name: 'css' },
  { id: 6, name: 'python' },
  { id: 7, name: 'typescript' },
  { id: 8, name: 'java' },
  { id: 9, name: 'php' },
  { id: 10, name: 'sql' },
];

const Questions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { data: questions, isLoading, isError } = useQuery({
    queryKey: ['questions'],
    queryFn: () => fetchQuestions(),
  });

  const filterQuestionsByTag = (questions: Question[], selectedTag: string | null) => {
    if (!selectedTag) return questions;
    return questions.filter(question => 
      question.tags.some(tag => tag.name === selectedTag)
    );
  };

  const filteredQuestions = React.useMemo(() => {
    if (!questions) return [];

    let filtered = questions.filter(question =>
      question.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered = filterQuestionsByTag(filtered, selectedTag);

    return filtered;
  }, [questions, searchQuery, selectedTag]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching questions</div>;
  
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Questions</h1>

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
              <SelectItem value="">All Tags</SelectItem>
              {tags.map((tag) => (
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
    </div>
  );
};

export default Questions;
