
## Overview

The HarvConnect Buyer Module is a comprehensive, production-quality frontend application built for the GDSS-PSInno AgriTech Challenge. It provides a premium marketplace experience for buyers to discover, purchase, and manage orders of fresh agricultural produce from local farmers.

## Architecture

### Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Custom Properties (no frameworks)
- **Icons**: Phosphor Icons
- **State Management**: Modular JavaScript with centralized state
- **API**: RESTful integration with Express.js backend
- **Authentication**: JWT-based with localStorage persistence

### Project Structure

```
HarvConnect/
├── pages/
│   ├── buyer-dashboard.html      # Main marketplace dashboard
│   ├── buyer-search.html         # Advanced search & filtering
│   ├── product-details.html      # Individual product view
│   ├── buyer-orders.html         # Order history & management
│   ├── checkout.html             # Cart & checkout flow
│   ├── buyer-chat.html           # Messaging with farmers
│   └── buyer-profile.html        # User profile & settings
│
├── scripts/
│   ├── api.js                    # Global API client (existing)
│   ├── buyer-shared.js           # Shared utilities & state management
│   ├── buyer-dashboard.js        # Dashboard controller
│   ├── buyer-search.js           # Search page controller
│   ├── product-details.js        # Product details controller
│   ├── buyer-orders.js           # Orders page controller
│   ├── checkout.js               # Checkout page controller
│   ├── buyer-chat.js             # Chat page controller
│   └── buyer-profile.js          # Profile page controller
│
├── styles/
│   ├── buyer-shared.css          # Shared components & utilities
│   ├── buyer-dashboard.css       # Dashboard-specific styles
│   ├── buyer-orders.css          # Orders page styles
│   ├── buyer-checkout.css        # Checkout page styles
│   ├── buyer-chat.css            # Chat page styles
│   └── buyer-profile.css         # Profile page styles
│
└── images/
    └── HarvConnect-logo.png      # Brand logo
```

## Core Features

### 1. Dashboard (`buyer-dashboard.html`)

- **Welcome Section**: Personalized greeting with user's first name
- **Search Bar**: Live filtering with debounced input
- **Category Filters**: Quick filter chips for produce categories
- **Featured Products**: Grid of available products with hover animations
- **Nearby Products**: Location-based product suggestions (GPS-enabled)
- **Loading States**: Skeleton cards during data fetch
- **Empty States**: Helpful illustrations when no data available
- **Error States**: Professional error messages with retry functionality

### 2. Search (`buyer-search.html`)

- **Advanced Filtering**: Filter by category, farmer, location
- **Sorting Options**: Price, rating, name, relevance
- **URL Parameters**: Shareable search queries
- **Real-time Results**: Instant filtering as user types
- **Results Count**: Dynamic product count display
- **Clear Filters**: One-click filter reset

### 3. Product Details (`product-details.html`)

- **Product Information**: Name, price, farmer, location, rating
- **Quantity Selector**: Add multiple units to cart
- **Add to Cart**: Persistent cart with localStorage
- **Buy Now**: Direct checkout from product page
- **Related Products**: Recommendations based on category
- **Product Features**: Delivery, quality, freshness badges

### 4. Orders (`buyer-orders.html`)

- **Order Tabs**: Ongoing, Completed, Cancelled orders
- **Order Cards**: Detailed order information with items
- **Status Tracking**: Visual status indicators (pending, processing, delivered)
- **Reorder**: Quick reorder from previous orders
- **Cancel Order**: Cancel pending orders
- **Order History**: Complete transaction history

### 5. Checkout (`checkout.html`)

- **Cart Management**: Update quantities, remove items
- **Delivery Information**: Address, phone, special instructions
- **Payment Methods**: Mobile Money, Cash on Delivery
- **Order Summary**: Subtotal, delivery fee, total
- **Free Delivery**: Automatic threshold calculation (GH₵ 500+)
- **Order Placement**: Complete order creation with validation

### 6. Chat (`buyer-chat.html`)

- **Conversations List**: Recent chats with farmers
- **Unread Badges**: Visual indicators for new messages
- **Real-time Messaging**: Simulated instant messaging
- **Message History**: Complete conversation threads
- **Auto-scroll**: Automatic scroll to latest message
- **Timestamps**: Relative time display (Just now, 5m ago, etc.)

