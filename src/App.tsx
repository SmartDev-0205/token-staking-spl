import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import Loading from "./components/Loading";
import { ToastContainer } from "react-toastify";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import Routes from "./Routes";

const endpoint =
  process.env.REACT_APP_SOLANA_RPC_HOST || "https://api.devnet.solana.com";

function App() {
  const phantomWallet = new PhantomWalletAdapter();
  return (
    <BrowserRouter>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[phantomWallet]}>
          <WalletModalProvider>
            <Suspense fallback={<Loading />}>
              <Routes />
              <ToastContainer className="!z-[99999]" />
            </Suspense>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  );
}

export default App;
