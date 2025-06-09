import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: '$CIGAR Smoketron Interface',
  projectId: '3bf26c277abb57e44af9fcc2121db184', // Get this from https://cloud.walletconnect.com
  chains: [base, baseSepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});