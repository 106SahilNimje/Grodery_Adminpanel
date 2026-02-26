import {
  LocalFlorist,
  Restaurant,
  WaterDrop,
  Fastfood,
  ShoppingBag,
  ShoppingBasket,
  Category,
  Inventory2,
  LocalDining,
  Liquor,
  Icecream,
  Kitchen,
  Spa,
  Checkroom,
  Devices,
  MenuBook
} from "@mui/icons-material";

export const IconMap = {
  // Vegetables
  nutrition: LocalFlorist,
  leaf: LocalFlorist,

  // Fruits
  "nutrition-outline": LocalFlorist,

  // Dairy
  water: WaterDrop,
  "water-outline": WaterDrop,

  // Snacks/Food
  "fast-food": Fastfood,
  "fast-food-outline": Fastfood,
  restaurant: Restaurant,

  // Grocery
  "bag-handle": ShoppingBag,
  "bag-handle-outline": ShoppingBag,
  grocery: ShoppingBag,
  basket: ShoppingBasket,

  // General
  category: Category,
  inventory: Inventory2,
  dining: LocalDining,
  liquor: Liquor,
  icecream: Icecream,
  kitchen: Kitchen,
  spa: Spa,
  clothes: Checkroom,
  electronics: Devices,
  books: MenuBook
};

export const IconNames = ["leaf", "nutrition", "water", "basket"];
