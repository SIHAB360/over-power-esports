// A capability is grantable only when its server-side RPC exists and is guarded.
// Admin may preview all sections, but incomplete money/approval capabilities fail closed.
export const MODERATOR_SECTIONS = Object.freeze([
  {id:"matches",label:"Match Center",description:"Full match command center, result calculation and earnings with explicit finance approval",actions:["view","create","edit","approve"]},
  {id:"players",label:"Players",description:"Player directory and public profile details",actions:["view"]},
  {id:"teams",label:"Teams",description:"Team details and roster overview",actions:["view","create","edit"]},
  {id:"tournaments",label:"Tournaments",description:"Tournament scheduling and registration with explicit finance approval",actions:["view","create","edit","approve"]},
  {id:"earnings",label:"Player Earnings",description:"Read-only financial records; edits are restricted",actions:["view"]},
  {id:"withdrawals",label:"Withdrawals",description:"Read-only payout overview; private payment details are hidden",actions:["view"]},
  {id:"profit",label:"Profit & Finance",description:"Read-only financial records; edits are restricted",actions:["view"]},
  {id:"verification",label:"Verification",description:"Read-only verification overview; approvals are restricted",actions:["view"]},
  {id:"achievements",label:"Achievements",description:"Achievement overview; publishing is restricted",actions:["view"]},
  {id:"registration_codes",label:"Registration Codes",description:"Unavailable until a secured backend is ready",actions:[]},
]);
export const MODERATOR_ACTIONS=Object.freeze(["view","create","edit","delete","approve","export"]);
export const ACTION_LABELS=Object.freeze({view:"View",create:"Create",edit:"Edit",delete:"Delete",approve:"Approve",export:"Export"});
export const SECTION_IDS=new Set(MODERATOR_SECTIONS.map(s=>s.id));
export const ACTION_IDS=new Set(MODERATOR_ACTIONS);
export function isSupportedModeratorAction(section,action){return Boolean(MODERATOR_SECTIONS.find(s=>s.id===section)?.actions.includes(action));}
export function normalizeModeratorGrants(input){
  if(!Array.isArray(input)||input.length>60)throw new Error("Invalid permission list");
  const bySection=new Map();
  for(const item of input){
    if(!item||typeof item!=="object"||!SECTION_IDS.has(item.section)||!ACTION_IDS.has(item.action))throw new Error("Invalid section or action");
    if(!isSupportedModeratorAction(item.section,item.action))throw new Error("Section action is not supported by secure backend");
    const current=bySection.get(item.section)||new Set();current.add(item.action);bySection.set(item.section,current);
  }
  for(const actions of bySection.values())if(actions.size>0&&!actions.has("view"))throw new Error("View permission required for each section");
  return [...bySection.entries()].flatMap(([section,actions])=>[...actions].map(action=>({section,action})));
}
