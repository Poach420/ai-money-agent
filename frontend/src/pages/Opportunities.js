import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sparkles, MapPin, DollarSign, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Opportunities = ({ darkMode, setDarkMode }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/opportunities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities(response.data);
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoApply = async (oppId) => {
    setApplying(oppId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/applications/auto-apply`,
        { opportunity_id: oppId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Cover letter generated!');
      
      // Open apply URL
      if (response.data.apply_url) {
        window.open(response.data.apply_url, '_blank');
      }
      
      // Show cover letter in toast
      console.log('Cover Letter:', response.data.cover_letter);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Auto-apply failed');
    } finally {
      setApplying(null);
    }
  };

  const filteredOpps = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.description.toLowerCase().includes(search.toLowerCase()) ||
      opp.location.toLowerCase().includes(search.toLowerCase())
  );

  const getMatchColor = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="opportunities-page">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Job Opportunities</h1>
          <p className="text-muted-foreground">AI-matched jobs tailored for you</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
            data-testid="search-jobs-input"
          />
        </div>

        {/* Opportunities Grid */}
        <div className="space-y-4">
          {filteredOpps.map((opp, idx) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all" data-testid={`job-card-${idx}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{opp.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {opp.location}
                        </span>
                        {opp.salary_min && (
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            R{opp.salary_min.toLocaleString()} - R{opp.salary_max?.toLocaleString()}
                          </span>
                        )}
                        <Badge variant="outline">{opp.source}</Badge>
                        {opp.remote_flag && <Badge className="bg-secondary">Remote</Badge>}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Match</span>
                        <div className={`px-3 py-1 rounded-full ${getMatchColor(opp.match_score)} text-white font-bold`}>
                          {opp.match_score}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{opp.description}</p>
                  
                  {opp.skills_required?.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {opp.skills_required.map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAutoApply(opp.id)}
                      disabled={applying === opp.id}
                      className="flex items-center"
                      data-testid={`auto-apply-btn-${idx}`}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {applying === opp.id ? 'Applying...' : 'AI Auto-Apply'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(opp.apply_url, '_blank')}
                      data-testid={`manual-apply-btn-${idx}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Manually
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredOpps.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No opportunities found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
