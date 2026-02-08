import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getFeed } from 'core/apis/feed'
import type { FeedPost } from 'core/apis/feed/types'
import { getLeaveBalance, type LeaveBalanceItem } from 'core/apis/leave'

dayjs.extend(relativeTime)
dayjs.locale('th')

function findAnnualBalance(balances: LeaveBalanceItem[]): LeaveBalanceItem | null {
  return (
    balances.find(b => b.code === 'ANNUAL_LEAVE') ??
    balances.find(b => b.maxDaysPerYear > 0) ??
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
    <Stack spacing={3}>
      <Typography variant="h5">Dashboard</Typography>

      {/* วันลาคงเหลือ */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            วันลาพักร้อนคงเหลือ (ปีนี้)
          </Typography>
          {loadingLeave ? (
            <Typography color="text.secondary">กำลังโหลด...</Typography>
          ) : annualBalance ? (
            <>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="h4" component="span" color="primary" fontWeight={700}>
                  {maxDays > 0 ? remaining : '-'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  / {maxDays > 0 ? `${maxDays} วัน` : 'ไม่จำกัด'}
                </Typography>
              </Stack>
              {maxDays > 0 && (
                <>
                  <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{ height: 8, borderRadius: 1 }}
                    color="primary"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    ใช้ไปแล้ว {used} วัน
                  </Typography>
                </>
              )}
            </>
          ) : (
            <>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="h4" component="span" color="primary" fontWeight={700}>
                  0
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  / 0 วัน
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                ตั้งค่าจำนวนวันลาต่อปีได้ที่{' '}
                <Link to="/leave-types" style={{ color: 'inherit' }}>
                  จัดการประเภทการลา
                </Link>
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* New Feed */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            ประกาศล่าสุด
          </Typography>
          <Typography
            component={Link}
            to="/feed"
            variant="body2"
            color="primary"
            sx={{ textDecoration: 'none' }}
          >
            ดูทั้งหมด
          </Typography>
        </Stack>
        {loadingFeed ? (
          <Typography color="text.secondary">กำลังโหลด...</Typography>
        ) : feedPosts.length === 0 ? (
          <Typography color="text.secondary">ยังไม่มีโพสต์</Typography>
        ) : (
          <Stack spacing={1.5}>
            {feedPosts.map(post => (
              <Card key={post.id} variant="outlined" sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{ width: 36, height: 36 }}>
                      {post.authorName?.charAt(0) ?? '?'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {post.authorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFeedTime(post.createdAt)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {post.content}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  )
}

export default DashboardPage
