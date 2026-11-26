// Which gallery photos show which part of the floor plan. A room with photos here becomes
// clickable on the floor plan (camera icon) and opens just its photos; rooms not listed stay plain.
// Photo ids are the numbers from src/lib/photos.ts / public/photos/gallery/NNN.webp.

export type RoomId =
  // Ground floor
  | "room1"
  | "room2"
  | "room3"
  | "room4"
  | "groundBathTop" // WC with shower between Room 1 and Room 4
  | "groundBathLeft" // WC with shower between Room 2 and Room 3
  | "groundHall"
  | "groundKitchen"
  | "groundLiving"
  | "outdoorWc"
  | "bbq"
  | "coveredTerrace"
  // 1st floor
  | "room5"
  | "room6"
  | "floor1BathLeft" // WC with shower under Room 5
  | "floor1BathTop" // WC with shower between Room 5 and Room 6
  | "floor1Hall"
  | "floor1Kitchen"
  | "floor1Living"
  | "dining"
  | "terrace"
  | "balcony"
  // Loft
  | "room7"
  | "room8"
  | "loftHall"
  | "loftBalcony";

export const roomPhotos: Partial<Record<RoomId, string[]>> = {
  // Sorted by the owners (sorting sheet, Nov 2026).
  room1: ["022", "031", "034", "044", "090"],
  room2: ["047"],
  room3: ["026", "033"],
  room4: ["063"],
  groundBathTop: ["012", "052", "064"],
  groundBathLeft: ["005", "008", "021", "029"],
  groundHall: ["024", "097"],
  groundKitchen: ["023", "101", "111", "112"],
  groundLiving: ["011", "013", "027", "028", "039", "071"],
  bbq: ["093"],
  coveredTerrace: ["060", "042", "014", "015", "019", "038", "057", "046"],
  room5: ["030", "070", "084"],
  room6: ["032", "036", "040"],
  floor1BathLeft: ["107", "108"],
  floor1BathTop: ["109", "110"],
  floor1Kitchen: ["098", "099", "100", "106"],
  floor1Living: ["096", "103", "104"],
  dining: ["102", "105"],
  room7: ["006", "001", "007", "009"],
  room8: ["002", "003", "020", "049", "059", "087"],
};
