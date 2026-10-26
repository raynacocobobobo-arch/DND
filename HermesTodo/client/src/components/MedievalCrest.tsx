/** Approved medieval coats of arms.
 * List crests stay on the original 8-frame AVIF sprite.
 * Functional actions use individual fantasy-relief WebP crests for robust browser rendering.
 */
const crests = ["lion","fleur","compass","tree","book","swords","crown","scroll"] as const;
type Crest = typeof crests[number];

const aliases: Record<string,Crest> = {
  lion:"lion",fleur:"fleur",compass:"compass",tree:"tree",book:"book",swords:"swords",crown:"crown",scroll:"scroll",
  folder:"fleur",briefcase:"lion",suitcase:"compass",house:"tree",home:"tree",
  "shopping-cart":"crown","shopping-bag":"crown","book-open":"book",
  dumbbell:"swords",film:"scroll",heart:"tree",sparkles:"crown",
  plane:"compass",calendar:"scroll",grid:"fleur",star:"crown",
  gamepad:"swords","gamepad-2":"swords"
};

const actionAliases: Record<string,string> = {
  inbox:"inbox",
  add:"add",plus:"add",
  edit:"edit",quill:"edit",feather:"edit",
  copy:"copy",
  trash:"delete",delete:"delete",
  upload:"import",import:"import",
  reset:"reset",
  send:"send"
};

export function canonicalCrestName(name: string): Crest {
  return aliases[name] ?? "fleur";
}

export function MedievalCrest({ name, size = 44, className = "" }: {
  name: string; size?: number; className?: string;
}) {
  const action = actionAliases[name];
  if (action) {
    return <span
      className={`medieval-crest medieval-action-crest ${className}`}
      data-crest={action}
      aria-hidden="true"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        width: size,
        height: size,
        backgroundImage: `url("${import.meta.env.BASE_URL}art/crest-${action}.webp")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center"
      }}
    />;
  }

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
      width: size,
      height: size,
      backgroundImage: `url("${import.meta.env.BASE_URL}art/medieval-crests.avif")`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${size * crests.length}px ${size}px`,
      backgroundPosition: `-${index * size}px 0`
    }}
  />;
}
