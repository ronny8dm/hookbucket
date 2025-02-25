"use client"


import {
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher() {
  const {  state } = useSidebar()

  return (
    <SidebarMenu>
      <a href="/" className="flex items-center">
        <img 
          src="https://flowbite.com/docs/images/logo.svg" 
          className="mr-3 h-6 sm:h-9" 
          alt="flux logo" 
        />
        {state === "expanded" && (
          <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white">
            FLUX
          </span>
        )}
      </a>
    </SidebarMenu>
  )
}
