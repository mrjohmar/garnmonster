import {
  TemperatureData,
  TemperatureRange,
  PatternRow,
  PatternResult,
  PatternSettings,
  YarnUsage,
  ColorPalette
} from '@/types';

// Preset color palettes for temperature blankets
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'classic-warm',
    name: 'Klassisk Värme',
    description: 'Från isblått till eldigt rött',
    colors: ['#1e3a5f', '#2d5a87', '#4a90a4', '#7eb8c9', '#a8d4dd', '#f5e6a3', '#f4c542', '#e88c30', '#d64545', '#8b1538']
  },
  {
    id: 'nordic',
    name: 'Nordisk',
    description: 'Dämpade naturliga toner',
    colors: ['#2c3e50', '#34495e', '#5d6d7e', '#85929e', '#aeb6bf', '#d5dbdb', '#f7dc6f', '#f5b041', '#dc7633', '#c0392b']
  },
  {
    id: 'sunset',
    name: 'Solnedgång',
    description: 'Varma solnedgångsfärger',
    colors: ['#4a148c', '#6a1b9a', '#8e24aa', '#ab47bc', '#e91e63', '#f44336', '#ff5722', '#ff9800', '#ffc107', '#ffeb3b']
  },
  {
    id: 'ocean',
    name: 'Havsbris',
    description: 'Lugna blå och gröna toner',
    colors: ['#0d47a1', '#1565c0', '#1976d2', '#2196f3', '#42a5f5', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775']
  },
  {
    id: 'forest',
    name: 'Skogsglänta',
    description: 'Naturnära gröna nyanser',
    colors: ['#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9', '#f1f8e9', '#fff9c4']
  },
  {
    id: 'berry',
    name: 'Bärplockning',
    description: 'Bärtoner från blåbär till hallon',
    colors: ['#311b92', '#4527a0', '#512da8', '#673ab7', '#7c4dff', '#e040fb', '#f50057', '#ff1744', '#ff5252', '#ff8a80']
  },
  {
    id: 'pastel',
    name: 'Pastell',
    description: 'Mjuka pastellfärger',
    colors: ['#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc']
  },
  {
    id: 'monochrome',
    name: 'Svartvit',
    description: 'Elegant gråskala',
    colors: ['#212121', '#424242', '#616161', '#757575', '#9e9e9e', '#bdbdbd', '#e0e0e0', '#eeeeee', '#f5f5f5', '#fafafa']
  }
];

