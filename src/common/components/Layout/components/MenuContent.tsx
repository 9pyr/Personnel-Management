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
    <nav className="flex flex-1 flex-col justify-between p-2">
      <ul className="flex flex-col gap-0.5">
        {menuItems
          .filter(item => canSeeMenuItem(item.roles, user?.role))
          .map(({ path: initialPath, name, icon, index: isDefaultPath }, index) => {
            const path = isDefaultPath ? '/' : (initialPath ?? '/#')
            const isActive =
              startsWith(pathname, path) &&
              (pathname[path.length] === '/' || pathname.length === path.length)

            return (
              <li key={index} className="block">
                <NavLink
                  to={path}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive ? 'bg-accent font-medium text-accent-foreground' : ''
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
                    {icon}
                  </span>
                  {name}
                </NavLink>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}
