import type { SupabaseClient } from '@supabase/supabase-js'

export interface RecentActivityItem {
  id: string
  type: 'scan' | 'chat'
  title: string
  subtitle: string
  created_at: string
  href: string
}

export interface DashboardStats {
  totalScans: number
  chatSessions: number
  conditionsLearned: number
  historyItems: number
  recentActivity: RecentActivityItem[]
}

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const [screeningsCount, chatSessionsCount] = await Promise.all([
    supabase
      .from('screenings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('chat_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  const [conditionNames, recentScreenings, recentChats] = await Promise.all([
    supabase
      .from('screening_results')
      .select('condition_name,screenings(user_id)')
      .eq('screenings.user_id', userId)
      .not('condition_name', 'is', null),
    supabase
      .from('screenings')
      .select('id,created_at,body_area,ai_analysis_result')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('chat_sessions')
      .select('id,title,last_message_at,message_count')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(5),
  ])

  const totalScans = screeningsCount.count ?? 0
  const chatSessions = chatSessionsCount.count ?? 0

  type ConditionNameRow = {
    condition_name?: string | null
  }
  const uniqueConditions = new Set(
    ((conditionNames.data || []) as ConditionNameRow[])
      .map((row) => String(row.condition_name || '').trim())
      .filter((name) => name.length > 0)
  )

  const conditionsLearned = uniqueConditions.size
  const historyItems = totalScans + chatSessions

  type RecentScreeningRow = {
    id: string
    body_area?: string | null
    created_at: string
    ai_analysis_result?: { condition_name?: string | null }
  }

  const scanActivities: RecentActivityItem[] = ((recentScreenings.data || []) as RecentScreeningRow[]).map(
    (row) => ({
      id: row.id,
      type: 'scan',
      title: row.ai_analysis_result?.condition_name
        ? String(row.ai_analysis_result.condition_name)
        : `${String(row.body_area || 'Scan').replace(/\b\w/g, (char) => char.toUpperCase())} Scan`,
      subtitle: `${String(row.body_area || 'Scan').replace(/\b\w/g, (char) => char.toUpperCase())} scan`,
      created_at: row.created_at,
      href: `/scan/${row.id}`,
    })
  )

  type ChatRow = {
    id: string
    title: string | null
    message_count: number
    last_message_at: string
  }

  const chatActivities: RecentActivityItem[] = ((recentChats.data || []) as ChatRow[]).map(
    (row) => ({
      id: row.id,
      type: 'chat',
      title: row.title || 'Chat session',
      subtitle: `${row.message_count ?? 0} messages`,
      created_at: row.last_message_at || new Date().toISOString(),
      href: `/chatbot?session=${row.id}`,
    })
  )

  const recentActivity = [...scanActivities, ...chatActivities]
    .sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)

  return {
    totalScans,
    chatSessions,
    conditionsLearned,
    historyItems,
    recentActivity,
  }
}