// Popular yarn brands with common colors
export const YARN_BRANDS = [
  {
    id: 'drops',
    name: 'Drops',
    colors: [
      { id: 'd1', name: 'Natur', hex: '#f5f5dc', productName: 'Baby Merino' },
      { id: 'd2', name: 'Ljusrosa', hex: '#ffb6c1', productName: 'Baby Merino' },
      { id: 'd3', name: 'Ljusblå', hex: '#add8e6', productName: 'Baby Merino' },
      { id: 'd4', name: 'Mintgrön', hex: '#98ff98', productName: 'Baby Merino' },
      { id: 'd5', name: 'Lavendel', hex: '#e6e6fa', productName: 'Baby Merino' },
      { id: 'd6', name: 'Gul', hex: '#ffff00', productName: 'Baby Merino' },
      { id: 'd7', name: 'Orange', hex: '#ffa500', productName: 'Baby Merino' },
      { id: 'd8', name: 'Röd', hex: '#ff0000', productName: 'Baby Merino' },
      { id: 'd9', name: 'Marinblå', hex: '#000080', productName: 'Baby Merino' },
      { id: 'd10', name: 'Mörkgrå', hex: '#696969', productName: 'Baby Merino' },
    ]
  },
  {
    id: 'sandnes',
    name: 'Sandnes Garn',
    colors: [
      { id: 's1', name: 'Hvit', hex: '#ffffff', productName: 'Sisu' },
      { id: 's2', name: 'Rosa', hex: '#ffc0cb', productName: 'Sisu' },
      { id: 's3', name: 'Lys blå', hex: '#87ceeb', productName: 'Sisu' },
      { id: 's4', name: 'Grønn', hex: '#90ee90', productName: 'Sisu' },
      { id: 's5', name: 'Gul', hex: '#ffd700', productName: 'Sisu' },
      { id: 's6', name: 'Oransje', hex: '#ff8c00', productName: 'Sisu' },
      { id: 's7', name: 'Rød', hex: '#dc143c', productName: 'Sisu' },
      { id: 's8', name: 'Blå', hex: '#4169e1', productName: 'Sisu' },
      { id: 's9', name: 'Lilla', hex: '#9370db', productName: 'Sisu' },
      { id: 's10', name: 'Brun', hex: '#8b4513', productName: 'Sisu' },
    ]
  },
  {
    id: 'favoritgarner',
    name: 'Favoritgarner',
    colors: [
      { id: 'f1', name: 'Vit', hex: '#fffef0', productName: 'Cotton 8/4' },
      { id: 'f2', name: 'Ljusrosa', hex: '#fab1c4', productName: 'Cotton 8/4' },
      { id: 'f3', name: 'Babyblå', hex: '#9fd5e1', productName: 'Cotton 8/4' },
      { id: 'f4', name: 'Pistagegrön', hex: '#c1d9a4', productName: 'Cotton 8/4' },
      { id: 'f5', name: 'Solrosgul', hex: '#f9d71c', productName: 'Cotton 8/4' },
      { id: 'f6', name: 'Korall', hex: '#ff7f50', productName: 'Cotton 8/4' },
      { id: 'f7', name: 'Hallonröd', hex: '#e30b5c', productName: 'Cotton 8/4' },
      { id: 'f8', name: 'Havsblå', hex: '#006994', productName: 'Cotton 8/4' },
      { id: 'f9', name: 'Syren', hex: '#c8a2c8', productName: 'Cotton 8/4' },
      { id: 'f10', name: 'Antracit', hex: '#2f4f4f', productName: 'Cotton 8/4' },
    ]
  },
  {
    id: 'fika-gicona',
    name: 'Fika Gicona',
    colors: [
      // White/Neutrals (100-133)
      { id: 'fika-100', name: 'Snow White', hex: '#ffffff', productName: 'Fika Gicona' },
      { id: 'fika-101', name: 'Off White', hex: '#faf9f6', productName: 'Fika Gicona' },
      { id: 'fika-102', name: 'Cream White', hex: '#fffdd0', productName: 'Fika Gicona' },
      { id: 'fika-110', name: 'Black Liquorice', hex: '#1c1c1c', productName: 'Fika Gicona' },
      { id: 'fika-120', name: 'Anthracite', hex: '#293133', productName: 'Fika Gicona' },
      { id: 'fika-121', name: 'Stone Grey', hex: '#8d8d8d', productName: 'Fika Gicona' },
      { id: 'fika-122', name: 'Metal Grey', hex: '#71797e', productName: 'Fika Gicona' },
      { id: 'fika-123', name: 'Thunder Grey', hex: '#505050', productName: 'Fika Gicona' },
      { id: 'fika-130', name: 'Ice Grey', hex: '#d3d3d3', productName: 'Fika Gicona' },
      { id: 'fika-131', name: 'Silver Grey', hex: '#c0c0c0', productName: 'Fika Gicona' },
      { id: 'fika-132', name: 'Quicksilver', hex: '#a6a6a6', productName: 'Fika Gicona' },
      { id: 'fika-133', name: 'Silver Dust', hex: '#bfc1c2', productName: 'Fika Gicona' },

      // Reds/Pinks (200-261)
      { id: 'fika-200', name: 'Rouge', hex: '#a23b3c', productName: 'Fika Gicona' },
      { id: 'fika-201', name: 'Blush', hex: '#de5d83', productName: 'Fika Gicona' },
      { id: 'fika-210', name: 'Vintage Pink', hex: '#d5a6bd', productName: 'Fika Gicona' },
      { id: 'fika-213', name: 'Pink Plum', hex: '#dda0dd', productName: 'Fika Gicona' },
      { id: 'fika-214', name: 'Pink Malva', hex: '#e0b0d5', productName: 'Fika Gicona' },
      { id: 'fika-220', name: 'Pink Rose', hex: '#ff66cc', productName: 'Fika Gicona' },
      { id: 'fika-221', name: 'Pink Peony', hex: '#faadc7', productName: 'Fika Gicona' },
      { id: 'fika-225', name: 'Party Pink', hex: '#ff1493', productName: 'Fika Gicona' },
      { id: 'fika-231', name: 'Pink Ballerina', hex: '#f8c8dc', productName: 'Fika Gicona' },
      { id: 'fika-232', name: 'Candy Pink', hex: '#ffb3de', productName: 'Fika Gicona' },
      { id: 'fika-233', name: 'Bubblegum', hex: '#ffc1cc', productName: 'Fika Gicona' },
      { id: 'fika-234', name: 'Hot Pink', hex: '#ff69b4', productName: 'Fika Gicona' },
      { id: 'fika-235', name: 'Raspberry', hex: '#e30b5c', productName: 'Fika Gicona' },
      { id: 'fika-240', name: 'Powder Pink', hex: '#ffd1dc', productName: 'Fika Gicona' },
      { id: 'fika-241', name: 'Pink Panther', hex: '#ff6eb4', productName: 'Fika Gicona' },
      { id: 'fika-250', name: 'Cool Pink', hex: '#ffb7ce', productName: 'Fika Gicona' },
      { id: 'fika-252', name: 'Electric Pink', hex: '#ff007f', productName: 'Fika Gicona' },
      { id: 'fika-260', name: 'Fuchsia', hex: '#ff00ff', productName: 'Fika Gicona' },
      { id: 'fika-261', name: 'Wild Purple', hex: '#c154c1', productName: 'Fika Gicona' },

      // Purples/Violets (300-331)
      { id: 'fika-300', name: 'Sweet Orchid', hex: '#da70d6', productName: 'Fika Gicona' },
      { id: 'fika-302', name: 'Purple Soul', hex: '#7851a9', productName: 'Fika Gicona' },
      { id: 'fika-303', name: 'Vintage Purple', hex: '#9f7ba0', productName: 'Fika Gicona' },
      { id: 'fika-310', name: 'Soft Lilac', hex: '#e6d7f7', productName: 'Fika Gicona' },
      { id: 'fika-311', name: 'Fancy Violet', hex: '#9f00ff', productName: 'Fika Gicona' },
      { id: 'fika-320', name: 'Lavender', hex: '#e6e6fa', productName: 'Fika Gicona' },
      { id: 'fika-321', name: 'Amethyst', hex: '#9966cc', productName: 'Fika Gicona' },
      { id: 'fika-330', name: 'Blue Lilac', hex: '#a8b9d0', productName: 'Fika Gicona' },
      { id: 'fika-331', name: 'Indigo Lilac', hex: '#8674a1', productName: 'Fika Gicona' },

      // Blues (400-421)
      { id: 'fika-400', name: 'Blue Sky', hex: '#87ceeb', productName: 'Fika Gicona' },
      { id: 'fika-401', name: 'Forever Blue', hex: '#4169e1', productName: 'Fika Gicona' },
      { id: 'fika-402', name: 'Denim Blue', hex: '#1560bd', productName: 'Fika Gicona' },
      { id: 'fika-403', name: 'Riviera Blue', hex: '#0066cc', productName: 'Fika Gicona' },
      { id: 'fika-404', name: 'Midnight Blue', hex: '#191970', productName: 'Fika Gicona' },
      { id: 'fika-410', name: 'Pastel Blue', hex: '#aec6cf', productName: 'Fika Gicona' },
      { id: 'fika-411', name: 'Blue Eyes', hex: '#5d9bd3', productName: 'Fika Gicona' },
      { id: 'fika-412', name: 'Dala Blue', hex: '#3b5998', productName: 'Fika Gicona' },
      { id: 'fika-414', name: 'Midnight Blue', hex: '#191970', productName: 'Fika Gicona' },
      { id: 'fika-420', name: 'Linen Blue', hex: '#8db3d6', productName: 'Fika Gicona' },
      { id: 'fika-421', name: 'Royal Blue', hex: '#4169e1', productName: 'Fika Gicona' },

      // Teals/Cyans (500-584)
      { id: 'fika-500', name: 'Blue Breeze', hex: '#b0e0e6', productName: 'Fika Gicona' },
      { id: 'fika-510', name: 'Glacier Blue', hex: '#7cb9e8', productName: 'Fika Gicona' },
      { id: 'fika-520', name: 'Blue Steel', hex: '#4682b4', productName: 'Fika Gicona' },
      { id: 'fika-530', name: 'Fiji Blue', hex: '#00ced1', productName: 'Fika Gicona' },
      { id: 'fika-531', name: 'Hawaii Blue', hex: '#1ca9c9', productName: 'Fika Gicona' },
      { id: 'fika-532', name: 'Vibrant Ocean', hex: '#0077be', productName: 'Fika Gicona' },
      { id: 'fika-533', name: 'Petrol Blue', hex: '#005f73', productName: 'Fika Gicona' },
      { id: 'fika-540', name: 'Tropical Water', hex: '#40e0d0', productName: 'Fika Gicona' },
      { id: 'fika-541', name: 'Aqua Green', hex: '#7fffd4', productName: 'Fika Gicona' },
      { id: 'fika-550', name: 'Vintage Green', hex: '#50c878', productName: 'Fika Gicona' },
      { id: 'fika-551', name: 'Eucalyptus', hex: '#44d7a8', productName: 'Fika Gicona' },
      { id: 'fika-560', name: 'Spring Breeze', hex: '#a7dbd8', productName: 'Fika Gicona' },
      { id: 'fika-570', name: 'Vintage Teal', hex: '#5f9ea0', productName: 'Fika Gicona' },
      { id: 'fika-580', name: 'Icy Mint', hex: '#c5e8e1', productName: 'Fika Gicona' },
      { id: 'fika-581', name: 'Spearmint', hex: '#1fcecb', productName: 'Fika Gicona' },
      { id: 'fika-583', name: 'Deep Ocean', hex: '#003b46', productName: 'Fika Gicona' },
      { id: 'fika-584', name: 'Lagun Green', hex: '#4d9078', productName: 'Fika Gicona' },

      // Greens (600-670)
      { id: 'fika-600', name: 'Tropical Green', hex: '#00a86b', productName: 'Fika Gicona' },
      { id: 'fika-605', name: 'Radiant Green', hex: '#00ff00', productName: 'Fika Gicona' },
      { id: 'fika-610', name: 'Parrot Green', hex: '#32cd32', productName: 'Fika Gicona' },
      { id: 'fika-612', name: 'Christmas Green', hex: '#228b22', productName: 'Fika Gicona' },
      { id: 'fika-620', name: 'Green Apple', hex: '#8db600', productName: 'Fika Gicona' },
      { id: 'fika-621', name: 'Kiwi Green', hex: '#8ee53f', productName: 'Fika Gicona' },
      { id: 'fika-630', name: 'Emerald Green', hex: '#50c878', productName: 'Fika Gicona' },
      { id: 'fika-631', name: 'Pine Tree', hex: '#2a4d3c', productName: 'Fika Gicona' },
      { id: 'fika-640', name: 'Linden Blossom', hex: '#c3d69b', productName: 'Fika Gicona' },
      { id: 'fika-641', name: 'Sage Green', hex: '#9caf88', productName: 'Fika Gicona' },
      { id: 'fika-642', name: 'Aventurin Green', hex: '#4db560', productName: 'Fika Gicona' },
      { id: 'fika-650', name: 'Marzipan', hex: '#f5deb3', productName: 'Fika Gicona' },
      { id: 'fika-660', name: 'Key Lime', hex: '#e8f48c', productName: 'Fika Gicona' },
      { id: 'fika-661', name: 'Pistachio', hex: '#93c572', productName: 'Fika Gicona' },
      { id: 'fika-662', name: 'Moss Green', hex: '#8a9a5b', productName: 'Fika Gicona' },
      { id: 'fika-670', name: 'Black Olive', hex: '#3b3c36', productName: 'Fika Gicona' },

      // Yellows/Oranges (700-752)
      { id: 'fika-700', name: 'Lemonade', hex: '#fafa37', productName: 'Fika Gicona' },
      { id: 'fika-701', name: 'Sweet Yellow', hex: '#ffee00', productName: 'Fika Gicona' },
      { id: 'fika-702', name: 'Mellow Yellow', hex: '#f8de7e', productName: 'Fika Gicona' },
      { id: 'fika-703', name: 'Banana Peel', hex: '#ffe135', productName: 'Fika Gicona' },
      { id: 'fika-704', name: 'Fresh Lemon', hex: '#fff44f', productName: 'Fika Gicona' },
      { id: 'fika-705', name: 'Sunshine', hex: '#fffd37', productName: 'Fika Gicona' },
      { id: 'fika-710', name: 'Golden Yellow', hex: '#ffdf00', productName: 'Fika Gicona' },
      { id: 'fika-711', name: 'Sweet Orange', hex: '#ffb347', productName: 'Fika Gicona' },
      { id: 'fika-712', name: 'Spicy Orange', hex: '#ff7f00', productName: 'Fika Gicona' },
      { id: 'fika-720', name: 'Rosy Ivory', hex: '#fff5ee', productName: 'Fika Gicona' },
      { id: 'fika-721', name: 'Soft Apricot', hex: '#fbceb1', productName: 'Fika Gicona' },
      { id: 'fika-722', name: 'Soft Coral', hex: '#f88379', productName: 'Fika Gicona' },
      { id: 'fika-730', name: 'Hibiscus', hex: '#b6316c', productName: 'Fika Gicona' },
      { id: 'fika-731', name: 'Watermelon', hex: '#fc6c85', productName: 'Fika Gicona' },
      { id: 'fika-735', name: 'Wild Salmon', hex: '#ff8c69', productName: 'Fika Gicona' },
      { id: 'fika-740', name: 'Sweet Peach', hex: '#ffdab9', productName: 'Fika Gicona' },
      { id: 'fika-742', name: 'Coral Gold', hex: '#ff9966', productName: 'Fika Gicona' },
      { id: 'fika-745', name: 'Bahama Beach', hex: '#f5deb3', productName: 'Fika Gicona' },
      { id: 'fika-746', name: 'Ash Rose', hex: '#c4aead', productName: 'Fika Gicona' },
      { id: 'fika-751', name: 'Flamingo', hex: '#fc8eac', productName: 'Fika Gicona' },
      { id: 'fika-752', name: 'Cocktail', hex: '#f88379', productName: 'Fika Gicona' },

      // Reds/Burgundy (760-782)
      { id: 'fika-760', name: 'Rowan Berry', hex: '#d85652', productName: 'Fika Gicona' },
      { id: 'fika-770', name: 'Hot Red', hex: '#ff0000', productName: 'Fika Gicona' },
      { id: 'fika-771', name: 'Strawberry Red', hex: '#fc5a8d', productName: 'Fika Gicona' },
      { id: 'fika-780', name: 'Red Jam', hex: '#a52a2a', productName: 'Fika Gicona' },
      { id: 'fika-781', name: 'Very Berry', hex: '#9a2a6a', productName: 'Fika Gicona' },
      { id: 'fika-782', name: 'Burgundy', hex: '#800020', productName: 'Fika Gicona' },

      // Browns/Earth Tones (801-874)
      { id: 'fika-801', name: 'Marsala', hex: '#964f4c', productName: 'Fika Gicona' },
      { id: 'fika-810', name: 'Rusty', hex: '#b7410e', productName: 'Fika Gicona' },
      { id: 'fika-811', name: 'Foxy', hex: '#c35831', productName: 'Fika Gicona' },
      { id: 'fika-812', name: 'Cinnamon Gold', hex: '#cd7f32', productName: 'Fika Gicona' },
      { id: 'fika-820', name: 'Saffron', hex: '#f4c430', productName: 'Fika Gicona' },
      { id: 'fika-821', name: 'Spice Mix', hex: '#a0522d', productName: 'Fika Gicona' },
      { id: 'fika-822', name: 'Mustard', hex: '#ffdb58', productName: 'Fika Gicona' },
      { id: 'fika-830', name: 'Salty Caramel', hex: '#af6e4d', productName: 'Fika Gicona' },
      { id: 'fika-831', name: 'Toffee', hex: '#755139', productName: 'Fika Gicona' },
      { id: 'fika-840', name: 'Cookie', hex: '#c7a677', productName: 'Fika Gicona' },
      { id: 'fika-841', name: 'Ginger Bread', hex: '#b8860b', productName: 'Fika Gicona' },
      { id: 'fika-842', name: 'Chestnut', hex: '#954535', productName: 'Fika Gicona' },
      { id: 'fika-850', name: 'Nougat', hex: '#c3b091', productName: 'Fika Gicona' },
      { id: 'fika-851', name: 'Milk Chocolate', hex: '#805533', productName: 'Fika Gicona' },
      { id: 'fika-852', name: 'Chocolate Cake', hex: '#3f2a1d', productName: 'Fika Gicona' },
      { id: 'fika-853', name: 'Coffee', hex: '#6f4e37', productName: 'Fika Gicona' },
      { id: 'fika-860', name: 'Muddy', hex: '#6b5344', productName: 'Fika Gicona' },
      { id: 'fika-861', name: 'Greige', hex: '#a8a99e', productName: 'Fika Gicona' },
      { id: 'fika-862', name: 'Sweet Pralin', hex: '#daa06d', productName: 'Fika Gicona' },
      { id: 'fika-870', name: 'Pale Powder', hex: '#f0ead6', productName: 'Fika Gicona' },
      { id: 'fika-871', name: 'Cracker', hex: '#ddc7a1', productName: 'Fika Gicona' },
      { id: 'fika-872', name: 'Grain', hex: '#d9c89e', productName: 'Fika Gicona' },
      { id: 'fika-873', name: 'Sand', hex: '#c2b280', productName: 'Fika Gicona' },
      { id: 'fika-874', name: 'Soft Linen', hex: '#faf0e6', productName: 'Fika Gicona' },
    ]
  }
];

