import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Share2, Copy, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Referrals = ({ darkMode, setDarkMode }) => {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [codeRes, statsRes] = await Promise.all([
        axios.get(`${API}/referrals/code`, config),
        axios.get(`${API}/referrals/stats`, config)
      ]);

      setReferralCode(codeRes.data.referral_code);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = () => {
    const text = `AI Money Agent applied to jobs for me last night - try it free! ${window.location.origin}?ref=${referralCode}`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.origin });
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Users className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="referrals-page">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Referrals</h1>
          <p className="text-muted-foreground">Earn R50 for every friend who upgrades</p>
        </div>

        {/* Referral Code Card */}
        <Card className="mb-8 border-primary/50" data-testid="referral-code-card">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Share2 className="mr-2 text-primary" />
              Your Referral Code
            </CardTitle>
            <CardDescription>Share this link with friends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={`${window.location.origin}?ref=${referralCode}`}
                readOnly
                className="font-mono"
                data-testid="referral-link-input"
              />
              <Button onClick={copyToClipboard} data-testid="copy-link-btn">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={shareOnSocial} variant="outline" className="w-full" data-testid="share-social-btn">
              <Share2 className="mr-2 w-4 h-4" />
              Share on Social Media
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="total-referrals-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.total_referrals || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="completed-referrals-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-500">{stats?.completed_referrals || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="total-earned-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">R{stats?.total_earned || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Share your unique referral link with friends</p>
            <p>• When they sign up and upgrade to Starter or Premium, you both get R50</p>
            <p>• Earnings are added to your wallet</p>
            <p>• Withdraw after completing KYC verification</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Referrals;
