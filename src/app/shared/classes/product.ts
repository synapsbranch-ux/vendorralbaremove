// Products
export interface Product {
    id?: number;
    title?: string;
    description?: string;
    type?: string;
    brand?: string;
    collection?: any[];
    category?: string;
    price?: number;
    sale?: boolean;
    discount?: number;
    stock?: number;
    new?: boolean;
    quantity?: number;
    tags?: any[];
    variants?: Variants[];
    images?: Images[];
}

export interface ProductNew {
    _id?: string;
    product_name?: string;
    product_slug?: string;
    product_description?: string;
    product_department?: ProDepartment[];
    product_category?: ProCatagories[];
    product_store?: ProStores[];
    product_owner?: ProOwner[];
    product_varient?: NewVariants[];
    product_varient_options?: VariantsOptions[];
    product_image?: NewImages[];
    product_3d_image?: New3dImages[];
    product_retail_price?: number;
    product_sale_price?: number;
    status?: string;
    stock?: number;
    createdAt?: Date;
    updatedAt?: Date;
    quantity?: number;
    cart_id?: string;
    tags?: any[];
}
export interface ProductNew2 {
    _id?: string;
    product_name?: string;
    product_slug?: string;
    product_description?: string;
    product_department?: ProDepartment[];
    product_category?: ProCatagories[];
    product_store?: ProStores[];
    product_varient?: NewVariants[];
    product_varient_options?: VariantsOptions[];
    product_image?: NewImages[];
    product_3d_image?: New3dImages[];
    product_retail_price?: number;
    product_sale_price?: number;
    status?: string;
    stock?: number;
    createdAt?: Date;
    updatedAt?: Date;
    quantity?: number;
}
export interface ProCatagories {
    category_name?: string;
    category_slug?: string;
    status?: string;
    _id?: string;
}

export interface NewVariants {
    _id?: number;
    varient_name?: string;
}
export interface VariantsOptions {
    size_options?: any[];
    color_options?: any[];
}

export interface NewImages {
    pro_image?: string;
    status?: string;
}

export interface New3dImages {
    pro_3d_image?: string;
    status?: string;
}

export interface Variants {
    variant_id?: number;
    id?: number;
    sku?: string;
    size?: string;
    color?: string;
    image_id?: number;
}


export interface ProDepartment
{
    _id?: number;
    department_name?: string;  
    department_slug?: string;  
}

export interface ProStores
{
    _id?: number;
    store_name?: string;  
    store_slug?: string;  
}
export interface ProOwner {
    _id?: string;
    name?: string;
}


export interface Images {
    image_id?: number;
    id?: number;
    alt?: string;
    src?: string;
    variant_id?: any[];
}