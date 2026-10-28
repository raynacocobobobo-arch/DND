import { useId } from "react";

/** Original vector ornaments inspired by the heraldic language of the supplied reference.
 * Designed as real scalable UI elements, never a flattened screen background. */
export function FleurDeLis({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 80" fill="none" aria-hidden="true">
      <path d="M32 5c-3 9-11 14-11 24 0 6 4 10 11 14 7-4 11-8 11-14C43 19 35 14 32 5Z" fill="currentColor"/>
      <path d="M14 22C-1 24 2 42 15 49c-4-9 2-16 10-15C21 28 18 25 14 22Zm36 0c15 2 12 20-1 27 4-9-2-16-10-15 4-6 7-9 11-12Z" fill="currentColor"/>
      <path d="M17 43h30v7H17zM30 49h4v22h-4z" fill="currentColor"/>
      <path d="M32 71c-9 0-13-4-16-10 5 3 10 5 16 5s11-2 16-5c-3 6-7 10-16 10Z" fill="currentColor"/>
      <path d="M32 8c-3 13-4 19-4 30M12 30c-3 7 0 11 4 14m36-14c3 7 0 11-4 14" stroke="currentColor" strokeOpacity=".24" strokeWidth="1.3"/>
    </svg>
  );
}
export function HeraldicDivider({ className = "" }: { className?: string }) {
  return <span className={`heraldic-divider ${className}`} aria-hidden="true"><span /><FleurDeLis size={16}/><span /></span>;
}
export function CathedralScene({ className = "" }: { className?: string }) {
  const suffix = useId().replace(/:/g, "");
  const moon = `moon-${suffix}`;
  const sky = `sky-${suffix}`;
  return (
    <svg className={className} viewBox="0 0 960 410" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={moon}><stop stopColor="#F3D895"/><stop offset=".72" stopColor="#CDA95F"/><stop offset="1" stopColor="#A77C41"/></radialGradient>
        <linearGradient id={sky} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#223846"/><stop offset="1" stopColor="#0B1620"/></linearGradient>
      </defs>
      <path fill={`url(#${sky})`} d="M0 0h960v410H0z"/>
      <g opacity=".28" stroke="#D6B879" strokeWidth=".8">
        <path d="M0 94h960M0 266h960M105 0v410M340 0v410M680 0v410M880 0v410"/>
        <circle cx="585" cy="191" r="185" strokeDasharray="2 9"/>
        <circle cx="585" cy="191" r="153"/>
        <path d="M400 191h370M585 6v370"/>
      </g>
      <circle cx="585" cy="190" r="145" fill={`url(#${moon})`} opacity=".92"/>
      <circle cx="585" cy="190" r="129" stroke="#FFF4C6" strokeOpacity=".37"/>
      <g fill="#15242E" stroke="#BDA36E" strokeOpacity=".35" strokeWidth="1.1">
        <path d="M438 410V235h26V178l17-36 17 36v57h22v175H438Zm20-175h40v-52l-17-32-17 32v52Z"/>
        <path d="M516 410V189h15v-48l18-49 18 49v48h14v221h-65Z"/>
        <path d="M576 410V155h16v-53l20-70 20 70v53h19v255h-75Z"/>
        <path d="M647 410V217h21v-42l17-41 17 41v42h18v193h-73Z"/>
        <path d="M711 410V260h23v-39l13-29 13 29v39h19v150h-68Z"/>
        <path d="M787 410V201h17v-62l17-58 17 58v62h18v209h-69Z"/>
        <path d="M420 410V317h450v93z"/>
      </g>
      <g fill="#D3B77B" opacity=".43">
        <path d="M544 225c0-18 14-27 17-27s17 9 17 27v57h-34v-57Zm55-55c0-16 11-25 14-25s14 9 14 25v55h-28v-55Zm203 85c0-15 11-23 14-23s14 8 14 23v46h-28v-46Z"/>
        <path d="M545 306h33v5h-33zm55-58h27v5h-27zm203 76h27v5h-27z"/>
      </g>
      <g stroke="#9F7E50" strokeWidth="2" opacity=".75"><path d="M612 29V0m-8 14h16m-7 17 0 9M818 80V56m-8 12h16M481 142v-17m-8 9h16"/></g>
      <g fill="#D5B571" opacity=".7">
        <path d="M64 50v8m-4-4h8m-4 0-3-3m3 3 3 3M861 80v12m-6-6h12M385 63v10m-5-5h10M917 242v12m-6-6h12"/>
        <circle cx="303" cy="161" r="2.5"/><circle cx="880" cy="178" r="2"/><circle cx="159" cy="232" r="2"/>
      </g>
      <path d="M724-48C772 11 780 49 837 77c65 32 109 18 148 57v71C917 161 887 168 819 126 751 84 742 29 691-10Z" fill="#862D2C" opacity=".92"/>
      <path d="M695-38c72 51 80 85 142 107 51 19 87 10 123 30v29C884 98 843 119 786 87 731 55 723 23 677-2Z" fill="#F0E0C5" opacity=".86"/>
      <path d="M-24 331c77-41 133-35 198 11s96 25 140 68H164C82 369 42 375-24 410Z" fill="#8F302C" opacity=".84"/>
      <path d="M-17 351c81-20 112-12 180 27 29 17 58 21 79 32h-70C111 387 55 372-17 391Z" fill="#F3E4CB" opacity=".67"/>
      <rect y="395" width="960" height="15" fill="#0B151C" opacity=".65"/>
    </svg>
  );
}
