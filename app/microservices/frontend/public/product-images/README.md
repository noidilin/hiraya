# Product Images

This folder contains production-ready images for your vintage products.

## Expected Image Files

Place your AI-generated production images with these exact filenames:

1. `1970s-prairie-midi-dress.jpg` - For "1970s Prairie Midi Dress" product
2. `1980s-wool-blazer.jpg` - For "1980s Wool Blazer" product  
3. `1990s-leather-shoulder-bag.jpg` - For "1990s Leather Shoulder Bag" product
4. `art-deco-pendant-necklace.jpg` - For "Art Deco Pendant Necklace" product
5. `suede-block-heel-boots.jpg` - For "Suede Block Heel Boots" product

## Image Specifications

- **Format**: JPG or PNG recommended
- **Resolution**: 800x800px or higher for best quality
- **File Size**: Under 500KB for fast loading
- **Background**: Clean, professional product photography
- **Style**: Vintage fashion aesthetic

## Adding New Products

When you add new products, update the `getImageForProduct()` function in `simple-product-service.js` to include appropriate image mapping.

Example for a new product:
```javascript
else if (productName.includes('product name')) {
  return '/product-images/new-product-image.jpg';
}
```

## Placeholder

The `placeholder.jpg` is used for any products that don't have specific images mapped.

## Testing

After adding images, test by visiting: http://localhost:3000/products