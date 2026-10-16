.op-vip-footer__made {color:#aca5b9;}
        .op-vip-footer__made b {margin-left:7px;color:#ffd89a;}
        .op-vip-footer__to-top {
          display:inline-flex;align-items:center;gap:12px;cursor:pointer;color:#eae7f3 !important;
          background:none;border:0;padding:9px 0;font:inherit;letter-spacing:inherit;
          transition:color .2s ease;
        }
        .op-vip-footer__to-top:hover {color:#fff !important;}
        .op-vip-footer__to-top span {font-size:19px;color:#8be8ff;transition:transform .2s ease;}
        .op-vip-footer__to-top:hover span {transform:translateY(-4px);}
        .op-vip-footer a:focus-visible,.op-vip-footer button:focus-visible {outline:2px solid #83e7ff;outline-offset:5px;}
        @keyframes opVipScan {from{transform:translateX(0)}to{transform:translateX(295%)}}
        @keyframes opVipAurora {to{opacity:.58;transform:scale(1.15) translateY(14px)}}
        @keyframes opVipSpin {to{transform:rotate(360deg)}}
        @keyframes opVipDot {50%{opacity:.45;box-shadow:0 0 0 7px rgba(107,243,214,.04),0 0 9px rgba(107,243,214,.85)}}
        @keyframes opVipShine {0%,20%,100%{transform:translateX(-130%)}50%,68%{transform:translateX(130%)}}
        /* RESPONSIVE: Fix the cramped two-column layout seen on phones. */
        @media (max-width:1100px) {
          .op-vip-footer {padding-left:clamp(18px,4vw,40px);padding-right:clamp(18px,4vw,40px);}
          .op-vip-footer__main {
            display:grid;
            grid-template-columns:minmax(0,1fr);
            gap:36px;
            padding:42px 0 45px;
          }
          .op-vip-footer__brand,
          .op-vip-footer__navigation,
          .op-vip-footer__feature-shell {
            width:100%;max-width:100%;min-width:0;grid-column:auto;
          }
          .op-vip-footer__description {max-width:550px;margin:23px 0 23px;}
          .op-vip-footer__navigation {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:clamp(12px,6vw,46px);
            padding:24px clamp(12px,3vw,28px);
            border:1px solid rgba(255,255,255,.09);
            border-radius:22px;
            background:rgba(255,255,255,.022);
          }
          .op-vip-footer__nav-group {gap:4px;}
          .op-vip-footer__nav-group h3 {margin-bottom:14px;}
          .op-vip-footer__link {font-size:14px;line-height:1.4;min-height:39px;}
          .op-vip-footer__feature-shell {margin:0;}
          .op-vip-footer__feature {min-height:225px;}
          .op-vip-footer__bottom {gap:20px;}
        }
        @media (max-width:710px) {
          .op-vip-footer {padding:0 18px;margin-top:16px;}
          .op-vip-footer__overline {
            display:flex;flex-direction:column;align-items:flex-start;
            gap:12px;padding:21px 0 19px;
          }
          .op-vip-footer__live,.op-vip-footer__overline-right {
            font-size:10px;letter-spacing:1.4px;gap:9px;
          }
          .op-vip-footer__main {gap:26px;padding:32px 0 34px;}
          .op-vip-footer__identity {gap:14px;max-width:100%;}
          .op-vip-footer__logo-orbit {width:76px;height:76px;}
          .op-vip-footer__logo-circle {width:66px;height:66px;}
          .op-vip-footer__wordmark-top {font-size:clamp(17px,4.8vw,24px);letter-spacing:1.1px;}
          .op-vip-footer__wordmark-bottom {font-size:clamp(19px,5vw,25px);letter-spacing:3px;}
          .op-vip-footer__description {margin:19px 0 20px;font-size:13px;line-height:1.8;}
          .op-vip-footer__join {min-height:50px;}
          .op-vip-footer__mini-line {margin-top:18px;letter-spacing:1.1px;font-size:9px;}
          .op-vip-footer__navigation {
            padding:20px 14px;gap:12px;
            border-radius:18px;
          }
          .op-vip-footer__nav-group h3 {font-size:10px;letter-spacing:1.4px;}
          .op-vip-footer__link {font-size:12px;min-height:37px;padding-right:0;gap:7px;}
          .op-vip-footer__link-indicator {font-size:12px;flex:none;}
          .op-vip-footer__feature-shell {width:100%;}
          .op-vip-footer__feature {min-height:210px;padding:24px 21px;}
          .op-vip-footer__feature h2 {font-size:clamp(32px,9vw,42px);margin-top:20px;}
          .op-vip-footer__feature-divider {margin:19px 0 13px;}
          .op-vip-footer__slogan {
            justify-content:center;gap:9px;
            padding:19px 0;
            font-size:10px;letter-spacing:1.7px;line-height:1.8;
          }
          .op-vip-footer__bottom {
            display:flex;flex-direction:column;align-items:center;
            justify-content:center;gap:12px;
            padding:22px 0 30px;text-align:center;
            font-size:10px;letter-spacing:.6px;line-height:1.7;
          }
          .op-vip-footer__made {display:block;}
          .op-vip-footer__to-top {min-height:42px;}
        }
        @media (max-width:390px) {
          .op-vip-footer {padding:0 14px;}
          .op-vip-footer__identity {gap:10px;}
          .op-vip-footer__logo-orbit {width:66px;height:66px;}
          .op-vip-footer__logo-circle {width:56px;height:56px;}
          .op-vip-footer__wordmark-top {font-size:16px;letter-spacing:.5px;}
          .op-vip-footer__wordmark-bottom {font-size:18px;letter-spacing:2px;}
          .op-vip-footer__navigation {gap:8px;padding:18px 11px;}
          .op-vip-footer__nav-group h3 {font-size:9px;letter-spacing:1.2px;}
          .op-vip-footer__link {font-size:11.5px;}
          .op-vip-footer__slogan {font-size:9px;letter-spacing:1.1px;}
        }
        @media(prefers-reduced-motion:reduce) {
          .op-vip-footer *, .op-vip-footer *::before, .op-vip-footer *::after {animation:none !important;transition:none !important;}
        }
      `}</style>
    </footer>
  );
}
