import { SxProps, Theme, dividerClasses, listClasses, paperClasses } from '@mui/material'
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer'
import { styled } from '@mui/material/styles'

const drawerWidth = 240

export const MenuContentListItemSx: SxProps<Theme> = {
  display: 'block',
}

export const OptionsMenuMenuSx: SxProps<Theme> = {
  [`& .${listClasses.root}`]: {
    padding: '4px',
  },
  [`& .${paperClasses.root}`]: {
    padding: 0,
  },
  [`& .${dividerClasses.root}`]: {
    margin: '4px -4px',
  },
}

export const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
})

export const SideMenuDrawerSx: SxProps<Theme> = {
  display: { xs: 'none', md: 'block' },
  [`& .${drawerClasses.paper}`]: {
    backgroundColor: 'background.paper',
  },
}

export const SideMenuStackSx: SxProps<Theme> = {
  p: 2,
  gap: 1,
  alignItems: 'center',
  borderTop: '1px solid',
  borderColor: 'divider',
}
