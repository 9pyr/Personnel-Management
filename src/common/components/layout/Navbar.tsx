import {
  Link,
  Navbar as BaseNavbar,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react"
import React from "react"
import { menuItems } from "./constants"

const Navbar = () => {
  return (
    <BaseNavbar
      isBordered
      classNames={{
        base: ["mb-8"],
        item: [
          "flex",
          "relative",
          "h-full",
          "data-[active=true]:after:content-['']",
          "data-[active=true]:after:absolute",
          "data-[active=true]:after:bottom-0",
          "data-[active=true]:after:left-0",
          "data-[active=true]:after:right-0",
          "data-[active=true]:after:h-[2px]",
          "data-[active=true]:after:rounded-[2px]",
          "data-[active=true]:after:bg-primary",
        ],
      }}
    >
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map(({ path, label }) => (
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem isActive={window.location.pathname === path}>
              <Link href={path}>{label}</Link>
            </NavbarItem>
          </NavbarContent>
        ))}
      </NavbarContent>
    </BaseNavbar>
  )
}

export default React.memo(Navbar)
