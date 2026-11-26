// Generated from the owners' photo set ("Web stranica", numbered as in the review contact sheets).
// Files live in public/photos/gallery/NNN.webp. Order = gallery order (first 10 are the highlights).

export type PhotoCategory = "outdoor" | "living" | "bedrooms" | "bathrooms";
export type PhotoSubject =
  | "bedroomTwin"
  | "bathroom"
  | "living"
  | "terrace"
  | "guests"
  | "poolNight"
  | "dog"
  | "bedroomDouble"
  | "kitchen"
  | "hall"
  | "playground"
  | "bedroomSingle"
  | "dining"
  | "laundry"
  | "bbq"
  | "pool"
  | "outdoorDining"
  | "hotTub"
  | "exterior"
  | "boat";

export const subjectCategory: Record<PhotoSubject, PhotoCategory> = {
  bedroomTwin: "bedrooms",
  bathroom: "bathrooms",
  living: "living",
  terrace: "outdoor",
  guests: "outdoor",
  poolNight: "outdoor",
  dog: "outdoor",
  bedroomDouble: "bedrooms",
  kitchen: "living",
  hall: "living",
  playground: "outdoor",
  bedroomSingle: "bedrooms",
  dining: "living",
  laundry: "bathrooms",
  bbq: "outdoor",
  pool: "outdoor",
  outdoorDining: "outdoor",
  hotTub: "outdoor",
  exterior: "outdoor",
  boat: "outdoor",
};

export type Photo = { id: string; w: number; h: number; subject: PhotoSubject };

