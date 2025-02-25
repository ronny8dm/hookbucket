import { useEffect, useState } from "react";
import { ShopifyProduct } from "@/lib/utils";

const GET_PRODUCTS = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          status
          totalInventory
          featuredImage {
            url
          }
          productType
          vendor
          collections(first: 10) {
            edges {
              node {
                title
              }
            }
          }
          publishedAt
        }
      }
    }
  }
`;

const CREATE_PRODUCT = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
        status
        totalInventory
        featuredImage {
          url
        }
        productType
        vendor
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CREATE_MEDIA = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        ... on MediaImage {
          id
          image {
            url
          }
        }
      }
      mediaUserErrors {
        code
        field
        message
      }
    }
  }
`;

const DELETE_PRODUCT = `
  mutation deleteProduct($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_PRODUCT = `
  mutation updateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        handle
        status
        totalInventory
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const handleUnauthorized = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
}

export function useShopifyProducts() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopify/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_PRODUCTS,
          variables: { first: 50 },
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const formattedProducts = data.products.edges.map(
        (edge: any) => edge.node
      );
      setProducts(formattedProducts);

    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch products")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopify/products/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: DELETE_PRODUCT,
          variables: { input: { id: productId } },
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setProducts(products.filter((product) => product.id !== productId));
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to delete product")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<ShopifyProduct>
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopify/products/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: UPDATE_PRODUCT,
          variables: {
            input: {
              id: productId,
              ...updates,
            },
          },
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setProducts(
        products.map((product) =>
          product.id === productId
            ? { ...product, ...data.data.productUpdate.product }
            : product
        )
      );
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to update product")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (productData: {
    title: string;
    description: string;
    productType: string;
    vendor: string;
    price: number;
    compareAtPrice?: number;
    costPerItem?: number;
    sku?: string;
    barcode?: string;
    quantity?: number;
    images?: File[];
  }) => {
    try {
      setLoading(true);
      const formData = new FormData();
  
      formData.append(
        'productData',
        JSON.stringify({
          query: CREATE_PRODUCT,
          variables: {
            input: {
              title: productData.title,
              descriptionHtml: productData.description,
              productType: productData.productType,
              vendor: productData.vendor,
              status: 'ACTIVE',
              variants: [
                {
                  price: productData.price.toString(),
                  compareAtPrice: productData.compareAtPrice?.toString(),
                  inventoryItem: {
                    cost: productData.costPerItem?.toString(),
                    tracked: true,
                  },
                  inventoryQuantities: [
                    {
                      availableQuantity: productData.quantity || 0,
                      locationId: `gid://shopify/Location/${import.meta.env.SHOPIFY_LOCATION_ID}`
                    }
                  ],
                  sku: productData.sku,
                  barcode: productData.barcode,
                },
              ]
            },
          },
        })
      );
  
      if (productData.images?.length) {
        productData.images.forEach(image => {
          formData.append('images', image);
        });

        formData.append(
            'mediaData',
            JSON.stringify({
              query: CREATE_MEDIA,
              variables: {}
            })
          );
      }
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopify/products/create`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
  
      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.message || 'Failed to create product');
      }
  
      return responseData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create product'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    deleteProduct,
    updateProduct,
    createProduct, 
    refreshProducts: fetchProducts,
  };
}
