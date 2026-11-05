import { MedievalCrest } from "./MedievalCrest";
export function ContextIcon({ name, size = 44 }: { name: string; size?: number }) {
  return <MedievalCrest name={name} size={size} />;
}
