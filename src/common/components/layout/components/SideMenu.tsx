import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { Drawer, SideMenuDrawerSx, SideMenuStackSx } from '../styles'
import MenuContent from './MenuContent'
import OptionsMenu from './OptionsMenu'

export default function SideMenu() {
  return (
    <Drawer variant="permanent" sx={SideMenuDrawerSx}>
      <Divider />
      <MenuContent />
      <Stack direction="row" sx={SideMenuStackSx}>
        <Avatar
          sizes="small"
          alt="Riley Carter"
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            Riley Carter
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            riley@email.com
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  )
}
