// A capability is grantable only when its server-side RPC exists and is guarded.
// Admin may preview all sections, but incomplete money/approval capabilities fail closed.
export const MODERATOR_SECTIONS = Object.freeze([
  {id:"matches",label:"ম্যাচ সেন্টার",description:"ম্যাচের সময়সূচি ও সাধারণ তথ্য",actions:["view","create","edit"]},
  {id:"players",label:"প্লেয়ার ম্যানেজমেন্ট",description:"প্লেয়ারের প্রকাশ্য তথ্য",actions:["view"]},
  {id:"teams",label:"টিম ম্যানেজমেন্ট",description:"টিমের সাধারণ তথ্য",actions:["view","create","edit"]},
  {id:"tournaments",label:"টুর্নামেন্ট",description:"টুর্নামেন্টের সাধারণ তথ্য",actions:["view","create","edit"]},
  {id:"earnings",label:"প্লেয়ার আর্নিংস",description:"শুধু পড়ার অনুমতি; কোনো আর্থিক পরিবর্তন নয়",actions:["view"]},
  {id:"withdrawals",label:"উত্তোলন",description:"মোবাইল নম্বর ছাড়াই পেমেন্ট সারাংশ দেখুন",actions:["view"]},
  {id:"profit",label:"প্রফিট ও ফাইন্যান্স",description:"শুধু পড়ার অনুমতি; কোনো আর্থিক পরিবর্তন নয়",actions:["view"]},
  {id:"verification",label:"ভেরিফিকেশন",description:"ভেরিফিকেশন সারাংশ; অনুমোদন দেওয়া যাবে না",actions:["view"]},
  {id:"achievements",label:"অ্যাচিভমেন্ট",description:"অ্যাচিভমেন্টের তালিকা; আপলোড বন্ধ",actions:["view"]},
  {id:"registration_codes",label:"রেজিস্ট্রেশন কোড",description:"সেটিংস — নিরাপত্তা সংযোগ অপেক্ষমাণ",actions:[]},
]);
export const MODERATOR_ACTIONS=Object.freeze(["view","create","edit","delete","approve","export"]);
export const ACTION_LABELS=Object.freeze({view:"দেখা",create:"তৈরি",edit:"এডিট",delete:"ডিলিট",approve:"অনুমোদন",export:"রিপোর্ট"});
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
