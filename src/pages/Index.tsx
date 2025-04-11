
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import QuestionCard from "@/components/question/QuestionCard";
import { fetchQuestions } from "@/api/questions";
import { fetchTopProfiles } from "@/api/profiles";
import { Question, ProfileDB } from "@/types";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topUsers, setTopUsers] = useState<ProfileDB[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch questions
        const questionsData = await fetchQuestions();
        setQuestions(questionsData);
        
        // Fetch top users
        const topUsersData = await fetchTopProfiles(5);
        setTopUsers(topUsersData);
      } catch (error) {
        console.error("Error loading home page data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter questions for each category
  const recentQuestions = [...questions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10);
  
  const popularQuestions = [...questions].sort((a, b) => 
    b.votes - a.votes || b.views - a.views
  ).slice(0, 10);
  
  const unansweredQuestions = questions
    .filter(q => q.answerCount === 0 && !q.hasBestAnswer)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section for non-logged in users */}
          {!user && (
            <div className="bg-gradient-to-r from-tech-primary to-tech-secondary rounded-lg overflow-hidden shadow-lg mb-8">
              <div className="px-6 py-12 sm:px-12">
                <h1 className="text-3xl font-bold text-white mb-4">
                  Welcome to DevHelpDeck
                </h1>
                <p className="text-white/90 text-lg mb-6 max-w-2xl">
                  A community-driven platform where developers help each other solve coding problems, share knowledge, and grow together.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <Button className="bg-white text-tech-primary hover:bg-gray-100">
                      Join the community
                    </Button>
                  </Link>
                  <Link to="/questions">
                    <Button variant="outline" className="text-white border-white hover:bg-white/10">
                      Browse questions
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main content */}
            <div className="md:w-3/4">
              <Tabs defaultValue="recent" className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="popular">Popular</TabsTrigger>
                    <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                  </TabsList>
                  
                  <Link to="/ask">
                    <Button>Ask Question</Button>
                  </Link>
                </div>
                
                {loading ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Loading questions...</p>
                  </div>
                ) : (
                  <>
                    <TabsContent value="recent" className="space-y-4">
                      {recentQuestions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                      
                      {recentQuestions.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No questions to show. Be the first to ask a question!</p>
                          <Link to="/ask" className="mt-4 inline-block">
                            <Button>Ask a Question</Button>
                          </Link>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="popular" className="space-y-4">
                      {popularQuestions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                      
                      {popularQuestions.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No popular questions yet. Ask one to get started!</p>
                          <Link to="/ask" className="mt-4 inline-block">
                            <Button>Ask a Question</Button>
                          </Link>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="unanswered" className="space-y-4">
                      {unansweredQuestions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                      
                      {unansweredQuestions.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No unanswered questions! The community is on top of things.</p>
                          <Link to="/ask" className="mt-4 inline-block">
                            <Button>Ask a Question</Button>
                          </Link>
                        </div>
                      )}
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h2>
                
                {loading ? (
                  <p className="text-gray-500 text-sm">Loading users...</p>
                ) : (
                  <div className="space-y-4">
                    {topUsers.map((user) => (
                      <Link key={user.id} to={`/users/${user.username}`} className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback className="bg-tech-light text-tech-primary">
                            {user.full_name?.substring(0, 2) || user.username?.substring(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.full_name || user.username || "Anonymous"}</p>
                          <p className="text-xs text-gray-500">
                            {user.reputation || 0} rep • {user.best_answer_count || 0} best answers
                          </p>
                        </div>
                      </Link>
                    ))}
                    
                    {topUsers.length === 0 && (
                      <p className="text-gray-500 text-sm">No users to display yet.</p>
                    )}
                  </div>
                )}
                
                <div className="mt-6">
                  <Link to="/users">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Users
                    </Button>
                  </Link>
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
