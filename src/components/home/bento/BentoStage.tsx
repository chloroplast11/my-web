// BentoStage is retained as a named re-export of EditableBento so existing
// imports in tests don't have to change. New code should import EditableBento
// directly.
export { EditableBento as BentoStage } from "./EditableBento";
export { BENTO_REF_W, BENTO_REF_H } from "@/lib/bento-defaults";
