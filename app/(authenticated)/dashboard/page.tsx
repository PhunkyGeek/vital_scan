import { formatDistanceToNow } from 'date-fns'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { StatCard } from '@/components/shared/StatCard'
import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Scan, MessageSquare, BookOpen, History, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getDashboardStats } from '@/lib/data/dashboard'
import { getUserProfile, getUserDisplayName, getUserAvatar } from '@/lib/data/profile'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect('/login')
  }

  const [stats, profile] = await Promise.all([
    getDashboardStats(supabase, authData.user.id),
    getUserProfile(supabase, authData.user.id)
  ])

  const displayName = getUserDisplayName(profile, authData.user.email || '')
  const avatar = getUserAvatar(profile)

  return (
    <main className="min-h-screen bg-background">
      {/* Personalized Welcome Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatar.src || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {avatar.initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {displayName}
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s your health & diagnosis overview.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        <DisclaimerBanner />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Scans"
            value={stats.totalScans}
            description="Your scans to date"
            icon={Scan}
          />
          <StatCard
            title="Chat Sessions"
            value={stats.chatSessions}
            description="Your saved chat sessions"
            icon={MessageSquare}
          />
          <StatCard
            title="Conditions Learned"
            value={stats.conditionsLearned}
            description="Unique conditions from your scans"
            icon={BookOpen}
          />
          <StatCard
            title="History Items"
            value={stats.historyItems}
            description="Scans + chat sessions"
            icon={History}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scan className="h-5 w-5" />
                <span>New Scan</span>
              </CardTitle>
              <CardDescription>
                Upload an image for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/scan">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>AI Chatbot</span>
              </CardTitle>
              <CardDescription>
                Get health insights and answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chatbot">
                <Button variant="outline" className="w-full">
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Condition Library</span>
              </CardTitle>
              <CardDescription>
                Learn about health conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/library">
                <Button variant="outline" className="w-full">
                  Browse Library
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest scans and chat sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-3">
                        {activity.type === 'scan' ? (
                          <Scan className="h-5 w-5 text-primary" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.subtitle} • {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Link href={activity.href} className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-all hover:border-primary/50 hover:bg-primary/5">
                      View {activity.type === 'scan' ? 'Result' : 'Chat'}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-lg font-semibold text-foreground">No recent activity yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your latest scans and chats will appear here once they are saved.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}