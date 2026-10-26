import { HeraldicIcon } from "./HeraldicIcon";
export function ContextIcon({ name, size=32 }: { name:string; size?:number }) {
 return <HeraldicIcon name={name} size={size}/>;
}
