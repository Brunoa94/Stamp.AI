# My Orders - Feature Specification

## Feature Overview
**Feature Name:** My Orders
**Purpose:** View, manage, and track order history
**User Flow:** Browse orders → Filter/Sort → View details → Take actions
**Page:** `/orders`

---

## Step-by-Step User Journey

### Step 1: View Orders List
**What is shown:**
- List of all user's orders
- Order cards/rows displaying:
  - Order number (e.g., #ORD-2024-001234)
  - Order date
  - Order status badge
  - Total amount
  - Number of items
  - Thumbnail preview of items
  - Available actions

**What is requested:**
**Nothing required** - Orders automatically load for logged-in user

**User Requirements:**
- ✅ Must be logged in (authenticated)
- ✅ Must have placed at least one order

**No Orders State:**
- Empty state shown if no orders exist
- Message: "You haven't placed any orders yet"
- Call-to-action: "Start creating" button

---

### Step 2: Filter Orders (Optional)
**What is requested:**

#### **Optional Filters:**

1. **Status Filter** (Optional)
   - Filter by order status
   - Available options:
     - **All** (default) - Show all orders
     - **Pending** - Order created, payment pending
     - **Waiting Confirmation** - Payment captured, awaiting confirmation
     - **Confirmed** - Order confirmed, ready for production
     - **Processing** - In production at print provider
     - **Shipped** - Order shipped, in transit
     - **Delivered** - Order delivered to customer
     - **Cancelled** - Order cancelled
     - **Unsuccessful Confirmation** - Order failed confirmation

2. **Timeframe Filter** (Optional)
   - Filter by date range
   - Available options:
     - **Last 30 Days** (default)
     - **Last 90 Days**
     - **2023** - Specific year
     - **All Time** - No date filtering

**User Action:** Select filters from dropdowns/tabs

**Result:** Orders list updates to show only matching orders

**No Matches State:**
- Alert shown if no orders match filters
- Message: "No orders match the selected filters"

---

### Step 3: Pagination (Automatic)
**What happens:** Orders are paginated

**Settings:**
- 10 orders per page
- Pagination controls at bottom
- Shows: "Showing 1-10 of 25 orders"

**What is requested:**
**Optional:** User can navigate between pages
- "Previous" button
- Page numbers (1, 2, 3...)
- "Next" button

---

### Step 4: View Order Details (Optional)
**What is requested:**
**User Action:** Click on any order row or "View Details" button

**What is shown in modal:**

1. **Order Summary:**
   - Order number
   - Order date & time
   - Order status badge
   - Total amount
   - Payment method
   - Payment status

2. **Customer Information:**
   - Shipping address:
     - Full name
     - Street address
     - City, State, ZIP
     - Country
   - Contact email

3. **Order Items:**
   - List of all items in order
   - For each item:
     - Product image/mockup
     - Product name
     - Variant details (color, size)
     - Quantity
     - Price per item
     - Subtotal

4. **Tracking Information** (if applicable):
   - Shipping carrier (e.g., USPS, FedEx, UPS)
   - Tracking number
   - Tracking URL (clickable link)
   - Shipped date
   - Estimated delivery date
   - Delivered date (if completed)

**Required:** Nothing - view only

**User Action:** Click "Close" or X to dismiss modal

---

### Step 5: Order Actions (Optional)

#### **Action 1: Cancel Order**
**Availability:** Only for orders that can be cancelled

**When available:**
- Order status is "Pending" or "Waiting Confirmation"
- NOT available once order reaches "Processing" (in production)

**What is requested:**
1. User clicks "Cancel Order" button
2. **Confirmation Modal appears** asking:
   - "Are you sure you want to cancel this order?"
   - Order number displayed
   - Warning about cancellation

**User must choose:**
- **"Cancel Order"** (red button) → Proceed with cancellation
- **"Keep Order"** (secondary button) → Close modal, keep order

**What happens on confirm:**
- Order cancelled at Printify (if applicable)
- Refund processed automatically (if payment captured)
- Order status updated to "Cancelled"
- Order list refreshed
- Success toast notification shown

**Cancellation Results:**
- ✅ Order cancelled at Printify
- ✅ Refund processed (if applicable)
- ⚠️ If refund fails, user notified to contact support

**Cannot Cancel:**
- Orders in "Processing" or later stages
- Error toast shown: "Order can no longer be cancelled"
- Explanation: "Orders can only be cancelled before entering In Production"

---

#### **Action 2: Reorder**
**Availability:** For any completed order

**What is requested:**
User clicks "Reorder" button

**What happens:**
- Redirects to product creation page
- Pre-fills with previous order details
- User can modify before adding to cart

**Note:** Currently shows as TODO in implementation

---

#### **Action 3: View Tracking**
**Availability:** For shipped orders with tracking

**What is requested:**
User clicks "Track Order" button or tracking link

**What happens:**
- Opens tracking URL in new tab
- Shows carrier's tracking page (USPS, FedEx, UPS)
- User can see real-time shipping updates

**Required:** Nothing - external link

---

#### **Action 4: Download Invoice** (Future)
**Availability:** For paid orders

**What is requested:**
User clicks "Download Invoice" button

**What happens:**
- Generates PDF invoice
- Downloads to user's device
- Invoice contains order details, items, pricing

**Note:** May be future feature

---

## Summary of User Interactions

### **Viewing Orders:**
**Nothing required** - Automatic load
- User must be logged in
- Orders display automatically

### **Filtering (Optional):**
- Status filter: Choose from 9 status options
- Timeframe filter: Choose from 4 time ranges

### **Pagination (Optional):**
- Navigate between pages (10 orders per page)

### **View Details (Optional):**
- Click order to see full details modal
- View order summary, items, tracking, customer info

### **Cancel Order (Conditional):**
**Required:**
- Confirmation: "Are you sure?" → Yes/No

**Availability:**
- Only if order status is "Pending" or "Waiting Confirmation"
- Cannot cancel once in production

### **Reorder (Optional):**
- Click to create new order with same details

### **Track Order (Optional):**
- Click tracking link to see shipping status

---

## Order Status Definitions

**User-facing status descriptions:**

- **Pending:** Order created, awaiting payment confirmation
- **Waiting Confirmation:** Payment captured, order being confirmed
- **Confirmed:** Order confirmed and ready for production
- **Processing:** Your order is being printed and prepared
- **Shipped:** Order is on its way to you
- **Delivered:** Order successfully delivered
- **Cancelled:** Order has been cancelled
- **Unsuccessful Confirmation:** Order failed confirmation, refund initiated

---

## Data Displayed Per Order

**In Orders List:**
- Order number (e.g., #ORD-2024-001234)
- Order date (e.g., "June 7, 2024")
- Status badge (colored, with icon)
- Total amount (e.g., "$29.99")
- Item count (e.g., "2 items")
- Product thumbnails
- Available actions (View, Cancel, Reorder)

**In Order Details Modal:**
- Full order number
- Order date & time (e.g., "June 7, 2024 at 3:45 PM")
- Status badge
- Total amount
- Payment method (Stripe, PayPal)
- Payment status (Paid, Refund Pending, Refunded)
- Customer name
- Full shipping address
- Contact email
- List of all items with details
- Tracking information (if shipped)
- Carrier & tracking number
- Shipped date
- Estimated/actual delivery date

---

## Validation & Business Rules

### **Cancellation Rules:**
- ✅ Can cancel: "Pending" or "Waiting Confirmation"
- ❌ Cannot cancel: "Processing", "Shipped", "Delivered"
- ❌ Cannot cancel: Already "Cancelled"

### **Refund Rules:**
- Automatic refund if payment was captured
- Refund processed through original payment method
- If refund fails, user must contact support

### **Tracking Rules:**
- Tracking only available for "Shipped" or "Delivered" orders
- Tracking number must exist
- Tracking URL opens carrier's website

---

## Error Scenarios

### **Loading Errors:**
- "Failed to load orders. Please try again."
- Retry button available

### **Cancellation Errors:**
- "Order can no longer be cancelled" (if in production)
- "Failed to cancel order" (if API error)
- "Refund could not be processed automatically" (if refund fails)

### **Empty States:**
- "You haven't placed any orders yet" (no orders)
- "No orders match the selected filters" (no filtered results)

---

## Success Notifications

### **Order Cancelled:**
- Toast: "Order cancelled"
- Description: Details about cancellation and refund status
- Examples:
  - "Order cancelled at Printify. Refund processed successfully."
  - "Your order has been cancelled."
  - "Note: Refund could not be processed automatically"

---

## Pagination Details

**Settings:**
- 10 orders per page
- Shows current range: "Showing 1-10 of 25 orders"
- Navigation:
  - Previous button (disabled on first page)
  - Page numbers (clickable)
  - Next button (disabled on last page)

---

## Mobile vs Desktop

**Both versions show:**
- Same data and functionality
- Different layouts (cards vs table)

**Desktop:**
- Table layout with columns
- Filters in horizontal bar
- Pagination at bottom

**Mobile:**
- Card layout (stacked)
- Filters in dropdown/sheet
- Compact pagination

---

## Output

**What user can do:**
- ✅ View all their orders
- ✅ Filter by status and timeframe
- ✅ See detailed order information
- ✅ Track shipped orders
- ✅ Cancel eligible orders
- ✅ Reorder previous items
- ✅ Navigate order history with pagination

**What user receives:**
- Complete order history
- Real-time order status
- Tracking information for shipments
- Ability to manage active orders
- Order confirmation details
- Customer and payment information

---

**Feature Complete**: User can view, filter, track, and manage all their orders in one place.
