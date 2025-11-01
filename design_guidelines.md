# StockLine - Design Guidelines

## Design Approach

**Selected Framework**: Design System Approach - Material Design 3 / Fluent Design hybrid
**Justification**: StockLine is a data-intensive enterprise application requiring clarity, consistency, and efficiency. Drawing inspiration from modern productivity tools (Linear, Notion, Asana) while maintaining professional stability.

---

## Typography System

**Primary Font Family**: Inter (Google Fonts)
**Secondary Font Family**: JetBrains Mono (for numerical data, codes)

**Hierarchy**:
- Page Titles: text-3xl font-bold (30px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-xl font-semibold (20px)
- Body Text: text-base font-normal (16px)
- Labels/Captions: text-sm font-medium (14px)
- Metadata/Timestamps: text-xs font-normal (12px)
- Numbers/Stats: font-mono for consistency

**French Language Considerations**: Ensure proper character support for accents (é, è, à, ç, etc.)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (between related elements): gap-2, p-2
- Standard padding: p-4, p-6
- Section spacing: py-8, py-12
- Page margins: p-6 lg:p-8

**Grid System**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Product listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Data tables: Full-width with horizontal scroll on mobile

**Container Strategy**:
- Main content area: max-w-7xl mx-auto
- Forms: max-w-2xl
- Modals: max-w-lg to max-w-3xl depending on content

---

## Component Library

### Navigation
**Sidebar (Desktop)**:
- Fixed left sidebar, w-64, full height
- Logo area at top (h-16)
- Navigation items with icons (Heroicons) aligned left
- Active state: subtle background, bold text
- Collapsible for more screen space (w-16 when collapsed, showing only icons)

**Top Bar**:
- Fixed header (h-16) with shadow
- Contains: breadcrumb navigation, search bar, notifications bell, user avatar dropdown
- Mobile: hamburger menu to toggle sidebar

**Mobile Navigation**:
- Bottom tab bar (fixed) for primary actions
- Slide-in drawer for full menu

### Dashboard Cards (KPI)
**Stat Cards**:
- Rounded corners (rounded-lg)
- Shadow: shadow-sm hover:shadow-md transition
- Padding: p-6
- Layout: Icon + Label (small) + Large Number + Change Indicator (↑/↓ percentage)
- Grid: 4 columns on desktop, 2 on tablet, 1 on mobile

**Chart Cards**:
- Larger cards (min-h-80)
- Header with title and filter dropdown
- Recharts integrated with responsive container
- Types: Line (entrées/sorties), Bar (catégories), Pie (répartition), List (top 5 produits)

### Tables
**Data Tables**:
- Full-width with rounded-lg border
- Header row: sticky top, font-semibold, text-sm
- Row height: min-h-12
- Alternating row treatment for readability
- Hover state on rows
- Action buttons (icon only) in last column
- Pagination: centered at bottom with page numbers + arrows
- Mobile: Cards instead of tables for better readability

**Search & Filters Bar**:
- Sticky above table
- Search input (w-full md:w-96) with icon
- Filter dropdowns inline (category, status, date range)
- Clear filters button

### Forms
**Input Fields**:
- Height: h-12 for consistency
- Rounded: rounded-md
- Labels: text-sm font-medium mb-2
- Required indicator: asterisk in label
- Error state: red border + error message text-sm
- Success state: green border + checkmark icon

**Form Layout**:
- Two-column grid on desktop (grid-cols-2 gap-6)
- Single column on mobile
- File upload: Drag-and-drop area with preview for product images
- Submit buttons: Primary CTA (larger, px-8 py-3), Secondary (outlined)

### Buttons
**Primary Button**: px-6 py-3, rounded-md, font-medium, shadow-sm
**Secondary Button**: Outlined variant with same sizing
**Icon Buttons**: Square (h-10 w-10), rounded-md, icon centered
**Floating Action Button (FAB)**: Fixed bottom-right on mobile for quick add actions

### Alerts & Notifications
**Alert Banners**:
- Full-width at top of content area
- Types: Success, Error, Warning, Info
- Icon (Heroicons) + Message + Dismiss button
- Rounded: rounded-lg, Padding: p-4

**Stock Alerts**:
- Badge on product cards showing "Stock Faible" with warning icon
- Dedicated "Alertes" section in dashboard showing critical items
- Red dot indicator on sidebar menu item

**Toast Notifications**:
- Fixed top-right position
- Auto-dismiss after 5 seconds
- Stack vertically with gap-2
- Max width: max-w-sm

### Modals
**Standard Modal**:
- Centered overlay with backdrop blur
- Rounded: rounded-xl
- Max width: max-w-2xl
- Header (with title + close X), body (p-6), footer (with actions)
- Mobile: Full screen on small devices

**Confirmation Dialogs**:
- Smaller (max-w-md)
- Icon at top, message, two-button footer (Cancel + Confirm)

### User Profile & Avatar
**Avatar**: Circular (rounded-full), sizes: h-8 w-8 (small), h-10 w-10 (medium), h-16 w-16 (large)
**Dropdown Menu**: Right-aligned from avatar, rounded-lg, shadow-lg

---

## Page-Specific Layouts

### Login/Registration Pages
- Centered card (max-w-md) on full viewport
- Logo at top
- Form fields stacked vertically with gap-4
- Submit button full-width
- Links at bottom (small text)
- Clean, minimal, no sidebar

### Super Admin Dashboard
- Grid of enterprise cards (3 columns on desktop)
- Each card: Company logo + Name + Stats (users, products) + Status toggle + Actions menu
- Tabs for: Toutes les Entreprises / Actives / Désactivées
- Global statistics in header cards

### Company Dashboard
- 4 KPI cards at top (Produits Total, Valeur Stock, Alertes, Mouvements du Mois)
- Two-column chart section below
- Recent movements table
- "Actions Rapides" shortcut buttons

### Products Management
- Header: Add Product button (top-right), Search + Filters
- Grid view (default) with product cards showing image, name, stock, price
- Toggle to table view
- Product card: Image (aspect-square), details stacked, quick action icons on hover

### Stock Movements History
- Full-width table with filters
- Columns: Date, Type, Produit, Quantité, Utilisateur, Fournisseur
- Color-coded type badges (Entrée/Sortie)

---

## Responsive Breakpoints
- Mobile: < 640px (sidebar becomes drawer, cards stack, tables become card lists)
- Tablet: 640px - 1024px (2-column grids, sidebar visible)
- Desktop: ≥ 1024px (full layout with sidebar, multi-column grids)

---

## Accessibility
- Focus visible states on all interactive elements (ring-2 ring-offset-2)
- Proper ARIA labels on icon buttons
- Keyboard navigation support
- High contrast text (WCAG AA minimum)
- Form labels properly associated with inputs

---

## Animations
**Minimal, purposeful only**:
- Page transitions: None (instant for dashboard speed)
- Hover states: Scale 1.02 on cards, shadow increase
- Modal/dropdown entrance: Fade + slight scale (duration-200)
- Loading states: Skeleton screens (pulse animation) for data tables
- Toast notifications: Slide in from top-right

---

## Images Strategy
**No hero images** (this is a dashboard application, not a marketing site)

**Product Images**:
- Square aspect ratio (aspect-square) in cards and grids
- Fallback: Placeholder icon for products without images
- Upload interface: Drag-drop zone with preview

**Company Logos**:
- Small (h-10 w-10) in various UI elements
- Larger (h-16 w-16) on company cards
- Circular or square with rounded corners

**Empty States**:
- Illustration placeholders for empty tables/lists
- Centered with message and CTA button

---

## Dark Mode (Optional)
- Toggle in user dropdown menu
- Inverted values for backgrounds and text
- Charts maintain readability with adapted palettes
- Persistent via localStorage

This design ensures StockLine is professional, efficient, data-dense yet readable, and perfectly suited for daily business operations.