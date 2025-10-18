import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Briefcase, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Admin = ({ darkMode, setDarkMode }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, config),
        axios.get(`${API}/admin/users`, config)
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Admin access denied or failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const grantUnlimitedCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/grant-credits`,
        { credits: 99999 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Granted unlimited credits to yourself!');
      loadAdminData();
    } catch (error) {
      toast.error('Failed to grant credits');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Shield className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-page">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Shield className="mr-2 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">System overview and controls</p>
          </div>
          <Button onClick={grantUnlimitedCredits} variant="outline" data-testid="grant-credits-btn">
            Grant Myself Unlimited Credits
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="total-users-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_users || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="total-applications-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Briefcase className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_applications || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="total-opportunities-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_opportunities || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="mrr-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <TrendingUp className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R0</div>
              <p className="text-xs text-muted-foreground">Sandbox Mode</p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        {stats?.plan_distribution && (
          <Card className="mb-8" data-testid="plan-distribution-card">
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>User subscription breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(stats.plan_distribution).map(([plan, count]) => (
                  <div key={plan} className="flex items-center gap-2">
                    <Badge variant="outline">{plan}</Badge>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card data-testid="users-table-card">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">City</th>
                    <th className="text-left py-2">Admin</th>
                    <th className="text-left py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id} className="border-b" data-testid={`user-row-${idx}`}>
                      <td className="py-2">{user.name}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">{user.city || '-'}</td>
                      <td className="py-2">
                        {user.is_admin && <Badge className="bg-primary">Admin</Badge>}
                      </td>
                      <td className="py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
