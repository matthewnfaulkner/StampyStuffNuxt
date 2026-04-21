export type CustomisationField = {
    id: string,
    name: string,
    type: string,
    value: any
}

export type CustomisationFile = {
	itemId: string,
	fieldId: string,
	file: File
}

export type CartOrderItem = {
	id: string,
	productId: string
	variantId: string;
	quantity: number;
	isCustom?: boolean;
	addons?: CartOrderItem[];
	customisationFields?: CustomisationField[];
}