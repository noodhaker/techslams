
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { fetchAllProfiles } from '@/api/profiles';
import UserCard from '@/components/users/UserCard';
import ChatDialog from '@/components/users/ChatDialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatUser, setChatUser] = useState<{ id: string; name: string } | null>(null);
  
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => fetchAllProfiles(),
  });

  const filteredProfiles = profiles?.filter(
    (profile) => 
      (profile.username && profile.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.full_name && profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.location && profile.location.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleStartChat = (userId: string, username: string) => {
    setChatUser({ id: userId, name: username });
  };

  const handleCloseChat = () => {
    setChatUser(null);
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Users</h1>
            <p className="text-gray-600 mb-6">
              Connect with other members of the TechSlam community. Browse profiles, send messages, and collaborate.
            </p>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search users by name, username, or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-60 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">Error loading users</p>
              <p className="text-sm text-gray-400">Please try again later</p>
            </div>
          ) : (
            <>
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-2">No users found matching "{searchTerm}"</p>
                  <p className="text-sm text-gray-400">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProfiles.map((profile) => (
                    <UserCard 
                      key={profile.id} 
                      profile={profile} 
                      onStartChat={handleStartChat}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {chatUser && (
        <ChatDialog 
          isOpen={!!chatUser} 
          onClose={handleCloseChat} 
          receiverId={chatUser.id}
          receiverName={chatUser.name}
        />
      )}
    </Layout>
  );
};

export default Users;
