import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast"
import Layout from "@/components/layout/Layout";
import { saveQuestion } from '@/api/questions';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || tags.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all fields and add at least one tag.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare tags in the correct format
      const formattedTags = tags.map(tagName => ({
        id: '',  // This will be assigned by Supabase
        name: tagName,
        count: 0
      }));
      
      // Create a new question object that matches our Question type (with authorId)
      const newQuestion = {
        title,
        content,
        votes: 0,
        answerCount: 0,
        views: 0,
        hasBestAnswer: false,
        createdAt: new Date().toISOString(),
        authorId: user?.id || '',  // Add the authorId field
        author: {
          id: user?.id || '',
          name: user?.user_metadata?.username || 'Anonymous',
          username: user?.user_metadata?.username || 'anonymous',
          reputation: 1,
          avatar: null,
          role: 'user',  // Use 'user' instead of 'User'
          joinDate: new Date().toISOString()
        },
        tags: formattedTags,
        answers: []
      };
      
      // Save the question to Supabase
      const savedQuestion = await saveQuestion(newQuestion);
      
      if (savedQuestion) {
        toast({
          title: "Success",
          description: "Your question has been posted."
        });
        
        // Redirect to the question page
        navigate(`/questions/${savedQuestion.id}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to save your question. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error posting question:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">Ask a Question</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </Label>
            <div className="mt-1">
              <Input
                type="text"
                id="title"
                placeholder="Enter your question title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shadow-sm focus:ring-tech-primary focus:border-tech-primary block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </Label>
            <div className="mt-1">
              <Textarea
                id="content"
                rows={5}
                placeholder="Explain your question in detail"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="shadow-sm focus:ring-tech-primary focus:border-tech-primary block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700">
              Tags
            </Label>
            <div className="mt-1 flex items-center">
              <Input
                type="text"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="shadow-sm focus:ring-tech-primary focus:border-tech-primary block w-full sm:text-sm border-gray-300 rounded-md mr-2"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>
            <div className="mt-2">
              {tags.map((tag) => (
                <Badge key={tag} className="mr-2">
                  {tag}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <Button type="submit" className="bg-tech-primary hover:bg-tech-secondary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Post Question'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AskQuestion;
