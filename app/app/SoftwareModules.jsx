'use client';
import dynamic from 'next/dynamic';

const panels={
 schedule:dynamic(()=>import('../admin/match-schedule/page'),{ssr:false}),
 players:dynamic(()=>import('../admin/players/page'),{ssr:false}),
 roster:dynamic(()=>import('../admin/roster/page'),{ssr:false}),
 matches:dynamic(()=>import('../admin/matches/page'),{ssr:false}),
 teams:dynamic(()=>import('../admin/teams/page'),{ssr:false}),
 tournaments:dynamic(()=>import('../admin/tournaments/page'),{ssr:false}),
 profit:dynamic(()=>import('../admin/profit/page'),{ssr:false}),
 achievements:dynamic(()=>import('../admin/achievements/page'),{ssr:false}),
 withdrawals:dynamic(()=>import('../admin/dashboard/WithdrawalManagement'),{ssr:false}),
 visitors:dynamic(()=>import('../admin/visitors/page'),{ssr:false}),
 moderators:dynamic(()=>import('../admin/moderators/page'),{ssr:false}),
};
const Wallet=dynamic(()=>import('./EnglishPlayerWithdrawal'),{ssr:false});
export function AdminModule({module}){
 const Component=panels[module];
 if(!Component)return <div role="alert">এই Modulesটি পাওয়া যায়নি।</div>;
 return <div className="op-software-module" data-module={module}><Component/></div>;
}
export function PlayerWallet(){
 return <div className="op-software-wallet" aria-label="Secure player wallet and withdrawals"><Wallet/></div>;
}
