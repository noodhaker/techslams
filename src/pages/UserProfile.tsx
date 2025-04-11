
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Award, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";
import QuestionCard from "@/components/question/QuestionCard";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileDB } from "@/types";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ProfileDB | null>(null);
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [userAnswersCount, setUserAnswersCount] = useState(0);
  const [bestAnswersCount, setBestAnswersCount] = useState(0);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Query for the user's profile based on username
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single() as { data: ProfileDB | null, error: any };
          
        if (userError || !userData) {
          console.error("Error fetching user:", userError);
          return;
        }
        
        setUser(userData);
        
        // Fetch questions by this user
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            tags:question_tags(
              tag:tags(*)
            )
          `)
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });
          
        if (questionsError) {
          console.error("Error fetching questions:", questionsError);
          return;
        }
        
        // Format questions data to match expected structure
        const formattedQuestions = questionsData.map(q => ({
          ...q,
          tags: q.tags.map((t: any) => t.tag),
          author: userData,
          createdAt: q.created_at
        }));
        
        setUserQuestions(formattedQuestions);
        
        // Count answers provided by this user
        const { count: answersCount, error: answersCountError } = await supabase
          .from('answers')
          .select('*', { count: 'exact' })
          .eq('user_id', userData.id);
          
        if (answersCountError) {
          console.error("Error counting answers:", answersCountError);
          return;
        }
        
        setUserAnswersCount(answersCount || 0);
        
        // Count best answers provided by this user
        const { count: bestCount, error: bestCountError } = await supabase
          .from('answers')
          .select('*', { count: 'exact' })
          .eq('user_id', userData.id)
          .eq('is_best_answer', true);
          
        if (bestCountError) {
          console.error("Error counting best answers:", bestCountError);
          return;
        }
        
        setBestAnswersCount(bestCount || 0);
        
        // Fetch answers with their questions
        const { data: answersData, error: answersError } = await supabase
          .from('answers')
          .select(`
            *,
            question:questions(*)
          `)
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });
          
        if (answersError) {
          console.error("Error fetching answers:", answersError);
          return;
        }
        
        setUserAnswers(answersData);
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchUserData();
    }
  }, [username, toast]);
  
  if (loading) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-tech-warning mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  const joinDate = new Date(user.created_at || new Date());
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img 
                src={user.avatar_url || "https://i.pravatar.cc/150?img=1"} 
                alt={user.full_name || 'User'} 
                className="w-32 h-32 rounded-full"
              />
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.full_name || 'Anonymous'}</h1>
                <p className="text-gray-500 mb-4">@{user.username || 'user'}</p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Joined {format(joinDate, 'MMMM yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-tech-primary mr-2" />
                    <span className="text-gray-600">{user.reputation || 0} reputation</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{userAnswersCount} answers</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-tech-success mr-2" />
                    <span className="text-gray-600">{bestAnswersCount} best answers</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant="outline" className="bg-tech-light text-tech-primary">
                    {user.role || "Member"}
                  </Badge>
                  {(user.reputation || 0) > 1000 && (
                    <Badge variant="outline" className="bg-tech-light text-tech-success">
                      Expert
                    </Badge>
                  )}
                  {bestAnswersCount > 0 && (
                    <Badge variant="outline" className="bg-tech-light text-tech-accent">
                      Helpful
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* User Activity */}
          <Tabs defaultValue="questions" className="mb-6">
            <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-2 sm:grid-cols-2">
              <TabsTrigger value="questions">Questions ({userQuestions.length})</TabsTrigger>
              <TabsTrigger value="answers">Answers ({userAnswersCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questions" className="space-y-4 mt-4">
              {userQuestions.length > 0 ? (
                userQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">This user hasn't asked any questions yet.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="answers" className="space-y-4 mt-4">
              {userAnswers.length > 0 ? (
                userAnswers.map(answer => (
                  <div key={answer.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <Link to={`/questions/${answer.question.id}`} className="text-xl font-semibold text-gray-900 hover:text-tech-primary mb-2 block">
                      {answer.question.title}
                    </Link>
                    
                    <div className="mt-4 pl-4 border-l-4 border-tech-light">
                      <div className="prose max-w-none mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: answer.content }} />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <span>Votes: {answer.votes}</span>
                          {answer.is_best_answer && (
                            <span className="ml-3 flex items-center text-tech-success">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Best Answer
                            </span>
                          )}
                        </div>
                        <Link to={`/questions/${answer.question.id}`} className="text-tech-primary hover:text-tech-secondary">
                          View answer
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">This user hasn't answered any questions yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
