import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtmlLib.defaults.allowedTags,
  "img",
  "figure",
  "figcaption",
  "h1",
  "h2",
];

const ALLOWED_ATTRIBUTES: sanitizeHtmlLib.IOptions["allowedAttributes"] = {
  ...sanitizeHtmlLib.defaults.allowedAttributes,
  a: ["href", "name", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  "*": ["class", "id", "data-*"],
};

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") {
          attribs.rel = "noopener noreferrer";
        }
        return { tagName, attribs };
      },
    },
  });
}
