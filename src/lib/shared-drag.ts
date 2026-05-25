import { makeMutable } from "react-native-reanimated";

export const sharedTranslateX = makeMutable(0);
export const sharedTranslateY = makeMutable(0);
export const sharedActiveColIndex = makeMutable(-1);
export const sharedDragStartIndex = makeMutable(-1);
export const sharedDragSessionId = makeMutable(0);
export const sharedActiveDragType = makeMutable<"tableau" | "waste" | "none">("none");
