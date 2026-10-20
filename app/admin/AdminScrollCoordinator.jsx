'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

// Only the links in the middle of the admin rail scroll. Branding and the
// connection/logout footer never move, even on shorter laptop viewports.
// Do not sync the menu with content or redirect wheel events to the right.
export default function AdminScrollCoordinator(){
  const pathname=usePathname();

  useEffect(()=>{
    const root=document.querySelector('.op-admin-route-layout');
    if(!root)return;
    const dashboard=pathname==='/admin/dashboard';
    const menu=dashboard
      ? root.querySelector('[data-op-nav-scroll]')
      : root.querySelector('.op-admin-route-links');
    if(!menu)return;

    let frame=0;
    const showActive=()=>{
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        const active=menu.querySelector(
          dashboard ? '[data-op-admin-nav-item][data-op-active="true"]'
            : '.op-admin-route-link.active'
        );
        if(!active)return;
        const navBox=menu.getBoundingClientRect();
        const itemBox=active.getBoundingClientRect();
        const padding=7;
        if(itemBox.bottom>navBox.bottom-padding)
          menu.scrollTop+=itemBox.bottom-navBox.bottom+padding;
        else if(itemBox.top<navBox.top+padding)
          menu.scrollTop-=navBox.top-itemBox.top+padding;
      });
    };

    // Switching dashboard sections (or using a keyboard) keeps the active
    // menu item in view. All other scrolling is native wheel/touch/trackpad.
    const observer=new MutationObserver(records=>{
      if(records.some(r=>r.attributeName==='data-op-active'||r.attributeName==='class'))
        showActive();
    });
    observer.observe(menu,{subtree:true,attributes:true,attributeFilter:['data-op-active','class']});
    menu.addEventListener('focusin',showActive);
    showActive();
    return()=>{
      cancelAnimationFrame(frame);
      observer.disconnect();
      menu.removeEventListener('focusin',showActive);
    };
  },[pathname]);

  return null;
}
