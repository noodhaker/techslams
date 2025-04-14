
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileDB } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface UserCardProps {
  profile: ProfileDB;
  onStartChat: (userId: string, username: string) => void;
}

const UserCard = ({ profile, onStartChat }: UserCardProps) => {
  const { user } = useAuth();
  const isCurrentUser = useMemo(() => user?.id === profile.id, [user, profile.id]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 p-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-tech-primary flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.username || 'User'} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg">
              <Link to={`/users/${profile.username}`} className="hover:text-tech-primary transition-colors">
                {profile.username || 'Anonymous User'}
              </Link>
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Badge variant="outline" className="bg-gray-100">
                {profile.reputation || 0} reputation
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-sm text-gray-500 mb-3 h-12 overflow-hidden">
          {profile.bio || 'No bio available'}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {profile.location && (
              <span>{profile.location}</span>
            )}
          </div>
          {!isCurrentUser && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onStartChat(profile.id, profile.username || 'User')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
