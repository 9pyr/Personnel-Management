import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRecoilValue } from 'recoil'

import apiCaller from 'core/endpoints/apiCaller'
import type { Role } from 'core/apis/auth/types'
import { authUserState } from 'core/stores/auth'

import { Drawer, SideMenuDrawerSx, SideMenuStackSx } from '../styles'
import MenuContent from './MenuContent'
import NotificationButton from './NotificationButton'
import OptionsMenu from './OptionsMenu'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'แอดมิน',
  PEOPLE: 'การบุคคล',
  MANAGER: 'หัวหน้า',
  STAFF: 'พนักงาน',
}

function UserProfileBlock() {
  const user = useRecoilValue(authUserState)
  const avatarSrc = user?.profileImageUrl
    ? `${apiCaller.defaults.baseURL ?? ''}${user.profileImageUrl}`
    : undefined
  const roleLabel = user?.role ? ROLE_LABELS[user.role] ?? user.role : null

  return (
    <Stack sx={SideMenuStackSx} spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <NotificationButton />
        <Box sx={{ flex: 1, minWidth: 0 }} />
        <OptionsMenu />
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar src={avatarSrc} sx={{ width: 40, height: 40, flexShrink: 0 }}>
          {user?.name?.charAt(0) ?? '?'}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {user?.name ?? '-'}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {user?.email ?? '-'}
          </Typography>
          {roleLabel && (
            <Chip
              label={roleLabel}
              size="small"
              sx={{ mt: 0.5, height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }}
            />
          )}
        </Box>
      </Stack>
    </Stack>
  )
}

export default function SideMenu() {
  return (
    <Drawer variant="permanent" sx={SideMenuDrawerSx}>
      <Divider />
      <MenuContent />
      <UserProfileBlock />
    </Drawer>
  )
}
