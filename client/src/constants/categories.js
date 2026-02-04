import { Grape, Leaf, Sparkles, Wine, Package, Award } from 'lucide-react';

/**
 * Category Data
 * Using lucide-react outline icons (no emojis)
 */

export const CATEGORIES = [
    {
        id: 1,
        name: 'Red Grapes',
        slug: 'red',
        icon: Grape,
    },
    {
        id: 2,
        name: 'Green Grapes',
        slug: 'green',
        icon: Grape,
    },
    {
        id: 3,
        name: 'Black Grapes',
        slug: 'black',
        icon: Grape,
    },
    {
        id: 4,
        name: 'Organic',
        slug: 'organic',
        icon: Leaf,
    },
    {
        id: 5,
        name: 'Specialty',
        slug: 'specialty',
        icon: Sparkles,
    },
    {
        id: 6,
        name: 'Wine Grapes',
        slug: 'wine',
        icon: Wine,
    },
];

export default CATEGORIES;
