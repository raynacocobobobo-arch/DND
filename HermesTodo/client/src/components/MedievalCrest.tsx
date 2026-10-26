/** Approved hand-painted medieval coats of arms.
 * The transparent 8-frame AVIF sprite keeps real pictorial texture without losing
 * image sharpness at 44-48 CSS pixels. Old saved icon names remain supported.
 */
const crests = ["lion","fleur","compass","tree","book","swords","crown","scroll"] as const;
type Crest = typeof crests[number];
const aliases: Record<string,Crest> = {
  lion:"lion",fleur:"fleur",compass:"compass",tree:"tree",book:"book",swords:"swords",crown:"crown",scroll:"scroll",
  folder:"fleur",briefcase:"lion",suitcase:"compass",house:"tree",home:"tree",
  "shopping-cart":"crown","shopping-bag":"crown","book-open":"book",
  dumbbell:"swords",film:"scroll",heart:"tree",sparkles:"crown",
  plane:"compass",calendar:"scroll",grid:"fleur",inbox:"scroll",star:"crown",
  quill:"scroll",gamepad:"swords","gamepad-2":"swords"
};
export function canonicalCrestName(name: string): Crest {
  return aliases[name] ?? "fleur";
}
export function MedievalCrest({ name, size = 44, className = "" }: {
  name: string; size?: number; className?: string;
}) {
  const canonical = canonicalCrestName(name);
  const index = crests.indexOf(canonical);
  return <span
    className={`medieval-crest ${className}`}
    data-crest={canonical}
    aria-hidden="true"
    style={{
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
      width: size, height: size,
      backgroundImage: `url("${import.meta.env.BASE_URL}art/medieval-crests.avif")`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${size * crests.length}px ${size}px`,
      backgroundPosition: `-${index * size}px 0`
    }}
  />;
}
