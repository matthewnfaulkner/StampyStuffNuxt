export interface Product {
    id:          number;
    title:       string;
    description: string;
    thumbnail:   {
        filename_disk: string
    }
    images:      {
        filename_disk: string;
    };
    quantity?:   number;
    variants: ProductVariant[];
}

export interface ProductVariant {
    id:          number;
    product:     Product;
    price:       number;
    image:       {
        filename_disk: string
    };
    color?:      string;
    size?:       string;
    sku?:        string;
    quantity?:   number;
}