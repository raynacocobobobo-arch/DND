import { MedievalCrest } from "./MedievalCrest";

/** Hand-drawn, scalable medieval escutcheons. Legacy icon keys are preserved. */
const alias: Record<string,string> = {
 folder:"scroll",briefcase:"swords",suitcase:"compass",house:"tower",home:"tower",
 "shopping-cart":"coins","shopping-bag":"coins","book-open":"book",book:"book",
 dumbbell:"axes",plane:"compass",film:"lyre",heart:"heart",sparkles:"star",
 calendar:"hourglass",grid:"quarter",inbox:"chest",ai:"star",
 add:"star",plus:"star",edit:"quill",copy:"scroll",trash:"torch",
 arrow:"arrow",drag:"drag",logout:"key",upload:"scroll",reset:"hourglass",send:"arrow",
 feather:"quill",gamepad:"dragon","gamepad-2":"dragon"
};
function device(key:string) {
 switch(alias[key]??key) {
 case "swords": return <g><path d="M18 17 46 49M46 17 18 49M15 13l11 5-6 6-5-11Zm34 0-11 5 6 6 5-11Z" strokeWidth="2.7"/><path d="m15 49 8 8m26-8-8 8" strokeWidth="3"/></g>;
 case "compass": return <g><circle cx="32" cy="34" r="16" strokeWidth="2"/><path d="M32 13v7m0 28v7M11 34h7m28 0h7" strokeWidth="2"/><path d="m32 20 6 14-6 13-6-13 6-14Z" fill="currentColor" fillOpacity=".23" strokeWidth="2"/><circle cx="32" cy="34" r="2" fill="currentColor"/></g>;
 case "tower": return <g><path d="M18 50V25h7v-7h6v7h4v-7h6v7h5v25H18Z" strokeWidth="2.5"/><path d="M28 50V39c0-5 8-5 8 0v11M18 31h28M24 35h4m8 0h4" strokeWidth="2.2"/></g>;
 case "coins": return <g><path d="M20 32c-5 11 0 20 12 20s17-9 12-20l-5-4H25l-5 4Z" strokeWidth="2.6"/><path d="M24 27c4-7 12-7 16 0m-8-5v-7m-6 18 6 5 6-5m-6 5v9" strokeWidth="2.3"/></g>;
 case "book": return <g><path d="M32 21c-7-5-12-6-19-4v29c8-3 14-2 19 2 5-4 11-5 19-2V17c-7-2-12-1-19 4Z" strokeWidth="2.5"/><path d="M32 21v27M17 23c6-1 9 0 12 2m6 0c3-2 6-3 12-2M18 33h10m8 0h10" strokeWidth="2"/></g>;
 case "axes": return <g><path d="m20 17 25 34M44 17 19 51M15 14c9 0 12 6 12 12-7 0-13-4-12-12Zm34 0c-9 0-12 6-12 12 7 0 13-4 12-12Z" strokeWidth="2.7"/></g>;
 case "lyre": return <g><path d="M22 21c-9 0-10 13-5 21 4 7 10 10 15 10s11-3 15-10c5-8 4-21-5-21-3 5-5 7-10 7s-7-2-10-7Z" strokeWidth="2.6"/><path d="M24 29v19m8-20v23m8-22v19" strokeWidth="1.8"/></g>;
 case "heart": return <path d="M32 51 17 37c-10-10 1-24 15-12 14-12 25 2 15 12L32 51Z" strokeWidth="3"/>;
 case "star": return <g><path d="m32 14 5 13 14 5-14 5-5 14-5-14-14-5 14-5 5-13Z" strokeWidth="2.8"/><circle cx="32" cy="32" r="3" fill="currentColor"/></g>;
 case "hourglass": return <g><path d="M21 16h22M21 52h22M24 18c0 10 8 10 8 15s-8 5-8 17m16-32c0 10-8 10-8 15s8 5 8 17" strokeWidth="2.6"/></g>;
 case "dragon": return <g><path d="M15 43c5-13 15-13 18-21 3 4 8 5 11 3-1 6 4 8 7 10l-8 1-4 9-12 5-7-5-5-2Z" strokeWidth="2.7"/><path d="m28 30-4-10-4 10m18 0 5-9" strokeWidth="2"/><circle cx="40" cy="31" r="2" fill="currentColor"/></g>;
 case "quarter": return <g><path d="m32 15 8 12-8 11-8-11 8-12Zm0 24 8 8-8 8-8-8 8-8Zm-12-11-8 8 8 9 8-9-8-8Zm24 0-8 8 8 9 8-9-8-8Z" strokeWidth="2.5"/></g>;
 case "chest": return <g><path d="M16 31h32v20H16V31Zm0 0V26c0-15 32-15 32 0v5M22 31V26c0-10 20-10 20 0v5M16 39h32" strokeWidth="2.5"/><path d="M29 34h6v12h-6V34Z" fill="currentColor" fillOpacity=".25" strokeWidth="1.8"/></g>;
 case "quill": return <g><path d="M19 49 48 16C35 15 22 28 20 42l-1 7Z" strokeWidth="2.5"/><path d="m18 53 22-26m-13 7 9 2M15 54h21" strokeWidth="2"/></g>;
 case "torch": return <g><path d="M32 34v20m-8-17h16M28 54h8" strokeWidth="3"/><path d="M32 13c7 8 11 14 7 20-3 4-10 5-14 0-5-7 1-12 7-20Z" strokeWidth="2.8"/></g>;
 case "key": return <g><circle cx="27" cy="25" r="10" strokeWidth="2.8"/><path d="M34 32 48 46v8h-7v-5h-6v-6l-7-8" strokeWidth="3"/></g>;
 case "drag": return <g>
   <path d="M21 25h22M21 34h22M21 43h22" strokeWidth="2.5"/>
   <path d="M18 25h.1M18 34h.1M18 43h.1M46 25h.1M46 34h.1M46 43h.1" strokeWidth="3.5"/>
 </g>;
 case "arrow": return <path d="M18 44 45 20M28 20h17v17" strokeWidth="3.5"/>;
 default: return <g><path d="M20 24c8-4 16-4 24 0v21c-8-4-16-4-24 0V24Z" strokeWidth="2.7"/><path d="M25 30h14m-14 7h14" strokeWidth="2"/></g>;
 }
}
const paintedActions = new Set(["inbox","add","plus","edit","quill","feather","copy","trash","delete","upload","import","reset","send"]);

export function HeraldicIcon({name,size=24,className=""}:{name:string;size?:number;className?:string}) {
 if (paintedActions.has(name)) {
   return <MedievalCrest name={name} size={size} className={`heraldic-sigil action-crest ${className}`} />;
 }
 return <svg className={`heraldic-sigil ${className}`} width={size} height={size} viewBox="0 0 64 70"
   fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
   <path d="M32 3 56 12v24c0 15-13 24-24 31C21 60 8 51 8 36V12L32 3Z" strokeWidth="2.6" fill="currentColor" fillOpacity=".05"/>
   <path d="M32 8 51 15v21c0 12-9 20-19 26-10-6-19-14-19-26V15L32 8Z" strokeWidth="1" strokeOpacity=".4"/>
   {device(name)}
 </svg>;
}
