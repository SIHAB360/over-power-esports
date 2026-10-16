margin-top: 42px; padding: 0 24px; color: #faf9ff;
          background: linear-gradient(155deg, #110910 0%, #06060d 58%, #071019 100%);
          border-top: 1px solid rgba(255, 210, 155, .22);
          font-family: Arial, Helvetica, sans-serif;
        }
        .op-footer:before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #fd4b72, #ffcf80, #7ee7f5, transparent);
          box-shadow: 0 0 23px rgba(255, 99, 132, .4); pointer-events: none;
        }
        .ambient { position: absolute; z-index: -1; width: 500px; height: 400px; border-radius: 50%; filter: blur(85px); pointer-events: none; }
        .ambient-red { top: -200px; left: -180px; background: rgba(255, 40, 94, .18); }
        .ambient-blue { right: -180px; bottom: -180px; background: rgba(24, 206, 228, .13); }
        .footer-inner { width: 100%; max-width: 1400px; margin: 0 auto; }
        .eyebrow {
          display: flex; justify-content: space-between; align-items: center;
          gap: 15px; min-height: 72px; border-bottom: 1px solid rgba(255,255,255,.10);
          font-size: 10px; font-weight: 800; letter-spacing: 2px;
        }
        .online { display: inline-flex; align-items: center; gap: 9px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #60f0cd; box-shadow: 0 0 14px #60f0cd; }
        .motto { color: #beb4ce; }
        .footer-content {
          display: grid; grid-template-columns: minmax(0, 1.13fr) minmax(0, .95fr) minmax(0, .95fr);
          align-items: start; gap: clamp(24px, 4vw, 72px); padding: 64px 0 58px;
        }
        .brand, .footer-nav, .feature-border { min-width: 0; }
        .brand-link { display: flex; align-items: center; gap: 16px; width: fit-content; max-width: 100%; text-decoration: none; color: white; }
        .logo-ring {
          flex: 0 0 91px; width: 91px; height: 91px; border-radius: 50%; padding: 4px;
          background: conic-gradient(#ffd98c, #ff5e86, #bda1ff, #7debfa, #ffd98c);
          box-shadow: 0 0 22px rgba(255, 105, 153, .24);
        }
        .logo-mask { display: flex; align-items: center; justify-content: center; overflow: hidden; width: 100%; height: 100%; border-radius: 50%; background: #0a0a12; }
        .logo-mask :global(img) { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .brand-text { min-width: 0; display: flex; flex-direction: column; gap: 5px; font-weight: 900; line-height: 1.1; }
        .brand-text strong { font-size: clamp(20px, 2.1vw, 27px); letter-spacing: 1.2px; white-space: nowrap; }
        .brand-text > span { font-size: clamp(20px, 2.1vw, 28px); letter-spacing: 4px; background: linear-gradient(90deg, #ff678c, #ffd891); color: transparent; background-clip: text; -webkit-background-clip: text; }
        .description { max-width: 370px; margin: 26px 0; color: #bab3c6; font-size: 14px; line-height: 1.8; }
        .join-button { display: inline-flex; align-items: center; gap: 30px; min-height: 51px; padding: 6px 7px 6px 21px; border: 1px solid rgba(255,218,151,.65); border-radius: 40px; background: rgba(255,80,119,.12); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 1.4px; text-decoration: none; }
        .join-button > span { display: grid; place-items: center; width: 37px; height: 37px; border-radius: 50%; background: linear-gradient(135deg,#ffd68c,#ff6489); color: #230f1c; font-size: 25px; }
        .brand-caption { margin: 20px 0 0; color: #afa2b8; font-size: 10px; letter-spacing: 1.3px; }
        .footer-nav { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 20px; padding-top: 8px; }
        .nav-column { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
        .nav-column h3 { margin: 0 0 20px; font-size: 11px; letter-spacing: 2px; font-weight: 900; color: #ffdda4; }
        .nav-column h3:before { content: ""; display: inline-block; vertical-align: middle; width: 13px; height: 2px; margin-right: 8px; background: #ff6386; }
        .nav-column :global(a) { display: flex; align-items: center; gap: 9px; min-height: 40px; color: #d1cbdc; text-decoration: none; font-size: 13px; line-height: 1.4; }
        .nav-column :global(a:hover) { color: white; }
        .nav-column :global(a span) { color: #7ce7f7; }
        .feature-border { padding: 1px; border-radius: 25px; background: linear-gradient(135deg, #ffce8d, rgba(255,255,255,.08), #9484fa, #82edfa); }
        .feature { position: relative; overflow: hidden; min-height: 265px; padding: 28px; border-radius: 24px; background: linear-gradient(140deg, #211b32, #090d18 87%); }
        .feature-kicker { color: #91edfa; font-size: 10px; letter-spacing: 1.1px; font-weight: 800; }
        .feature h2 { position: relative; z-index: 1; margin: 23px 0 17px; color: #fff; font-size: clamp(35px, 3vw, 44px); font-style: normal; font-weight: 900; line-height: 1.06; }
        .feature h2 em { font-style: normal; color: #ff9ca2; background: linear-gradient(90deg,#ffd0a0,#ff638a,#8beafa); color: transparent; background-clip: text; -webkit-background-clip: text; }
        .feature-line { height: 1px; background: linear-gradient(90deg,#ff789c,#ffe0ac,#77e3fa,transparent); }
        .feature p { position: relative; z-index: 1; margin: 15px 0 0; color: #bbb4c9; font-size: 12px; line-height: 1.7; }
        .feature-watermark { position: absolute; right: 15px; bottom: -16px; font-size: 100px; font-weight: 900; letter-spacing: -11px; color: rgba(255,255,255,.035); }
        .slogan { display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; padding: 20px 0; border-block: 1px solid rgba(255,255,255,.10); color: #e1dce8; font-size: 12px; letter-spacing: 3px; font-weight: 900; text-align: center; }
        .slogan span { color: #ffd89d; }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 28px 0; color: #a9a1b3; font-size: 10px; font-weight: 700; letter-spacing: .8px; }
        .footer-bottom .made b { color: #ffd58e; }
        .footer-bottom button { display: inline-flex; align-items: center; gap: 9px; background: none; color: #e9e4f0; border: 0; padding: 8px; font: inherit; cursor: pointer; }
        .footer-bottom button span { color: #82e9fa; font-size: 19px; }
        .op-footer :global(a:focus-visible), .op-footer button:focus-visible { outline: 2px solid #7deafe; outline-offset: 4px; }
        @media (max-width: 1100px) {
          .footer-content { grid-template-columns: 1fr 1fr; gap: 36px; }
          .feature-border { grid-column: 1 / -1; width: min(100%, 680px); margin: 0 auto; }
        }
        @media (max-width: 760px) {
          .op-footer { padding: 0 20px; margin-top: 35px; }
          .eyebrow { min-height: 85px; flex-direction: column; justify-content: center; gap: 8px; font-size: 10px; text-align: center; }
          .motto { font-size: 9px; letter-spacing: 1.1px; }
          .footer-content { display: flex; flex-direction: column; align-items: stretch; gap: 29px; padding: 37px 0 40px; }
          .brand { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .brand-link { justify-content: center; gap: 13px; }
          .logo-ring { width: 77px; height: 77px; flex-basis: 77px; }
          .brand-text { text-align: left; }
          .brand-text strong { font-size: clamp(17px, 4.7vw, 22px); letter-spacing: 1px; }
          .brand-text > span { font-size: clamp(18px, 5vw, 22px); letter-spacing: 3px; }
          .description { margin: 20px auto; font-size: 14px; }
          .brand-caption { margin-top: 18px; }
          .footer-nav { width: 100%; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; padding: 21px 15px; border-radius: 20px; border: 1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.035); }
          .nav-column { align-items: flex-start; }
          .nav-column h3 { margin-bottom: 9px; font-size: 11px; letter-spacing: 1.1px; }
          .nav-column :global(a) { min-height: 42px; font-size: 13px; }
          .feature-border { width: 100%; max-width: 100%; }
          .feature { min-height: 220px; padding: 26px 22px; }
          .feature h2 { font-size: clamp(34px, 9vw, 42px); }
          .slogan { gap: 9px; padding: 16px 0; font-size: 10px; letter-spacing: 1.2px; }
          .footer-bottom { flex-direction: column; text-align: center; gap: 12px; padding: 24px 0 30px; line-height: 1.6; font-size: 10px; }
          .footer-bottom button { justify-content: center; min-height: 40px; padding: 7px 15px; border: 1px solid rgba(126,233,250,.3); border-radius: 20px; }
        }
        @media (max-width: 360px) {
          .op-footer { padding: 0 14px; }
          .footer-nav { padding: 18px 10px; gap: 7px; }
          .nav-column h3 { font-size: 10px; letter-spacing: .5px; }
          .nav-column :global(a) { font-size: 12px; }
          .slogan { font-size: 9px; letter-spacing: .6px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .join-button, .nav-column :global(a) { transition: none; }
        }
      `}</style>
    </footer>
  );
}
