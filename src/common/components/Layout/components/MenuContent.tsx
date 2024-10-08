import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'

import { startsWith } from 'lodash'
import { NavLink, useLocation } from 'react-router-dom'
import { menuItems } from 'routes'

export default function MenuContent() {
  const location = useLocation()

  const pathname = location.pathname

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {menuItems.map(({ path: initialPath, name, icon, index: isDefaultPath }, index) => {
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