### 7. Profile (`buyer-profile.html`)

- **Personal Information**: Name, email, phone, location
- **Edit Profile**: Inline profile editing
- **Account Settings**: Notification preferences, 2FA toggle
- **Delivery Addresses**: Multiple address management
- **Order Statistics**: Total orders, spending, ratings
- **Danger Zone**: Account deletion (demo mode)

## Shared Components

### BuyerApp (buyer-shared.js)

The `BuyerApp` module provides a centralized state management and utility system:

```javascript
// State Management
BuyerApp.state.cart; // Shopping cart items
BuyerApp.state.products; // Cached products
BuyerApp.state.orders; // Cached orders
BuyerApp.state.user; // Current user data

// Authentication
BuyerApp.requireAuth(); // Route guard
BuyerApp.getUser(); // Get current user
BuyerApp.logout(); // Clear session & redirect

// Cart Operations
BuyerApp.addToCart(product, qty); // Add item to cart
BuyerApp.removeFromCart(id); // Remove item
BuyerApp.updateCartQuantity(id, qty); // Update quantity
BuyerApp.getCartTotal(); // Calculate total
BuyerApp.getCartCount(); // Total items count
BuyerApp.clearCart(); // Empty cart

// API Operations
BuyerApp.fetchProducts(); // Get all products
BuyerApp.fetchProduct(id); // Get single product
BuyerApp.fetchOrders(); // Get user orders
BuyerApp.createOrder(data); // Create new order
BuyerApp.apiRequest(endpoint); // Generic API call

// UI Utilities
BuyerApp.formatPrice(amount); // Format GH₵ currency
BuyerApp.renderProductCard(product); // Render product HTML
BuyerApp.renderProductCards(products, container); // Render grid
BuyerApp.showLoading(container); // Show skeleton loader
BuyerApp.showError(container, msg); // Show error state
BuyerApp.showEmptyState(container); // Show empty state
BuyerApp.showNotification(msg); // Show toast notification

// Navigation
BuyerApp.navigateTo(page, params); // Navigate between pages
BuyerApp.getUrlParams(); // Get URL query parameters
```

### CSS Architecture

**buyer-shared.css**: Base styles, CSS custom properties, reusable components

- Buttons (primary, secondary, ghost)
- Forms (inputs, selects, textareas)
- Cards (product cards, order cards)
- Grid layouts
- Loading skeletons
- Empty states
- Notifications
- Modals
- Responsive breakpoints

**Page-specific CSS**: Extends shared styles with page-specific components

- buyer-dashboard.css: Welcome cards, category chips, product grids
- buyer-orders.css: Order tabs, order cards, status badges
- buyer-checkout.css: Cart items, payment methods, order summary
- buyer-chat.css: Chat container, messages, conversations list
- buyer-profile.css: Profile header, settings, statistics

## Design System

### Colors

- **Primary Green**: #147a42 (brand color)
- **Primary Hover**: #106335
- **Primary Light**: #e8f7ee
- **Success**: #10b981
- **Warning**: #f59e0b
- **Error**: #ef4444
- **Info**: #3b82f6

### Typography

- **Font Family**: Segoe UI, Roboto, Helvetica Neue, Arial
- **Base Size**: 16px
- **Scale**: xs (0.75rem) to 3xl (1.875rem)

### Spacing

- **Scale**: xs (0.25rem) to 2xl (3rem)
- **Consistent**: All components use CSS custom properties

### Border Radius

- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **full**: 9999px (pills)

### Shadows

- **sm**: Subtle elevation
- **md**: Card hover states
- **lg**: Modals, dropdowns
- **xl**: Notifications

## API Integration

### Base URL

```
https://harvconnect-backend-api-v1-production.up.railway.app/api/v1
```

### Endpoints Used

- `GET /products` - Fetch all products
- `GET /products/:id` - Fetch single product
- `GET /orders` - Fetch user orders
- `POST /orders` - Create new order
- `PATCH /orders/:id` - Update order status
- `GET /auth/me` - Fetch user profile
- `PATCH /auth/profile` - Update user profile

### Authentication

