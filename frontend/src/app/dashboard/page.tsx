'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Plus, 
  Users, 
  BarChart3, 
  Settings,
  Eye,
  Copy,
  Trash2,
  Activity
} from 'lucide-react';

// Mock data for demonstration
const mockApps = [
  {
    id: 'app_1',
    name: 'My SaaS App',
    domain: 'https://mysaas.com',
    apiKey: 'app_abc123def456',
    userCount: 1234,
    createdAt: '2024-01-15T10:30:00Z',
    lastActivity: '2024-01-20T14:22:00Z'
  },
  {
    id: 'app_2',
    name: 'Test Application',
    domain: 'https://testapp.dev',
    apiKey: 'app_xyz789uvw012',
    userCount: 56,
    createdAt: '2024-01-10T09:15:00Z',
    lastActivity: '2024-01-19T11:45:00Z'
  }
];

const mockStats = {
  totalUsers: 1290,
  totalApps: 2,
  totalApiCalls: 45678,
  thisMonth: {
    users: 234,
    apiCalls: 12345
  }
};

export default function Dashboard() {
  const [apps, setApps] = useState(mockApps);
  const [stats, setStats] = useState(mockStats);
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you'd show a toast notification here
    alert('Copied to clipboard!');
  };

  const handleDeleteApp = (appId: string) => {
    if (confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
      setApps(apps.filter(app => app.id !== appId));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">AuthStarter</span>
            </Link>
            <span className="text-muted-foreground">/ Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Manage your authentication apps and monitor usage statistics.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisMonth.users} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApps}</div>
              <p className="text-xs text-muted-foreground">
                Active applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApiCalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisMonth.apiCalls.toLocaleString()} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Healthy</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Apps Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Apps</h2>
          <Link href="/dashboard/apps/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New App
            </Button>
          </Link>
        </div>

        {/* Apps Grid */}
        <div className="grid gap-6">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>{app.domain}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/apps/${app.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteApp(app.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">API Key</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                        {app.apiKey.substring(0, 20)}...
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(app.apiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Users</p>
                    <p className="text-2xl font-bold">{app.userCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Last Activity</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(app.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {apps.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No apps yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first app to start using AuthStarter
              </p>
              <Link href="/dashboard/apps/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first app
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Start Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>
              Get up and running with AuthStarter in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Create an app</h4>
                  <p className="text-sm text-muted-foreground">
                    Register your application to get an API key
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Add to your app</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the API key to authenticate requests from your application
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Monitor usage</h4>
                  <p className="text-sm text-muted-foreground">
                    Track user registrations and API usage in real-time
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}