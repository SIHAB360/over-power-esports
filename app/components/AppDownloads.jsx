"use client";
import {FaAndroid,FaApple,FaDownload,FaShieldAlt,FaBolt} from "react-icons/fa";
import styles from "./AppDownloads.module.css";

export default function AppDownloads(){
 return <section id="download-app" className={styles.section} aria-labelledby="op-app-download-title">
  <div className={styles.glow} aria-hidden="true"/>
  <div className={styles.heading}>
   <span className={styles.eyebrow}><FaBolt/> OFFICIAL OVER POWER SOFTWARE</span>
   <h2 id="op-app-download-title">DOWNLOAD <em>OUR APP</em></h2>
   <p>Your matches, squad, alerts and wallet — one powerful esports experience.</p>
  </div>
  <div className={styles.cards}>
   <article className={styles.card}>
    <div className={styles.cardTop}><span className={styles.platformIcon}><FaAndroid/></span><span className={styles.ready}><i/> AVAILABLE NOW</span></div>
    <span className={styles.platform}>ANDROID EDITION</span>
    <h3>OVER POWER <span>ESPORTS</span></h3>
    <p>Official Android App <b>v1.3.0</b></p>
    <div className={styles.features}><span><FaShieldAlt/> Official release</span><span><FaBolt/> One-tap APK download</span></div>
    <a className={styles.download} href="/api/download/android" download="over-power-esports.apk" aria-label="Download OVER POWER ESPORTS Android APK"><FaDownload/> DOWNLOAD FOR ANDROID <span>↗</span></a>
    <small>Android APK · Direct download · Free</small>
   </article>
   <article className={styles.card+" "+styles.coming}>
    <div className={styles.cardTop}><span className={styles.platformIcon}><FaApple/></span><span className={styles.soon}>COMING SOON</span></div>
    <span className={styles.platform}>APPLE EDITION</span>
    <h3>OVER POWER <span>ESPORTS</span></h3>
    <p>iPhone experience is in preparation.</p>
    <div className={styles.features}><span><FaShieldAlt/> Same secure account</span><span><FaBolt/> Same match center</span></div>
    <button type="button" className={styles.disabled} disabled><FaApple/> iOS VERSION COMING SOON</button>
    <small>iPhone · Not yet released</small>
   </article>
  </div>
  <div className={styles.footnote}><FaShieldAlt/> Only download the official OVER POWER ESPORTS application from this website.</div>
 </section>;
}