// Generate temperature ranges from colors
export function generateTemperatureRanges(
  colors: string[],
  minTemp: number = -20,
  maxTemp: number = 35
): TemperatureRange[] {
  const rangeSize = (maxTemp - minTemp) / colors.length;

  return colors.map((color, index) => ({
    min: Math.round((minTemp + index * rangeSize) * 10) / 10,
    max: Math.round((minTemp + (index + 1) * rangeSize) * 10) / 10,
    color,
    colorName: getColorName(index, colors.length)
  }));
}

function getColorName(index: number, total: number): string {
  const names = [
    'Isig', 'Mycket kall', 'Kall', 'Kylig', 'Sval',
    'Mild', 'Behaglig', 'Varm', 'Het', 'Tropisk'
  ];

  if (total <= names.length) {
    const step = Math.floor(names.length / total);
    return names[Math.min(index * step, names.length - 1)];
  }

  return `Färg ${index + 1}`;
}

// Find color for a temperature
export function getColorForTemperature(
  temp: number,
  ranges: TemperatureRange[]
): { color: string; colorName: string } {
  for (const range of ranges) {
    if (temp >= range.min && temp < range.max) {
      return { color: range.color, colorName: range.colorName };
    }
  }

  // Handle edge cases
  if (temp < ranges[0].min) {
    return { color: ranges[0].color, colorName: ranges[0].colorName };
  }

  const lastRange = ranges[ranges.length - 1];
  return { color: lastRange.color, colorName: lastRange.colorName };
}

