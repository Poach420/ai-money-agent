import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, TrendingUp, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Wallet = ({ darkMode, setDarkMode }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallet(response.data);
    } catch (error) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <WalletIcon className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="wallet-page">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and payouts</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 border-primary/50" data-testid="balance-card">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <WalletIcon className="mr-2 text-primary" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary mb-4">
              R{wallet?.balance?.toFixed(2) || '0.00'}
            </div>
            <Button disabled>
              Withdraw (KYC Required)
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Complete KYC verification to enable withdrawals
            </p>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card data-testid="transactions-card">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent wallet activity</CardDescription>
          </CardHeader>
          <CardContent>
            {wallet?.transactions?.length > 0 ? (
              <div className="space-y-4">
                {wallet.transactions.map((tx, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{tx.reason}</p>
                      <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'credit' ? '+' : '-'}R{tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
