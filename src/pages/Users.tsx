
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Award, MessageSquare } from "lucide-react";
import { ProfileDB } from "@/types";
import { fetchAllProfiles } from "@/api/profiles";
import { format } from "date-fns";

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProfileDB[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const profiles = await fetchAllProfiles();
        setUsers(profiles);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Community Members</h1>
          
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Link 
                  key={user.id} 
                  to={`/users/${user.username}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar_url || "https://i.pravatar.cc/150?img=1"} alt={user.full_name || 'User'} />
                      <AvatarFallback>{user.full_name?.substring(0, 2) || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-900">{user.full_name || 'Anonymous'}</h3>
                      <p className="text-gray-500 mb-3">@{user.username || 'user'}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-tech-light text-tech-primary">
                          <Award className="h-3.5 w-3.5 mr-1" />
                          {user.reputation || 0} rep
                        </Badge>
                        
                        {user.answer_count > 0 && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700">
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            {user.answer_count} answers
                          </Badge>
                        )}
                        
                        {user.best_answer_count > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-tech-success">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            {user.best_answer_count} best
                          </Badge>
                        )}
                      </div>
                      
                      {user.created_at && (
                        <p className="mt-2 text-xs text-gray-500">
                          Member since {format(new Date(user.created_at), 'MMM yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Users;