// Generate pattern from temperature data
export function generatePattern(
  temperatureData: TemperatureData[],
  settings: PatternSettings
): PatternResult {
  const rows: PatternRow[] = temperatureData.map(data => {
    const { color, colorName } = getColorForTemperature(data.temperature, settings.colorRanges);
    return {
      date: data.date,
      temperature: data.temperature,
      color,
      colorName
    };
  });

  // Calculate statistics
  const temps = rows.map(r => r.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

  // Count colors
  const colorCounts = new Map<string, number>();
  rows.forEach(row => {
    colorCounts.set(row.color, (colorCounts.get(row.color) || 0) + 1);
  });

  // Find most common
  let mostCommonColor = '';
  let maxCount = 0;
  colorCounts.forEach((count, color) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonColor = color;
    }
  });

  const mostCommonRange = rows.find(r => r.color === mostCommonColor)?.colorName || '';

  // Calculate yarn usage
  const yarnUsage: YarnUsage[] = [];
  const metersPerRow = calculateMetersPerRow(settings.stitchesPerRow, settings.yarnWeight);
  const gramsPerMeter = getGramsPerMeter(settings.yarnWeight);

  colorCounts.forEach((count, color) => {
    const row = rows.find(r => r.color === color);
    const meters = count * metersPerRow;
    yarnUsage.push({
      color,
      colorName: row?.colorName || '',
      rows: count,
      metersNeeded: Math.ceil(meters),
      gramsNeeded: Math.ceil(meters * gramsPerMeter)
    });
  });

  // Sort by most used
  yarnUsage.sort((a, b) => b.rows - a.rows);

  const totalLength = rows.length * settings.rowHeight / 10; // Convert mm to cm

  return {
    rows,
    totalRows: rows.length,
    totalLength,
    yarnNeeded: yarnUsage,
    temperatureStats: {
      minTemp,
      maxTemp,
      avgTemp: Math.round(avgTemp * 10) / 10,
      mostCommonRange
    }
  };
}

