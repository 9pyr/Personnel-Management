import { useContext } from 'react'

import type { Role } from 'core/apis/auth/types'
import { AuthContext } from 'core/contexts/AuthContext'
import { NavLink } from 'react-router-dom'
import { menuItems } from 'routes'

function canSeeMenuItem(roles: Role[] | undefined, userRole: Role | undefined): boolean {
  if (!roles || roles.length === 0) return true
  return Boolean(userRole && roles.includes(userRole))
}

export default function MenuContent() {
  const user = useContext(AuthContext)

  return (
    <nav className="flex flex-1 flex-col justify-between p-2">
      <ul className="flex flex-col gap-0.5">
        {menuItems
          .filter(item => canSeeMenuItem(item.roles, user?.role))
          .map(({ path: initialPath, name, icon, index: isDefaultPath }, index) => {
            const path = isDefaultPath ? '/' : (initialPath ?? '/#')

            return (
              <li key={index} className="block">
                <NavLink
                  to={path}
                  className={({ isActive, isPending }) =>
                    `flex items-center gap-3 rounded-r-md border-l-2 px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-accent hover:text-accent-foreground ${
                      isActive
                        ? 'border-primary bg-primary/10 font-medium text-primary [&_span]:text-primary'
                        : 'border-transparent'
                    } ${isPending ? 'opacity-70' : ''}`
                  }
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
