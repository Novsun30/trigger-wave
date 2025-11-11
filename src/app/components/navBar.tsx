"use client";

import Image from "next/image";
import useToggleTheme from "../hooks/useToggleTheme";

export default function NavBar(){
  const handleToggleTheme = useToggleTheme((state)=>state.toggleTheme);
  const themeState = useToggleTheme((state)=>state.theme);
  
  return (
    <nav className="w-full h-12 flex justify-between items-center bg-netural-50 dark:bg-netural-800 px-2">
      <div>
        Logo
      </div>
      <div className="flex" onClick={handleToggleTheme}>
        {
          themeState === "light" 
            ? <Image src="/dark-mode.svg" alt="dark mode" width="24" height="24" />
            :<Image src="/light-mode.svg" alt="light mode" width="24" height="24" className="dark:invert"/>
        }
      </div>
    </nav>
  )
}