// Calculate meters of yarn per row based on stitches and yarn weight
function calculateMetersPerRow(stitches: number, yarnWeight: string): number {
  // Approximate meters per stitch for different yarn weights
  const metersPerStitch: Record<string, number> = {
    lace: 0.015,
    fingering: 0.02,
    sport: 0.025,
    dk: 0.03,
    worsted: 0.035,
    aran: 0.04,
    bulky: 0.05,
    super_bulky: 0.06
  };

  return stitches * (metersPerStitch[yarnWeight] || 0.03);
}

// Get grams per meter for different yarn weights
function getGramsPerMeter(yarnWeight: string): number {
  const gramsPerMeter: Record<string, number> = {
    lace: 0.2,
    fingering: 0.25,
    sport: 0.35,
    dk: 0.45,
    worsted: 0.55,
    aran: 0.7,
    bulky: 1.0,
    super_bulky: 1.5
  };

  return gramsPerMeter[yarnWeight] || 0.45;
}

// Generate pattern description text
export function generatePatternDescription(result: PatternResult, settings: PatternSettings): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════');
  lines.push('     TEMPERATURMÖNSTER - VIRKNING');
  lines.push('═══════════════════════════════════════');
  lines.push('');
  lines.push(`Plats: ${settings.location.name}`);
  lines.push(`Period: ${settings.startDate} till ${settings.endDate}`);
  lines.push(`Mätningstid: kl ${settings.hour}:00`);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('MÅTT OCH MATERIAL');
  lines.push('───────────────────────────────────────');
  lines.push(`Antal rader: ${result.totalRows}`);
  lines.push(`Maskor per rad: ${settings.stitchesPerRow}`);
  lines.push(`Radhöjd: ${settings.rowHeight} mm`);
  lines.push(`Total längd: ca ${Math.round(result.totalLength)} cm`);
  lines.push(`Garnvikt: ${getYarnWeightName(settings.yarnWeight)}`);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('TEMPERATURSTATISTIK');
  lines.push('───────────────────────────────────────');
  lines.push(`Lägsta temperatur: ${result.temperatureStats.minTemp}°C`);
  lines.push(`Högsta temperatur: ${result.temperatureStats.maxTemp}°C`);
  lines.push(`Medeltemperatur: ${result.temperatureStats.avgTemp}°C`);
  lines.push(`Vanligaste intervall: ${result.temperatureStats.mostCommonRange}`);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('GARNÅTGÅNG PER FÄRG');
  lines.push('───────────────────────────────────────');

  result.yarnNeeded.forEach(yarn => {
    lines.push(`${yarn.colorName}: ${yarn.rows} rader = ${yarn.metersNeeded} m (${yarn.gramsNeeded} g)`);
  });

  const totalMeters = result.yarnNeeded.reduce((sum, y) => sum + y.metersNeeded, 0);
  const totalGrams = result.yarnNeeded.reduce((sum, y) => sum + y.gramsNeeded, 0);

  lines.push('');
  lines.push(`TOTALT: ${totalMeters} meter (${totalGrams} gram)`);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('FÄRGSKALA');
  lines.push('───────────────────────────────────────');

  settings.colorRanges.forEach(range => {
    lines.push(`${range.min}°C till ${range.max}°C: ${range.colorName}`);
  });

  lines.push('');
  lines.push('═══════════════════════════════════════');

  return lines.join('\n');
}

function getYarnWeightName(weight: string): string {
  const names: Record<string, string> = {
    lace: 'Spetsgarn',
    fingering: 'Fingering / Sockgarn',
    sport: 'Sport',
    dk: 'DK / 8 ply',
    worsted: 'Worsted',
    aran: 'Aran',
    bulky: 'Tjockt garn',
    super_bulky: 'Supertjockt garn'
  };
  return names[weight] || weight;
}
