import Image from "next/image";
import { HeroSection } from "./components/hero-section";
import { NavBar } from "./components/navbar";

export default function Home() {
  return (
    <main>
     <NavBar />
    <HeroSection />
  </main>
  );
}