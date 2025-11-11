"use client"

import useToggleTheme from "../hooks/useToggleTheme"

export default function App({children}: {children: React.ReactNode}){
  const theme = useToggleTheme((state)=> state.theme);
  return (
    <html lang="en" className={theme + " bg-netural-100 dark:bg-netural-900 text-netural-950 dark:text-netural-200"}>
      <body>
        {children}
      </body>
    </html>
  )
}