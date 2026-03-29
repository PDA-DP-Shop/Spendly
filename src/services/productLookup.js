export const lookupBarcode = async (barcode) => {
  // 1. Try UPCitemdb (Worldwide general products: electronics, household, etc)
  try {
    const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`)
    const upcData = await upcRes.json()
    
    if (upcData.code === 'OK' && upcData.items && upcData.items.length > 0) {
      const item = upcData.items[0]
      return {
        name: item.title,
        brand: item.brand,
        image: item.images?.[0] || null,
        categoryTags: item.category ? item.category.split(' > ') : []
      }
    }
  } catch (e) {
    console.warn('UPCitemdb lookup failed, trying fallback...', e)
  }

  // 2. Try Open Products Facts (Worldwide general items)
  try {
    const opRes = await fetch(`https://world.openproductsfacts.org/api/v0/product/${barcode}.json`)
    const opData = await opRes.json()
    if (opData.status === 1 && opData.product && opData.product.product_name) {
      return {
        name: opData.product.product_name,
        brand: opData.product.brands || '',
        image: opData.product.image_front_url || null,
        categoryTags: opData.product.categories_tags || []
      }
    }
  } catch (e) {
    console.warn('OpenProductsFacts lookup failed', e)
  }

  // 3. Fallback to Open Food Facts (Worldwide food & groceries)
  try {
    const foodRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    const foodData = await foodRes.json()
    if (foodData.status === 1 && foodData.product && foodData.product.product_name) {
      return {
        name: foodData.product.product_name,
        brand: foodData.product.brands || '',
        image: foodData.product.image_front_url || null,
        categoryTags: foodData.product.categories_tags || []
      }
    }
  } catch (e) {
    console.error('OpenFoodFacts lookup failed', e)
  }

  return null
}
