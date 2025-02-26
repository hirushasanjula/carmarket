import VehicleSelectionBar from "@/components/Card";
import Footer from "@/components/Footer";
import HeroImage from "@/components/HeroImage";
import MostViewCardList from "@/components/MostViewd";
import SearchBar from "@/components/Search";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <SearchBar />
      <HeroImage />
      <VehicleSelectionBar />
      <MostViewCardList />
      <Footer />
    </div>
  );
}
