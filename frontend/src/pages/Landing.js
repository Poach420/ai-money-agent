import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Sparkles, Zap, TrendingUp, Shield } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Landing = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/signup`, { email, password, name });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-center">AI Money Agent</CardTitle>
            <CardDescription className="text-center">South African Edition</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
                <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              </TabsList>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-testid="signup-name-input"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="signup-email-input"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="signup-password-input"
                  />
                  <Button type="submit" className="w-full" disabled={loading} data-testid="signup-submit-btn">
                    {loading ? 'Creating Account...' : 'Sign Up Free'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="login-email-input"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password-input"
                  />
                  <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit-btn">
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <Button variant="ghost" className="w-full mt-4" onClick={() => setShowAuth(false)} data-testid="back-to-landing-btn">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            AI Money Agent
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            South African Edition
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Let AI find and apply to jobs while you sleep. Wake up to interviews.
          </p>
          <Button
            size="lg"
            className="bg-[#6C5CE7] hover:bg-[#5f4dd4] text-white px-8 py-6 text-lg rounded-2xl"
            onClick={() => setShowAuth(true)}
            data-testid="get-started-btn"
          >
            <Sparkles className="mr-2" />
            Try Free - 3 Applications
          </Button>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {[
            {
              icon: <Sparkles className="w-8 h-8 text-[#6C5CE7]" />,
              title: 'AI Auto-Apply',
              description: 'Let AI generate custom cover letters and apply to jobs automatically'
            },
            {
              icon: <Zap className="w-8 h-8 text-[#00B894]" />,
              title: 'Smart Matching',
              description: 'Get personalized job matches based on your skills and location'
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-[#6C5CE7]" />,
              title: 'Track Applications',
              description: 'Monitor all your applications in one place with status updates'
            },
            {
              icon: <Shield className="w-8 h-8 text-[#00B894]" />,
              title: 'POPIA Compliant',
              description: 'Your data is secure and handled with care'
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-gray-700 hover:border-[#6C5CE7] transition-all">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { plan: 'Free', price: 'R0', credits: '3 applications/month', features: ['Browse jobs', 'Match scores', 'Manual apply'] },
              { plan: 'Starter', price: 'R49', credits: '20 applications/month', features: ['Auto-apply', 'Priority queue', 'Weekly insights'], highlight: true },
              { plan: 'Premium', price: 'R199', credits: 'Unlimited applications', features: ['Everything in Starter', 'Advanced matching', 'Premium support'] }
            ].map((tier, idx) => (
              <Card key={idx} className={`${tier.highlight ? 'border-[#6C5CE7] border-2' : 'border-gray-700'} bg-card/50 backdrop-blur`}>
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.plan}</CardTitle>
                  <div className="text-4xl font-bold text-[#6C5CE7]">{tier.price}<span className="text-sm text-gray-400">/mo</span></div>
                  <CardDescription className="text-[#00B894]">{tier.credits}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((f, i) => (
                      <li key={i} className="text-sm text-gray-300">✓ {f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
