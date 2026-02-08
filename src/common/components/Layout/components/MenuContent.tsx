import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'

import { startsWith } from 'lodash'
import { NavLink, useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import type { Role } from 'core/apis/auth/types'
import { authUserState } from 'core/stores/auth'

import { menuItems } from 'routes'

function canSeeMenuItem(roles: Role[] | undefined, userRole: Role | undefined): boolean {
  if (!roles || roles.length === 0) return true
  return Boolean(userRole && roles.includes(userRole))
}

export default function MenuContent() {
  const location = useLocation()
  const user = useRecoilValue(authUserState)
  const pathname = location.pathname

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {menuItems
          .filter(item => canSeeMenuItem(item.roles, user?.role))
          .map(({ path: initialPath, name, icon, index: isDefaultPath }, index) => {
            const path = isDefaultPath ? '/' : (initialPath ?? '/#')

            return (
              <ListItem
                key={index}
                component={NavLink}
                to={path}
                disablePadding
                sx={{ display: 'block' }}
              >
                <ListItemButton
                  selected={
                    startsWith(pathname, path) &&
                    (pathname[path.length] === '/' || pathname.length === path.length)
                  }
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={name} />
                </ListItemButton>
              </ListItem>
            )
          })}
      </List>
    </Stack>
  )
}
