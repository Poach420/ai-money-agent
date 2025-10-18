import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Briefcase, Wallet as WalletIcon, Users, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [stats, setStats] = useState({ applications: 0, opportunities: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [profileRes, subRes, appsRes, oppsRes] = await Promise.all([
        axios.get(`${API}/user/profile`, config),
        axios.get(`${API}/subscription`, config),
        axios.get(`${API}/applications`, config),
        axios.get(`${API}/opportunities`, config)
      ]);

      setUser(profileRes.data);
      setSubscription(subRes.data);
      setStats({
        applications: appsRes.data.length,
        opportunities: oppsRes.data.length
      });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const profileComplete = () => {
    if (!user) return 0;
    let complete = 30; // Base
    if (user.city) complete += 20;
    if (user.skills?.length > 0) complete += 25;
    if (user.cv_files?.length > 0) complete += 25;
    return complete;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's your AI job hunting dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-primary/20 hover:border-primary transition-all" data-testid="credits-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              <Sparkles className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subscription?.credits_remaining || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{subscription?.plan} Plan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Briefcase className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.applications}</div>
              <p className="text-xs text-muted-foreground mt-1">Total submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <Briefcase className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.opportunities}</div>
              <p className="text-xs text-muted-foreground mt-1">Available jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <Users className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profileComplete()}%</div>
              <p className="text-xs text-muted-foreground mt-1">Complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completeness */}
        {profileComplete() < 100 && (
          <Card className="mb-8 border-secondary/50" data-testid="profile-incomplete-card">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>Boost your match score by completing your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={profileComplete()} className="mb-4" />
              <div className="space-y-2 text-sm">
                {!user?.city && <p>• Add your location</p>}
                {!user?.skills?.length && <p>• Add your skills</p>}
                {!user?.cv_files?.length && <p>• Upload your CV</p>}
              </div>
              <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                Update Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/opportunities')} data-testid="browse-jobs-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 text-primary" />
                Browse Jobs
              </CardTitle>
              <CardDescription>Find AI-matched opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View {stats.opportunities} Opportunities</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/applications')} data-testid="track-applications-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 text-secondary" />
                Track Applications
              </CardTitle>
              <CardDescription>Monitor your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">View {stats.applications} Applications</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
