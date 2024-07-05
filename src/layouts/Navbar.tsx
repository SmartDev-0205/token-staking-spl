import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Drawer, List, ListItem } from "@material-tailwind/react";
import Container from "../components/containers/Container";
import TextButton from "../components/buttons/TextButton";
import TextIconButton from "../components/buttons/TextIconButton";
import FilledButton from "../components/buttons/FilledButton";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import logoImg from "../assets/images/logo.svg";

// -----------------------------------------------------------------------------------------

interface INavLink {
  id: number;
  label: string;
  iconName: string;
  to: string;
}

// -----------------------------------------------------------------------------------------

const NAV_LINKS: Array<INavLink> = [
  // {
  //   id: 1,
  //   label: "Staking",
  //   iconName: "lucide:cylinder",
  //   to: "/staking",
  // },
  // {
  //   id: 2,
  //   label: "Twitter",
  //   iconName: "line-md:twitter",
  //   to: "/twitter",
  // },
  // {
  //   id: 3,
  //   label: "Telegram",
  //   iconName: "la:telegram",
  //   to: "/telegram",
  // },
];

const chainId = process.env.REACT_APP_CHAIN_ID;

// -----------------------------------------------------------------------------------------

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [visibleDrawer, setVisibleDrawer] = useState<boolean>(false);

  const closeDrawer = () => {
    setVisibleDrawer(false);
  };

  const navigateToPage = (to: string) => {
    navigate(to);
    closeDrawer();
  };

  return (
    <nav className="z-[99]">
      <Container className="justify-between p-3 hidden md:flex">
        <div className="flex items-center gap-8">
          <Link to="/">
            <img src={logoImg} alt="logo" className="h-[60px]" />
          </Link>

          <div className="flex items-center gap-4">
            {NAV_LINKS.map((linkItem) => (
              <Link key={linkItem.id} to={linkItem.to}>
                <TextButton
                  className={`flex items-center gap-2 ${
                    pathname === linkItem.to ? "text-gray-100" : "text-gray-500"
                  }`}
                >
                  <Icon icon={linkItem.iconName} className="text-lg" />
                  {linkItem.label}
                </TextButton>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* <FilledButton className="flex items-center gap-1 connect-wallet">
            <Icon icon="mdi:wallet-outline" className="text-xl" />
            Connect Wallet
          </FilledButton> */}
          <WalletMultiButton />
        </div>
      </Container>

      <Container className="justify-between items-center p-4 flex md:hidden">
        <Link to="/">
          <img src={logoImg} alt="logo" className="h-[60px]" />
        </Link>

        <TextIconButton onClick={() => setVisibleDrawer(true)}>
          <Icon icon="ion:menu" className="text-xl" />
        </TextIconButton>
      </Container>
      <Drawer
        open={visibleDrawer}
        onClose={closeDrawer}
        className="p-4 bg-[#070a15]"
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Link to="/">
              <img src={logoImg} alt="logo" className="h-[60px]" />
            </Link>

            <TextIconButton onClick={closeDrawer}>
              <Icon icon="akar-icons:cross" className="text-xl" />
            </TextIconButton>
          </div>

          <List>
            {NAV_LINKS.map((linkItem) => (
              <ListItem
                key={linkItem.id}
                onClick={() => navigateToPage(linkItem.to)}
                className={`gap-4 ${
                  pathname === linkItem.to ? "text-gray-100" : "text-gray-500"
                }`}
              >
                <Icon icon={linkItem.iconName} className="text-lg" />
                {linkItem.label}
              </ListItem>
            ))}
          </List>

          <List>
            <ListItem className="gap-4 text-gray-100" onClick={() => {}}>
              <WalletMultiButton />
            </ListItem>
          </List>
        </div>
      </Drawer>
    </nav>
  );
}
