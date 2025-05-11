
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderPlus, Lock, MessageCircle, Folder, User, Users } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

interface Folder {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
}

interface DashboardStats {
  totalFolders: number;
  totalFiles: number;
  activeUsers: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [recentFolders, setRecentFolders] = useState<Folder[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFolders: 0,
    totalFiles: 0, 
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // This would be an API call in a real application
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate fetched data
        const mockFolders: Folder[] = [
          { id: '1', name: 'Work Documents', fileCount: 5, createdAt: new Date().toISOString() },
          { id: '2', name: 'Personal Photos', fileCount: 12, createdAt: new Date().toISOString() },
          { id: '3', name: 'Project Assets', fileCount: 8, createdAt: new Date().toISOString() },
        ];
        
        const mockStats: DashboardStats = {
          totalFolders: 3,
          totalFiles: 25,
          activeUsers: 12
        };
        
        setRecentFolders(mockFolders);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const DashboardStat = ({ icon: Icon, title, value }: { icon: any; title: string; value: number }) => (
    <Card className="card-hover">
      <CardContent className="flex pt-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
        </div>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ icon: Icon, title, description, to, buttonText }: { 
    icon: any; 
    title: string; 
    description: string; 
    to: string;
    buttonText: string;
  }) => (
    <Card className="card-hover">
      <CardHeader>
        <div className="bg-primary/10 p-2 w-10 h-10 rounded-full flex items-center justify-center mb-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={to}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <AppLayout>
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Welcome, {user?.username || user?.email.split('@')[0]}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your secured folders and files.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardStat icon={Folder} title="Total Folders" value={stats.totalFolders} />
          <DashboardStat icon={Lock} title="Total Files" value={stats.totalFiles} />
          <DashboardStat icon={Users} title="Active Users" value={stats.activeUsers} />
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            icon={FolderPlus}
            title="Create New Folder"
            description="Create a new password-protected folder to store your files."
            to="/create-folder"
            buttonText="Create Folder"
          />
          <ActionCard
            icon={Lock}
            title="Access a Folder"
            description="Enter folder name and password to access shared files."
            to="/access-folder"
            buttonText="Access Folder"
          />
          <ActionCard
            icon={MessageCircle}
            title="Global Chat"
            description="Chat with other users and share folder credentials."
            to="/chat"
            buttonText="Open Chat"
          />
        </div>

        {/* Recent Folders */}
        <h2 className="text-2xl font-bold mb-4">Recent Folders</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : recentFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFolders.map((folder) => (
              <Card key={folder.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    {folder.name}
                  </CardTitle>
                  <CardDescription>
                    Created on {formatDate(folder.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{folder.fileCount} files</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/folder/${folder.id}`}>View Folder</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="flex justify-center mb-4">
                <FolderPlus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No folders yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first secure folder to get started
              </p>
              <Button asChild>
                <Link to="/create-folder">Create a Folder</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
