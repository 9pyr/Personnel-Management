import dayjs from 'dayjs'
import 'dayjs/locale/th'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getFeed } from 'core/apis/feed'
import type { FeedPost } from 'core/apis/feed/types'
import { getLeaveBalance, type LeaveBalanceItem } from 'core/apis/leave'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

dayjs.extend(relativeTime)
dayjs.locale('th')

function findAnnualBalance(balances: LeaveBalanceItem[]): LeaveBalanceItem | null {
  return (
    balances.find(balance => balance.code === 'ANNUAL_LEAVE') ??
    balances.find(balance => balance.maxDaysPerYear > 0) ??
    balances[0] ??
    null
  )
}

function formatFeedTime(iso: string): string {
  const d = dayjs(iso)
  const diffDays = dayjs().diff(d, 'day')
  if (diffDays === 0) return d.fromNow()
  if (diffDays < 7) return d.fromNow()
  return d.format('D MMM YYYY')
}

const DashboardPage = () => {
  const [annualBalance, setAnnualBalance] = useState<LeaveBalanceItem | null>(null)
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([])
  const [loadingLeave, setLoadingLeave] = useState(true)
  const [loadingFeed, setLoadingFeed] = useState(true)

  const loadLeaveBalance = useCallback(async () => {
    try {
      const balances = await getLeaveBalance()
      const item = findAnnualBalance(Array.isArray(balances) ? balances : [])
      setAnnualBalance(item)
    } catch {
      setAnnualBalance(null)
    } finally {
      setLoadingLeave(false)
    }
  }, [])

  const loadFeed = useCallback(async () => {
    try {
      const list = await getFeed()
      setFeedPosts(list.slice(0, 5))
    } catch {
      setFeedPosts([])
    } finally {
      setLoadingFeed(false)
    }
  }, [])

  useEffect(() => {
    void loadLeaveBalance()
  }, [loadLeaveBalance])

  useEffect(() => {
    void loadFeed()
  }, [loadFeed])

  const maxDays = annualBalance?.maxDaysPerYear ?? 0
  const remaining = annualBalance?.remaining ?? 0
  const used = annualBalance?.usedDaysThisYear ?? 0
  const progressValue = maxDays > 0 ? (remaining / maxDays) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <Card className="border">
        <CardContent className="pt-6">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            วันลาพักร้อนคงเหลือ (ปีนี้)
          </p>
          {loadingLeave ? (
            <p className="text-muted-foreground">กำลังโหลด...</p>
          ) : annualBalance ? (
            <>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {maxDays > 0 ? remaining : '-'}
                </span>
                <span className="text-muted-foreground">
                  / {maxDays > 0 ? `${maxDays} วัน` : 'ไม่จำกัด'}
                </span>
              </div>
              {maxDays > 0 && (
                <>
                  <Progress value={progressValue} className="h-3 [&>div:last-child]:bg-emerald-600 [&>div:last-child]:dark:bg-emerald-500" />
                  <p className="mt-1 text-xs text-muted-foreground">ใช้ไปแล้ว {used} วัน</p>
                </>
              )}
            </>
          ) : (
            <>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">0</span>
                <span className="text-muted-foreground">/ 0 วัน</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ตั้งค่าจำนวนวันลาต่อปีได้ที่{' '}
                <Link to="/leave-types" className="text-primary underline underline-offset-4">
                  จัดการประเภทการลา
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">ประกาศล่าสุด</h3>
          <Link
            to="/feed"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>
        {loadingFeed ? (
          <p className="text-muted-foreground">กำลังโหลด...</p>
        ) : feedPosts.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีโพสต์</p>
        ) : (
          <div className="flex flex-col gap-3">
            {feedPosts.map(post => (
              <Card key={post.id} className="overflow-hidden border">
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{post.authorName?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{post.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFeedTime(post.createdAt)}
                      </p>
                      <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm">
                        {post.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
