import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Applications = ({ darkMode, setDarkMode }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Queued':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-green-500';
      case 'Queued':
        return 'bg-yellow-500';
      case 'Interview':
      case 'Offer':
        return 'bg-blue-500';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="applications-page">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">Track your AI-powered job applications</p>
        </div>

        <div className="space-y-4">
          {applications.map((app, idx) => (
            <Card key={app.id} data-testid={`application-card-${idx}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {app.opportunity?.title || 'Job Application'}
                    </CardTitle>
                    <CardDescription>
                      {app.opportunity?.location} • {app.opportunity?.source}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(app.status)}
                    <Badge className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applied on:</span>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Match Score:</span>
                    <span className="font-bold">{app.match_score}%</span>
                  </div>
                  {app.requires_user_action && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                      <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                        ⚠️ Action Required: Click the apply link to complete your application
                      </p>
                    </div>
                  )}
                  {app.cover_letter && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-primary font-medium">View Cover Letter</summary>
                      <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                        {app.cover_letter}
                      </div>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <Card data-testid="no-applications-card">
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No applications yet. Start applying to jobs!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Applications;
