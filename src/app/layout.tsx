import type { Metadata } from "next";
import "./globals.css";
import App from "./components/app";
import NavBar from "./components/navBar";

export const metadata: Metadata = {
  title: "TriggerWave",
  description: "The platform to create and explore sound",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <App>
      <NavBar />
      {children}
    </App>
  );
}
