# Lenis Smooth Scrolling Implementation

## Overview
This project uses [Lenis](https://lenis.darkroom.engineering/) for ultra-smooth scrolling with touch support enabled. Lenis provides momentum-based smooth scrolling for both desktop and mobile devices.

## Features
- ✅ Smooth mouse wheel scrolling on desktop
- ✅ Touch-enabled smooth scrolling on mobile/tablets
- ✅ High inertia for natural momentum feel
- ✅ Custom easing functions
- ✅ Auto-resize handling
- ✅ Modal/popup scroll prevention

## Implementation

### 1. Core Component
The `SmoothScroll` component (`app/components/SmoothScroll.jsx`) wraps the entire application and initializes Lenis with optimized settings:

```jsx
import SmoothScroll from './components/SmoothScroll';

// In your root layout
<SmoothScroll>
  {children}
</SmoothScroll>
```

### 2. Configuration
Key Lenis settings in use:
- **duration**: 1.2s for balanced smoothness
- **smoothTouch**: true (enables mobile smooth scrolling)
- **touchInertiaMultiplier**: 35 (high inertia for buttery smooth touch)
- **wheelMultiplier**: 1 (desktop scroll speed)
- **touchMultiplier**: 2 (mobile scroll speed)

### 3. Modal/Popup Handling

#### Method 1: Using the Hook
For components with modals/popups, use the `useLenisControl` hook:

```jsx
import { useLenisControl } from '@/app/hooks/useLenisControl';

function MyModal({ isOpen }) {
  // Automatically stops Lenis when modal is open
  useLenisControl(isOpen);
  
  return (
    // ... modal JSX
  );
}
```

#### Method 2: Manual Control
For more control, use the `useLenis` hook directly:

```jsx
import { useLenis } from '@/app/components/SmoothScroll';
import { useEffect } from 'react';

function MyModal({ isOpen }) {
  const lenis = useLenis();
  
  useEffect(() => {
    if (isOpen && lenis) {
      lenis.stop(); // Stop smooth scroll
    } else if (!isOpen && lenis) {
      lenis.start(); // Resume smooth scroll
    }
    
    return () => {
      if (lenis) lenis.start(); // Cleanup
    };
  }, [isOpen, lenis]);
  
  return (
    // ... modal JSX
  );
}
```

#### Method 3: Data Attribute (for scrollable content inside modals)
Add `data-lenis-prevent` to scrollable elements inside modals:

```jsx
<div className="overflow-y-auto max-h-96" data-lenis-prevent>
  {/* Scrollable content */}
</div>
```

## Components with Lenis Control

The following components have Lenis control implemented:

### User-Facing Modals (stop/start on open/close):
- ✅ `Login.jsx` - Login modal
- ✅ `Register.jsx` - Registration modal
- ✅ `Cart.jsx` - Shopping cart sidebar
- ✅ `QuickViewModal.jsx` - Product quick view
- ✅ `Users.jsx` - User edit modal (admin)

### Admin Modals (stop/start on open/close):
- ✅ `admin/coupons/page.js` - Coupon create/edit modal
- ✅ `admin/gold-prices/page.js` - Price update result modal
- ✅ `admin/categories/page.js` - Category & subcategory modals
- ✅ `admin/returns/page.js` - Return details, manual refund & manual return modals

### Scrollable Areas (data-lenis-prevent):
- ✅ `Cart.jsx` - Cart items list
- ✅ `QuickViewModal.jsx` - Mobile view
- ✅ `Login.jsx` - Modal scroll container
- ✅ `Register.jsx` - Modal scroll container
- ✅ `CouponCode.jsx` - Coupon list
- ✅ `SearchBar.jsx` - Search suggestions
- ✅ `FeaturedCollections.jsx` - Collections scroll area
- ✅ `admin/coupons/page.js` - Form scroll area
- ✅ `admin/gold-prices/page.js` - Modal content
- ✅ `admin/categories/page.js` - Form scroll areas
- ✅ `admin/returns/page.js` - All modal scroll areas

## CSS Styles

Global styles in `app/globals.css`:

```css
/* Lenis Smooth Scroll Styles */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
```

## Adding Lenis Control to New Modals

When creating a new modal/popup component:

1. Import the hook:
```jsx
import { useLenisControl } from '@/app/hooks/useLenisControl';
```

2. Call it with your modal state:
```jsx
function NewModal({ isOpen, onClose }) {
  useLenisControl(isOpen);
  
  return (
    <AnimatePresence>
      {isOpen && (
        // ... modal content
      )}
    </AnimatePresence>
  );
}
```

3. For scrollable areas inside the modal, add `data-lenis-prevent`:
```jsx
<div className="overflow-y-auto" data-lenis-prevent>
  {/* content */}
</div>
```

## Troubleshooting

### Issue: Scrolling not smooth
- Check if Lenis is initialized (look for `lenis` class on `<html>`)
- Verify no conflicting CSS (`scroll-behavior: smooth`)
- Check browser console for errors

### Issue: Modal content not scrolling
- Add `data-lenis-prevent` to the scrollable container
- Ensure the modal is stopping Lenis when open

### Issue: Background scrolls behind modal
- Verify modal component uses `useLenisControl` or manually stops Lenis
- Check that `overflow: hidden` is applied to body when modal is open

## Performance

Lenis uses `requestAnimationFrame` for optimal performance:
- Smooth 60fps scrolling
- Hardware-accelerated
- Minimal CPU usage
- Works well on low-end devices

## Browser Support

Lenis works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Documentation

For more information about Lenis configuration options:
- [Lenis GitHub](https://github.com/studio-freight/lenis)
- [Lenis Documentation](https://lenis.darkroom.engineering/)
