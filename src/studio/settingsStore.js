import { supabase } from '../lib/supabase'

let _cache = null

export async function loadSettings() {
  if (_cache) return _cache
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) throw error
  _cache = {}
  for (const { key, value } of (data || [])) _cache[key] = value
  return _cache
}

export async function saveSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
  if (_cache) _cache[key] = value
}

export function invalidateSettingsCache() { _cache = null }

export const SETTING_DEFAULTS = {
  room_types: [
    'Bedroom', 'Master Bedroom', 'Ground Floor Master Bedroom', 'Ground Floor Bedroom',
    'First Floor Master Bedroom', 'First Floor Guest Bedroom', 'First Floor Kids Bedroom',
    'First Floor Bedroom 1', 'First Floor Bedroom 2', 'Kids Room', 'Guest Room',
    'Hall', 'Living Room', 'Dining Room', 'Dining', 'Kitchen', 'Modular Kitchen',
    'Pooja Room', 'Pooja', 'Bathroom', 'Balcony', 'Entrance / Foyer', 'Foyer',
    'Utility Area', 'Play Area', 'Office Room', 'Store Room', 'Staircase',
    'Additional Works', 'Other',
  ],
  item_types: [
    'TV Unit Panelling', 'TV Unit Box', 'TV Unit', 'False Ceiling', 'Wall Panelling',
    'Console', 'Base Unit', 'Base Unit Shutters', 'Base Unit (Acrylic)',
    'Wall Unit', 'Wall Unit Shutters', 'Wall Unit (Acrylic)',
    'Loft', 'Loft Shutters', 'Loft (Acrylic)',
    'Breakfast Counter', 'Breakfast Counter (Acrylic)', 'Kitchen Accessories',
    'Shoe Rack', 'Cupboard Frame & Shutters', 'Crockery Unit',
    'Wardrobe', 'Walk-in Wardrobe', 'Cot with Headboard', 'Bedside Table',
    'Dresser', 'Study Table & Wall Unit', 'Bathroom Vanity',
    'Flooring', 'Wall Painting', 'Tiles', 'Wallpaper',
    'Electrical', 'Plumbing', 'Carpentry', 'Furniture', 'Staircase', 'Other',
  ],
  category_types: ['Panelling', 'Carcass', 'Loft', 'False Ceiling', 'Carcass BWP', 'Cot', 'Partition', 'Others'],
  brand_types: ['Brand', 'Non Brand', 'NA'],
  rate_guide: {
    'Panelling':     { nonBrand: '300-400',   brand: '400-500'   },
    'Carcass':       { nonBrand: '700-800',   brand: '800-900'   },
    'Loft':          { nonBrand: '500-600',   brand: '600-700'   },
    'False Ceiling': { nonBrand: '65-75',     brand: '80-100'    },
    'Carcass BWP':   { nonBrand: '800-900',   brand: '1000-1100' },
    'Cot':           { nonBrand: '1200-1300', brand: '1300-1400' },
    'Partition':     { nonBrand: '200-300',   brand: '300-400'   },
    'Others':        { nonBrand: 'Nil',       brand: 'Nil'       },
  },
  default_terms: `1. Given quotation is for the above mentioned products.\n2. Electrical work, electrical fittings and civil work not included.\n3. Payment: 60% advance on confirmation / 30% on/before door installation / 10% on handover.`,
  company: {
    name: 'Dreamspace Interiors',
    tagline: 'Luxury in Every Detail',
    social: '@sandboxinterior',
  },
}
