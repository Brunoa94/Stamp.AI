# Stamp It - Feature Specification

## Feature Overview
**Feature Name:** Stamp It - Custom Product Creator
**Purpose:** Create custom-designed products using AI-generated artwork
**User Flow:** Multi-step wizard from design to product

---

## Step-by-Step User Journey

### Step 1: Upload (Optional)
**What is requested:**
- Upload a reference image (optional)
  - Accepted formats: PNG, JPG, JPEG, WebP
  - Max file size: 10MB
  - Used as inspiration for AI generation

**User can:**
- Upload an image, OR
- Skip to next step (text-only generation)

**Required:** Nothing (optional step)

---

### Step 2: Synthesis - Create Your Design
**What is requested:**

#### **Required:**
1. **Text Prompt** (Required)
   - Description of desired artwork
   - Example: "A majestic mountain landscape at sunset"
   - Min: 3 characters
   - Max: 500 characters

#### **Optional - Advanced Customization:**
2. **Art Style** (Optional)
   - Choose artistic style for generation
   - Options:
     - None (default)
     - Realistic
     - Cartoon
     - Abstract
     - Minimalist
     - Watercolor
     - Oil Painting
     - Digital Art
     - Sketch

3. **Preservation Slider** (Optional, only if image uploaded)
   - How much to preserve original uploaded image
   - Range: 0% to 100%
   - Default: 80%
   - 0% = completely new design inspired by image
   - 100% = keep image mostly as-is with minor enhancements

**User Action Required:** Click "Stamp It! 🎨" button

---

### Step 3: Generation (Automatic)
**What happens:** AI generates artwork based on inputs

**No user input required**
- System processes prompt + style + preservation
- Generates 1 unique design
- Takes 10-30 seconds typically

**User sees:**
- Loading animation
- "Creating your design..." message
- Progress indicator

---

### Step 4: Results - Review Your Design
**What is shown:**
- AI-generated artwork
- Enhanced prompt used
- Generated history (previous designs)

**What is requested:**
User must choose one action:

1. **"Use This Image"** → Proceed to product selection
2. **"Generate Again"** → Go back and modify prompt
3. **Select from History** → Choose a previously generated design (up to 20 recent)

**Required:** User must approve one design to continue

---

### Step 5: Product Selection - Choose Your Item
**What is requested:**

#### **Required Selections (in order):**

1. **Product Type/Item** (Required)
   - Available options:
     - T-Shirts (multiple brands/styles)
     - Hoodies
     - Sweatshirts
     - Tank Tops
     - Long Sleeves
     - Mugs
     - Phone Cases
     - Tote Bags
     - Posters
     - Canvas Prints
     - Stickers
     - (+ more product types)
   - Each shows:
     - Product name
     - Brand/manufacturer
     - Available colors
     - Available sizes (if applicable)
     - Base price
     - Product photos

2. **Color** (Required)
   - Available colors depend on selected product
   - Common options:
     - White
     - Black
     - Navy
     - Heather Grey
     - Red
     - Royal Blue
     - Forest Green
     - (varies by product type)
   - Shown as color swatches

3. **Size** (Required for applicable products)
   - Available sizes depend on selected product
   - For apparel:
     - XS (Extra Small)
     - S (Small)
     - M (Medium)
     - L (Large)
     - XL (Extra Large)
     - 2XL (2X Large)
     - 3XL (3X Large)
   - For other items (mugs, posters, etc.):
     - Size may not be applicable
     - Or specific dimensions (e.g., 11oz mug, 16oz mug)
   - Size availability may vary by color

**All required selections must be made before proceeding**
**Note:** Some products (like mugs, stickers) may not require size selection

**User Action Required:** Click "Create Product" button

---

### Step 6: Creating Product (Automatic)
**What happens:** System creates custom product

**No user input required**
- Uploads AI design to print provider
- Creates product with selected options
- Generates product mockups
- Takes 5-15 seconds

**User sees:**
- Loading animation
- "Creating your product..." message
- Progress indicator

---

### Step 7: Product Confirmation
**What is shown:**
- Product mockup (item with your design)
- Product details:
  - Product type/brand
  - Selected color
  - Selected size (if applicable)
  - Price breakdown
- Design preview

**What is requested:**
User must choose one action:

1. **"Add to Cart"** → Save for later, continue shopping
2. **"Buy Now"** → Proceed directly to checkout
3. **"Edit"** → Go back and change selections

**Required:** Choose how to proceed with product

---

## Summary of Required Information

### Required at Each Step:
1. **Synthesis Step:**
   - ✅ Text prompt (3-500 characters)

2. **Results Step:**
   - ✅ Approve one design (click "Use This Image")

3. **Product Selection:**
   - ✅ Product type/item
   - ✅ Color
   - ✅ Size (if applicable to product)

4. **Confirmation:**
   - ✅ Choose: Add to Cart or Buy Now

### Optional Information:
- Uploaded reference image
- Art style preference
- Preservation level (if image uploaded)

---

## User Requirements

**To use this feature, user must:**
- ✅ Be logged in (authenticated)
- ✅ Have sufficient credits for AI generation (varies)
- ✅ Have internet connection
- ✅ Have browser that supports file upload (if uploading image)

**Credits Required:**
- Image generation: X credits per image
- (Additional generations cost more credits)

---

## Output

**What user receives:**
1. **Custom Product** with:
   - Unique AI-generated design
   - Selected product type/item
   - Chosen color
   - Chosen size (if applicable)
   - Professional mockup images

2. **Product Data:**
   - Printify product ID
   - Variant ID for exact configuration
   - Print-ready design file
   - Mockup preview images

**User can then:**
- Add to cart for checkout
- Order immediately
- View in their product library
- Reorder same product later

---

## Validation Rules

### Text Prompt:
- ✅ Minimum 3 characters
- ✅ Maximum 500 characters
- ❌ Cannot be empty
- ❌ No special characters that break AI

### Uploaded Image (if provided):
- ✅ Must be image file (PNG, JPG, JPEG, WebP)
- ✅ Max 10MB file size
- ✅ Minimum 512x512 pixels recommended
- ❌ No GIFs or animated images
- ❌ No videos

### Product Selection:
- ✅ Must select one product type/item
- ✅ Must select one color from available options
- ✅ Must select one size (if applicable to the product)
- ❌ Cannot proceed without all required selections

---

## Error Messages (User-Facing)

### Generation Errors:
- "Image generation failed. Please try again."
- "Prompt contains inappropriate content."
- "File upload failed. Please try a different image."
- "Not enough credits. Please purchase more credits."

### Product Creation Errors:
- "Failed to create product. Please try again."
- "Selected color/size combination is unavailable."
- "Unable to upload design to print provider."

### Selection Errors:
- "Please enter a prompt to generate your design."
- "Please select a product type."
- "Please select a color."
- "Please select a size." (if applicable)

---

## Success Confirmation

**After completing all steps:**
- ✅ Product created successfully
- ✅ Product saved to user's library
- ✅ Ready for purchase
- ✅ Mockup images available
- ✅ Can proceed to checkout

---

**Feature Complete**: User has a ready-to-purchase custom product with their AI-generated design on their chosen item.
