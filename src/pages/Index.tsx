
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import QuestionCard from "@/components/question/QuestionCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchQuestions } from "@/api/questions";
import { supabase } from "@/integrations/supabase/client";
import { ProfileDB } from "@/types";

const Index = () => {
  const [activeTab, setActiveTab] = useState("latest");
  const [topUsers, setTopUsers] = useState<ProfileDB[]>([]);
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: fetchQuestions
  });

  // Fetch top users from profiles table
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        // Using the correct type-safe approach to query the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('reputation', { ascending: false })
          .limit(5) as { data: ProfileDB[] | null, error: any };
          
        if (error) {
          console.error("Error fetching top users:", error);
          return;
        }
        
        setTopUsers(data || []);
      } catch (error) {
        console.error("Error in fetchTopUsers:", error);
      }
    };
    
    fetchTopUsers();
  }, []);

  // Filter and sort based on the active tab
  const displayedQuestions = React.useMemo(() => {
    if (!questions.length) return [];
    
    return [...questions].sort((a, b) => {
      if (activeTab === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (activeTab === "popular") {
        return b.views - a.views;
      } else if (activeTab === "unanswered") {
        return a.answerCount - b.answerCount;
      }
      return 0;
    });
  }, [questions, activeTab]);

  // Extract unique tags from all questions
  const allTags = React.useMemo(() => {
    if (!questions.length) return [];
    
    const tagMap = new Map();
    
    questions.forEach(q => {
      q.tags.forEach(tag => {
        if (!tagMap.has(tag.name)) {
          tagMap.set(tag.name, { ...tag });
        } else {
          const existingTag = tagMap.get(tag.name);
          existingTag.count = (existingTag.count || 0) + 1;
          tagMap.set(tag.name, existingTag);
        }
      });
    });
    
    return Array.from(tagMap.values());
  }, [questions]);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="text-center">Loading questions...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Technical Questions & Answers</h1>
              <Link to="/ask">
                <Button className="bg-tech-primary hover:bg-tech-secondary">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </Link>
            </div>
            
            <Tabs defaultValue="latest" className="mb-6">
              <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-3 sm:grid-cols-3">
                <TabsTrigger value="latest" onClick={() => setActiveTab("latest")}>Latest</TabsTrigger>
                <TabsTrigger value="popular" onClick={() => setActiveTab("popular")}>Popular</TabsTrigger>
                <TabsTrigger value="unanswered" onClick={() => setActiveTab("unanswered")}>Unanswered</TabsTrigger>
              </TabsList>
              
              <TabsContent value="latest" className="space-y-4 mt-4">
                {displayedQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
                {displayedQuestions.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">No questions yet. Be the first to ask!</p>
                    <Link to="/ask">
                      <Button className="bg-tech-primary hover:bg-tech-secondary">
                        Ask Question
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="popular" className="space-y-4 mt-4">
                {displayedQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
                {displayedQuestions.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No questions yet</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="unanswered" className="space-y-4 mt-4">
                {displayedQuestions
                  .filter((q) => q.answerCount === 0)
                  .map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                {displayedQuestions.filter((q) => q.answerCount === 0).length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No unanswered questions</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            {/* Popular Tags */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 10).map((tag) => (
                  <Link to={`/tags/${tag.name}`} key={tag.id}>
                    <span className="inline-block bg-tech-light text-tech-primary px-3 py-1 rounded-full text-sm">
                      {tag.name} <span className="text-gray-500">× {tag.count}</span>
                    </span>
                  </Link>
                ))}
                {allTags.length === 0 && (
                  <p className="text-gray-500 text-sm">No tags yet</p>
                )}
              </div>
            </div>
            
            {/* Top Users */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Top Users</h2>
              <ul className="space-y-3">
                {topUsers.map((user) => (
                  <li key={user.id} className="flex items-center">
                    <Link to={`/users/${user.username}`} className="flex items-center hover:text-tech-primary">
                      <img 
                        src={user.avatar_url || "https://i.pravatar.cc/150?img=1"} 
                        alt={user.full_name || 'User'} 
                        className="w-8 h-8 rounded-full mr-3" 
                      />
                      <div>
                        <span className="font-medium">{user.full_name || user.username || 'Anonymous User'}</span>
                        <div className="text-xs text-gray-500">
                          {user.reputation || 0} reputation
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
                {topUsers.length === 0 && (
                  <p className="text-gray-500 text-sm">No users yet</p>
                )}
              </ul>
            </div>
            
            {/* Community Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Community Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-tech-primary">{questions.length}</div>
                  <div className="text-sm text-gray-500">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-tech-primary">
                    {questions.reduce((acc, q) => acc + q.answerCount, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-tech-primary">
                    {questions.filter(q => q.hasBestAnswer).length}
                  </div>
                  <div className="text-sm text-gray-500">Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-tech-primary">
                    {topUsers.length}
                  </div>
                  <div className="text-sm text-gray-500">Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
