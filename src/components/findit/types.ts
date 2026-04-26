export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'resolved';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  contact_email: string;
  contact_phone?: string;
  image_url?: string;
  status: ItemStatus;
  created_at: string;
}

export interface ReportFormData {
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  contact_email: string;
  contact_phone: string;
}

export const CATEGORIES = [
  "Electronics", "Books & Notes", "ID Cards", "Keys",
  "Bags & Backpacks", "Clothing", "Water Bottles",
  "Umbrellas", "Accessories", "Other"
] as const;

export const MOCK_ITEMS: Item[] = [
  {
    id: "1",
    type: "lost",
    title: "MacBook Pro 14-inch",
    category: "Electronics",
    description: "Space gray, has a 'Code Hard' sticker on the lid. Lost near the library.",
    location: "Main Library, 2nd Floor",
    date: "2026-04-24",
    contact_email: "student1@university.ac.ke",
    contact_phone: "+254712345678",
    status: "open",
    created_at: "2026-04-24T10:00:00Z"
  },
  {
    id: "2",
    type: "found",
    title: "Red Hydro Flask",
    category: "Water Bottles",
    description: "32oz red water bottle with white scratches on bottom.",
    location: "Science Building, Room 201",
    date: "2026-04-23",
    contact_email: "finder@university.ac.ke",
    contact_phone: "+254798765432",
    status: "open",
    created_at: "2026-04-23T14:30:00Z"
  },
  {
    id: "3",
    type: "lost",
    title: "Student ID Card",
    category: "ID Cards",
    description: "Name: John Mwangi, ID No: 123456. Lost at the cafeteria.",
    location: "Student Center Cafeteria",
    date: "2026-04-22",
    contact_email: "student2@university.ac.ke",
    contact_phone: "+254723456789",
    status: "open",
    created_at: "2026-04-22T09:15:00Z"
  },
  {
    id: "4",
    type: "found",
    title: "iPhone 15",
    category: "Electronics",
    description: "Black iPhone with cracked screen protector. Found near the parking lot.",
    location: "Parking Lot B",
    date: "2026-04-24",
    contact_email: "security@university.ac.ke",
    contact_phone: "+254734567890",
    status: "open",
    created_at: "2026-04-24T16:20:00Z"
  },
  {
    id: "5",
    type: "lost",
    title: "Black Backpack",
    category: "Bags & Backpacks",
    description: "Nike black backpack containing textbooks and a calculator.",
    location: "Computer Science Lab",
    date: "2026-04-23",
    contact_email: "student3@university.ac.ke",
    status: "open",
    created_at: "2026-04-23T11:00:00Z"
  },
  {
    id: "6",
    type: "found",
    title: "House Keys",
    category: "Keys",
    description: "A set of 3 keys with a small rabbit keychain.",
    location: "Library Entrance",
    date: "2026-04-24",
    contact_email: "library@university.ac.ke",
    status: "open",
    created_at: "2026-04-24T13:45:00Z"
  }
];
