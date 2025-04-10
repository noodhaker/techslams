
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { fetchQuestionById, updateQuestion } from '@/api/questions';

const EditQuestion = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Load question data
  useEffect(() => {
    const loadQuestionData = async () => {
      if (!id) return;
      setIsLoading(true);
      
      try {
        const questionData = await fetchQuestionById(id);
        if (questionData) {
          // Check if the user is the author
          if (user && questionData.authorId !== user.id) {
            toast({
              title: "Unauthorized",
              description: "You can only edit your own questions",
              variant: "destructive",
            });
            navigate(`/questions/${id}`);
            return;
          }
          
          setTitle(questionData.title);
          setContent(questionData.content);
          setTags(questionData.tags.map(tag => tag.name));
        } else {
          toast({
            title: "Not Found",
            description: "The question you're trying to edit doesn't exist",
            variant: "destructive",
          });
          navigate('/questions');
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
  }, [id, navigate, toast, user]);

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
    
    if (!id) return;
    
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
        id: '',  // This will be assigned or matched in the backend
        name: tagName,
        count: 0
      }));
      
      // Update the question
      const updatedQuestion = await updateQuestion(id, {
        title,
        content,
        tags: formattedTags
      });
      
      if (updatedQuestion) {
        toast({
          title: "Success",
          description: "Your question has been updated."
        });
        
        // Redirect to the question page
        navigate(`/questions/${id}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to update your question. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto mt-8">
          <p>Loading question details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">Edit Question</h1>
        
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
          
          <div className="flex space-x-2">
            <Button type="submit" className="bg-tech-primary hover:bg-tech-secondary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Question'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/questions/${id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditQuestion;
