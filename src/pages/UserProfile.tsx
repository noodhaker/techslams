
import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { users, questions } from "@/data/mockData";
import { Calendar, Award, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";
import QuestionCard from "@/components/question/QuestionCard";
import { format } from "date-fns";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  
  // Find the user with the matching username
  const user = users.find(u => u.username === username);
  
  // Find questions and answers by this user
  const userQuestions = questions.filter(q => q.authorId === user?.id);
  
  // Count answers provided by this user
  const userAnswersCount = questions.reduce(
    (count, question) => count + question.answers.filter(a => a.authorId === user?.id).length,
    0
  );
  
  // Count best answers provided by this user
  const bestAnswersCount = questions.reduce(
    (count, question) => 
      count + question.answers.filter(a => a.authorId === user?.id && a.isBestAnswer).length,
    0
  );
  
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
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img 
                src={user.avatar || "https://i.pravatar.cc/150?img=1"} 
                alt={user.name} 
                className="w-32 h-32 rounded-full"
              />
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                <p className="text-gray-500 mb-4">@{user.username}</p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Joined {format(new Date(user.joinDate), 'MMMM yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-tech-primary mr-2" />
                    <span className="text-gray-600">{user.reputation} reputation</span>
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
                    {user.role}
                  </Badge>
                  {user.reputation > 1000 && (
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
              {userAnswersCount > 0 ? (
                questions
                  .filter(q => q.answers.some(a => a.authorId === user.id))
                  .map(question => (
                    <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <Link to={`/questions/${question.id}`} className="text-xl font-semibold text-gray-900 hover:text-tech-primary mb-2 block">
                        {question.title}
                      </Link>
                      
                      {question.answers
                        .filter(a => a.authorId === user.id)
                        .map(answer => (
                          <div key={answer.id} className="mt-4 pl-4 border-l-4 border-tech-light">
                            <div className="prose max-w-none mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: answer.content }} />
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-gray-500">
                                <span>Votes: {answer.votes}</span>
                                {answer.isBestAnswer && (
                                  <span className="ml-3 flex items-center text-tech-success">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Best Answer
                                  </span>
                                )}
                              </div>
                              <Link to={`/questions/${question.id}`} className="text-tech-primary hover:text-tech-secondary">
                                View answer
                              </Link>
                            </div>
                          </div>
                        ))}
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
