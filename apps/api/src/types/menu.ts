import { z } from "zod";

// Canonical menu shape, mirroring the menu-extraction service's output
// (menu-search `Menu`). A menu is a merchant profile plus an ordered list of
// sections, each holding items. Per-item pricing, availability, and images live
// on the item.
const menuPriceSchema = z.object({
  amount: z.number(),
  currency: z.string().optional(),
  formatted: z.string().optional(),
});
const menuAvailabilitySchema = z.object({
  inStock: z.boolean(),
  text: z.string().optional(),
});
const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  images: z
    .array(z.object({ url: z.string(), alt: z.string().optional() }))
    .default([]),
  price: menuPriceSchema.optional(),
  availability: menuAvailabilitySchema,
  dietary: z.array(z.string()).default([]),
  calories: z.number().optional(),
  optionGroups: z.array(z.unknown()).default([]),
  identifiers: z.object({ merchantItemId: z.string().optional() }).default({}),
  url: z.string().optional(),
  sourceUrl: z.string(),
  // Enrichment fields derived by the menu-extraction service from section/context signals.
  // Coarse food/drink category, optional finer subtype, allergen tokens, and meal periods.
  // All optional/defaulted so older service responses remain valid.
  category: z.enum(["food", "drink"]).nullable().optional(),
  subcategory: z.string().nullable().optional(),
  allergens: z.array(z.string()).default([]),
  mealPeriods: z.array(z.string()).default([]),
});
const menuSectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  items: z.array(menuItemSchema),
});
const menuProfileSchema = z.object({
  isMenu: z.boolean(),
  confidence: z.number(),
  merchant: z.object({
    name: z.string(),
    type: z.string().nullable().optional(),
    location: z.unknown().optional(),
  }),
  currency: z.string().nullable().optional(),
  sections: z.array(menuSectionSchema),
  sourceUrl: z.string(),
});

export type MenuProfile = z.infer<typeof menuProfileSchema>;