export const photos: Photo[] = [
  { id: "041", w: 1920, h: 888, subject: "pool" },
  { id: "046", w: 1920, h: 879, subject: "terrace" },
  { id: "055", w: 1920, h: 888, subject: "hotTub" },
  { id: "006", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "042", w: 1920, h: 879, subject: "outdoorDining" },
  { id: "063", w: 1920, h: 879, subject: "bedroomDouble" },
  { id: "023", w: 1920, h: 888, subject: "kitchen" },
  { id: "089", w: 1920, h: 879, subject: "guests" },
  { id: "073", w: 1920, h: 888, subject: "poolNight" },
  { id: "014", w: 1920, h: 879, subject: "terrace" },
  { id: "015", w: 1920, h: 888, subject: "terrace" },
  { id: "016", w: 1920, h: 888, subject: "guests" },
  { id: "017", w: 1920, h: 888, subject: "poolNight" },
  { id: "018", w: 1920, h: 888, subject: "dog" },
  { id: "019", w: 1920, h: 879, subject: "terrace" },
  { id: "025", w: 1920, h: 888, subject: "playground" },
  { id: "037", w: 1920, h: 879, subject: "playground" },
  { id: "038", w: 1920, h: 879, subject: "bbq" },
  { id: "043", w: 1920, h: 888, subject: "pool" },
  { id: "048", w: 1920, h: 879, subject: "pool" },
  { id: "051", w: 1920, h: 888, subject: "pool" },
  { id: "053", w: 1920, h: 888, subject: "pool" },
  { id: "054", w: 1920, h: 888, subject: "dog" },
  { id: "056", w: 1920, h: 888, subject: "pool" },
  { id: "057", w: 1920, h: 879, subject: "terrace" },
  { id: "058", w: 1920, h: 888, subject: "exterior" },
  { id: "060", w: 1920, h: 888, subject: "outdoorDining" },
  { id: "061", w: 1920, h: 888, subject: "playground" },
  { id: "062", w: 1920, h: 888, subject: "pool" },
  { id: "065", w: 1920, h: 888, subject: "poolNight" },
  { id: "066", w: 1920, h: 888, subject: "playground" },
  { id: "067", w: 1920, h: 888, subject: "pool" },
  { id: "068", w: 1920, h: 888, subject: "pool" },
  { id: "069", w: 1920, h: 888, subject: "dog" },
  { id: "075", w: 1920, h: 879, subject: "guests" },
  { id: "076", w: 1920, h: 888, subject: "pool" },
  { id: "077", w: 1920, h: 879, subject: "pool" },
  { id: "078", w: 1920, h: 879, subject: "guests" },
  { id: "079", w: 1920, h: 888, subject: "pool" },
  { id: "080", w: 1920, h: 888, subject: "playground" },
  { id: "081", w: 1920, h: 888, subject: "pool" },
  { id: "082", w: 1920, h: 888, subject: "playground" },
  { id: "083", w: 1920, h: 888, subject: "poolNight" },
  { id: "085", w: 1920, h: 879, subject: "playground" },
  { id: "086", w: 1920, h: 888, subject: "dog" },
  { id: "088", w: 1920, h: 888, subject: "exterior" },
  { id: "092", w: 1920, h: 879, subject: "playground" },
  { id: "093", w: 1920, h: 888, subject: "bbq" },
  { id: "094", w: 1920, h: 888, subject: "hotTub" },
  { id: "011", w: 1920, h: 888, subject: "living" },
  { id: "013", w: 1920, h: 879, subject: "living" },
  { id: "024", w: 1920, h: 879, subject: "hall" },
  { id: "027", w: 1920, h: 879, subject: "kitchen" },
  { id: "028", w: 1920, h: 879, subject: "dining" },
  { id: "039", w: 1920, h: 879, subject: "dining" },
  { id: "071", w: 1920, h: 888, subject: "dining" },
  { id: "096", w: 1920, h: 1258, subject: "living" },
  { id: "097", w: 861, h: 1306, subject: "hall" },
  { id: "098", w: 1920, h: 1286, subject: "kitchen" },
  { id: "099", w: 1920, h: 1270, subject: "kitchen" },
  { id: "100", w: 1920, h: 1272, subject: "kitchen" },
  { id: "101", w: 1920, h: 1262, subject: "kitchen" },
  { id: "102", w: 1920, h: 1318, subject: "dining" },
  { id: "103", w: 1920, h: 1281, subject: "living" },
  { id: "104", w: 1920, h: 1351, subject: "living" },
  { id: "105", w: 1920, h: 1272, subject: "dining" },
  { id: "106", w: 812, h: 1305, subject: "kitchen" },
  { id: "111", w: 1920, h: 1298, subject: "kitchen" },
  { id: "112", w: 1920, h: 1290, subject: "kitchen" },
  { id: "001", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "002", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "003", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "007", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "009", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "020", w: 1920, h: 879, subject: "bedroomTwin" },
  { id: "022", w: 1920, h: 879, subject: "bedroomDouble" },
  { id: "026", w: 833, h: 1800, subject: "bedroomSingle" },
  { id: "030", w: 1920, h: 879, subject: "bedroomDouble" },
  { id: "031", w: 1920, h: 879, subject: "bedroomDouble" },
  { id: "032", w: 1920, h: 879, subject: "bedroomDouble" },
  { id: "033", w: 1920, h: 888, subject: "bedroomSingle" },
  { id: "034", w: 1920, h: 879, subject: "bedroomDouble" },
  { id: "036", w: 1920, h: 888, subject: "bedroomDouble" },
  { id: "040", w: 1920, h: 888, subject: "bedroomDouble" },
  { id: "044", w: 1920, h: 879, subject: "bedroomDouble" },
  { id: "047", w: 824, h: 1800, subject: "bedroomSingle" },
  { id: "049", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "059", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "070", w: 1920, h: 888, subject: "bedroomDouble" },
  { id: "084", w: 1920, h: 888, subject: "bedroomDouble" },
  { id: "087", w: 1920, h: 888, subject: "bedroomTwin" },
  { id: "090", w: 1920, h: 879, subject: "bedroomDouble" },
  { id: "005", w: 1920, h: 888, subject: "bathroom" },
  { id: "008", w: 824, h: 1800, subject: "bathroom" },
  { id: "012", w: 1920, h: 888, subject: "bathroom" },
  { id: "021", w: 824, h: 1800, subject: "bathroom" },
  { id: "029", w: 824, h: 1800, subject: "laundry" },
  { id: "052", w: 1920, h: 888, subject: "bathroom" },
  { id: "064", w: 1920, h: 888, subject: "bathroom" },
  { id: "107", w: 893, h: 1302, subject: "bathroom" },
  { id: "108", w: 872, h: 1293, subject: "laundry" },
  { id: "109", w: 1920, h: 1319, subject: "bathroom" },
  { id: "110", w: 872, h: 1320, subject: "bathroom" },
];

// The owner with her dog on a boat: shown in the reviews section, not in the gallery.
export const hostPhoto = { id: "074", w: 1040, h: 2272 };

export const photoById = (id: string) => photos.find((p) => p.id === id)!;
export const gallerySrc = (id: string) => `/photos/gallery/${id}.webp`;
