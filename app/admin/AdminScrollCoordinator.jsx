'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

// Keep navigation visually stationary. When it is taller than a small laptop
// screen, reveal the remaining items as the RIGHT content is scrolled.
// No independent sidebar scrollbar, no extra up/down navigation buttons.
export default function AdminScrollCoordinator(){
  const pathname=usePathname();
  useEffect(()=>{
    const root=document.querySelector('.op-admin-route-layout');
    if(!root)return;
    const dashboard=pathname==='/admin/dashboard';
    const scroller=dashboard
      ? root.querySelector('[data-op-right-scroll]')
      : root.querySelector('.op-admin-view');
    const sidebar=dashboard
      ? root.querySelector('[data-op-sidebar]')
      : root.querySelector('.op-admin-route-sidebar');
    const menu=dashboard
      ? root.querySelector('[data-op-nav-scroll]')
      : root.querySelector('.op-admin-route-links');
    if(!scroller||!sidebar||!menu)return;
    let frame=0;
    const sync=()=>{
      if(frame)cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        const leftExtra=Math.max(0,menu.scrollHeight-menu.clientHeight);
        const rightExtra=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
        // Never scroll a menu that already fits.
        if(leftExtra<2){menu.scrollTop=0;return;}
        const share=rightExtra>0 ? Math.min(1,scroller.scrollTop/rightExtra) : 0;
        menu.scrollTop=leftExtra*share;
      });
    };
    const forwardWheel=(event)=>{
      // Full-height desktop sidebar stays fixed. Wheel motions operate the
      // content on the RIGHT even when the pointer sits over the left rail.
      if(window.matchMedia('(max-width:900px)').matches)return;
      if(Math.abs(event.deltaY)<1)return;
      event.preventDefault();
      scroller.scrollTop+=event.deltaY;
    };
    const onFocus=(event)=>{
      const target=event.target;
      if(!(target instanceof HTMLElement)||!menu.contains(target))return;
      // Keyboard access must still reach every item on short displays.
      const a=target.getBoundingClientRect(),b=menu.getBoundingClientRect();
      if(a.bottom>b.bottom)menu.scrollTop+=a.bottom-b.bottom+6;
      if(a.top<b.top)menu.scrollTop-=b.top-a.top+6;
    };
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(sync):null;
    observer?.observe(scroller);observer?.observe(menu);
    scroller.addEventListener('scroll',sync,{passive:true});
    sidebar.addEventListener('wheel',forwardWheel,{passive:false});
    menu.addEventListener('focusin',onFocus);
    window.addEventListener('resize',sync,{passive:true});
    sync();
    return()=>{
      if(frame)cancelAnimationFrame(frame);
      observer?.disconnect();
      scroller.removeEventListener('scroll',sync);
      sidebar.removeEventListener('wheel',forwardWheel);
      menu.removeEventListener('focusin',onFocus);
      window.removeEventListener('resize',sync);
    };
  },[pathname]);
  return null;
}
