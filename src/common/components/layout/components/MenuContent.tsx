// import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded'
// import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
// import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import InfoRoundedIcon from '@mui/icons-material/InfoRounded'
// import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
// import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'

import { Link } from 'react-router-dom'

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, path: '/' },
  // { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
  // { text: 'Clients', icon: <PeopleRoundedIcon /> },
  // { text: 'Tasks', icon: <AssignmentRoundedIcon /> },
]

const secondaryListItems = [
  // { text: 'Settings', icon: <SettingsRoundedIcon /> },
  { text: 'About', icon: <InfoRoundedIcon />, path: '/about' },
  // { text: 'Feedback', icon: <HelpRoundedIcon /> },
]

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map(({ path, text, icon }, index) => (
          <ListItem key={index} component={Link} to={path} disablePadding sx={{ display: 'block' }}>
            <ListItemButton selected={window.location.pathname === path}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map(({ path, text, icon }, index) => (
          <ListItem key={index} component={Link} to={path} disablePadding sx={{ display: 'block' }}>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}
