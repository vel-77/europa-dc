// The choices in the contact form's "Project type" field.
export const PROJECT_TYPES = ["Kitchen", "Bathroom", "Closet", "Outdoor", "Full Interior", "Other"];

/** The project type matching a room, e.g. "Kitchens" gives "Kitchen"; "Other" if none does. */
export function projectTypeFor(room: string) {
  return PROJECT_TYPES.find((type) => room.toLowerCase().startsWith(type.toLowerCase())) ?? "Other";
}