All API requests include JWT token in Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Error Handling

- 401 Unauthorized: Auto-logout and redirect to login
- Network errors: Fallback to demo data
- API errors: User-friendly error messages with retry

## State Management

### Cart Persistence

Cart data is stored in localStorage:

```javascript
localStorage.setItem("harvconnect_cart", JSON.stringify(cart));
```

### Session Management

User session stored in localStorage:

```javascript
localStorage.setItem("harvconnect_token", token);
localStorage.setItem("harvconnect_user", JSON.stringify(user));
localStorage.setItem("harvconnect_user_role", role);
```

### Demo Data

Fallback demo products when API is unavailable:

- Fresh Tomatoes (GH₵ 80/basket)
- Organic Pepper (GH₵ 120/bag)
- Garden Eggs (GH₵ 95/sack)
- Fresh Okra (GH₵ 60/basket)
- Lettuce (GH₵ 45/head)
- Red Onions (GH₵ 150/bag)

## Responsive Design

### Breakpoints

- **Desktop**: 1024px+ (full sidebar, multi-column grids)
- **Tablet**: 768px - 1023px (adjusted spacing, 2-column grids)
- **Mobile**: < 768px (collapsed sidebar, single column)

### Mobile Adaptations

- Sidebar becomes top navigation
- Product grids collapse to single column
- Chat container stacks vertically
- Forms and buttons full-width
- Touch-friendly tap targets (min 44px)

## Performance Optimizations

### DOM Updates

- DocumentFragment for batch DOM insertions
- Cached selectors to minimize querySelector calls
- Event delegation where appropriate

### API Calls

- Debounced search input (300ms delay)
- Cached product data in state
- Lazy loading for product images
- Skeleton screens during loading

### CSS

- CSS custom properties for theming
- Hardware-accelerated animations (transform, opacity)
- Minimal repaints and reflows
- Optimized selectors

## Accessibility

### Semantic HTML

- Proper heading hierarchy (h1-h6)
- ARIA labels and roles
- Landmark regions (header, main, nav, aside)
- Form labels and descriptions

### Keyboard Navigation

- Focus visible states
- Keyboard-accessible buttons and links
- Enter key support for forms
- Tab order follows visual layout

### Screen Readers

- ARIA live regions for dynamic content
- Alt text for images
- Descriptive link text
- Status announcements

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Getting Started

### Prerequisites

- Modern web browser
- Backend API running (optional, demo mode available)
- Valid JWT token in localStorage

### Installation

1. Clone the repository
2. Navigate to `HarvConnect/` directory
3. Open `pages/login.html` in browser
4. Login with buyer credentials
5. Access buyer dashboard

### Demo Mode

If backend API is unavailable, the application automatically falls back to demo data. No additional configuration needed.

## User Flow

```
Login → Dashboard
  ↓
Browse Products / Search
  ↓
View Product Details
  ↓
Add to Cart
  ↓
Checkout
  ↓
Place Order
  ↓
View Orders
  ↓
Chat with Farmer (optional)
  ↓
Profile Management
```

## Future Enhancements

### Planned Features

- [ ] WebSocket integration for real-time chat
- [ ] Push notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Order tracking with maps
- [ ] Multiple payment gateways
- [ ] Invoice generation
- [ ] Social sharing
- [ ] Product recommendations AI
- [ ] Farmer ratings display

### Technical Improvements

- [ ] Service Worker for offline support
- [ ] PWA capabilities
- [ ] Image lazy loading with blur placeholder
- [ ] Virtual scrolling for large lists
- [ ] Unit tests with Jest
- [ ] E2E tests with Cypress
- [ ] Bundle optimization
- [ ] CDN for static assets

## Contributing

### Code Style

- Use meaningful variable and function names
- Comment complex logic
- Follow existing patterns
- Maintain accessibility standards
- Test on multiple browsers

### File Organization

- Keep page-specific code in separate files
- Share common functionality via buyer-shared.js
- Use CSS custom properties for consistency
- Avoid inline styles and scripts

## License

This project is part of the GDSS-PSInno AgriTech Challenge.

## Support

For issues or questions, please contact the HarvConnect development team.

---

**Built with ❤️ for the HarvConnect AgriTech Platform**
