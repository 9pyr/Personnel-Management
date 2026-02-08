import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import Divider from '@mui/material/Divider'
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'

import React, { useState } from 'react'
import { useSetRecoilState } from 'recoil'

import { authTokenState, authUserState, clearAuthStorage } from 'core/stores/auth'

import { OptionsMenuMenuSx } from '../styles'
import MenuButton from './MenuButton'

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
})

export default function OptionsMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const setToken = useSetRecoilState(authTokenState)
  const setUser = useSetRecoilState(authUserState)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    clearAuthStorage()
    setToken(null)
    setUser(null)
    handleClose()
    window.location.href = '/login'
  }

  return (
    <React.Fragment>
      <MenuButton aria-label="Open menu" onClick={handleClick} sx={{ borderColor: 'transparent' }}>
        <MoreVertRoundedIcon />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={OptionsMenuMenuSx}
      >
        <MenuItem onClick={handleClose}>บัญชีของฉัน</MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: 'auto',
              minWidth: 0,
            },
          }}
        >
          <ListItemText>ออกจากระบบ</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  )
}
