import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { NextUIProvider } from "@nextui-org/react"
import { RouterProvider } from "react-router-dom"
import { router } from "../routes"

import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NextUIProvider>
      <RouterProvider router={router} />
    </NextUIProvider>
  </StrictMode>
)
