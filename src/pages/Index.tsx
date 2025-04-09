
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import QuestionCard from "@/components/question/QuestionCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { questions } from "@/data/mockData";
import { PlusCircle } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("latest");

  // In a real app, we would filter and sort based on the active tab
  const displayedQuestions = [...questions].sort((a, b) => {
    if (activeTab === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (activeTab === "popular") {
      return b.views - a.views;
    } else if (activeTab === "unanswered") {
      return a.answerCount - b.answerCount;
    }
    return 0;
  });

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
              </TabsContent>
              
              <TabsContent value="popular" className="space-y-4 mt-4">
                {displayedQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </TabsContent>
              
              <TabsContent value="unanswered" className="space-y-4 mt-4">
                {displayedQuestions
                  .filter((q) => q.answerCount === 0)
                  .map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            {/* Popular Tags */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
              <div className="flex flex-wrap gap-2">
                {[...questions]
                  .flatMap((q) => q.tags)
                  .filter((tag, index, self) => 
                    index === self.findIndex((t) => t.id === tag.id)
                  )
                  .slice(0, 10)
                  .map((tag) => (
                    <Link to={`/tags/${tag.name}`} key={tag.id}>
                      <span className="inline-block bg-tech-light text-tech-primary px-3 py-1 rounded-full text-sm">
                        {tag.name} <span className="text-gray-500">× {tag.count}</span>
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
            
            {/* Top Users */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Top Users</h2>
              <ul className="space-y-3">
                {[...questions]
                  .map((q) => q.author)
                  .filter((author, index, self) => 
                    index === self.findIndex((a) => a.id === author.id)
                  )
                  .sort((a, b) => b.reputation - a.reputation)
                  .slice(0, 5)
                  .map((user) => (
                    <li key={user.id} className="flex items-center">
                      <Link to={`/users/${user.username}`} className="flex items-center hover:text-tech-primary">
                        <img 
                          src={user.avatar || "https://i.pravatar.cc/150?img=1"} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full mr-3" 
                        />
                        <div>
                          <span className="font-medium">{user.name}</span>
                          <div className="text-xs text-gray-500">
                            {user.reputation} reputation
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
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
                  <div className="text-3xl font-bold text-tech-primary">4</div>
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
