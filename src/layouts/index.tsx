import { lazy, useEffect } from "react";
import { Outlet } from "react-router-dom";
import pinkImg from "../assets/images/pink.svg";
import redImg from "../assets/images/red.svg";
import greenImg from "../assets/images/green.svg";

// ---------------------------------------------------------------------------------------

const Navbar = lazy(() => import("./Navbar"));
const Footer = lazy(() => import("./Footer"));

// ---------------------------------------------------------------------------------------

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col  ">
      <div className="svg pink">
        <img src={pinkImg} alt="logo" />
      </div>
      <div className="svg red">
        <img src={pinkImg} alt="logo" />
      </div>
      <div className="svg green">
        <img src={pinkImg} alt="logo" />
      </div>
      <Navbar />
      <div className="flex-1 z-20 flex justify-center py-10">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
