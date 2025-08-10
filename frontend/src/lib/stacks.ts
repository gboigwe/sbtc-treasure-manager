import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksNetwork, STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const network = process.env.NODE_ENV === 'production' 
  ? STACKS_MAINNET 
  : STACKS_TESTNET;

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'sBTC Treasury Manager',
      icon: window.location.origin + '/logo.svg',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
};

export const getUserData = () => {
  return userSession.loadUserData();
};

export const isUserSignedIn = () => {
  return userSession.isUserSignedIn();
};

export const signOut = () => {
  userSession.signUserOut();
  window.location.reload();
};