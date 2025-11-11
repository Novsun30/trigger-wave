import { create } from "zustand";

type ThemeState = { theme: "dark" | "light" }

type ThemeAction = {
  toggleTheme: () => void
}

const useToggleTheme = create<ThemeState & ThemeAction>((set) => ({
  theme: "dark",
  toggleTheme: () => set((state)=>{
    if(state.theme === "dark"){
      return {theme: "light"};
    }
    return {theme: "dark"};
  })
}))

export default useToggleTheme;