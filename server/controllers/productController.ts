import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

const productListSelect = {
    id: true,
    name: true,
    price: true,
    originalPrice: true,
    image: true,
    category: true,
    unit: true,
    stock: true,
    rating: true,
    reviewCount: true,
    createdAt: true
};

// GET /api/products/flash-deals
export const getFlashDeals = async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        orderBy: { originalPrice: "desc" },
        take: 8,
        select: productListSelect
    });

    const productsWithDiscount = products.map((p: any) => {
        const discount = p.originalPrice && p.price
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
            : 0;

        return { ...p, discount };
    });

    res.json({
        products: productsWithDiscount.slice(0, 8)
    });
}

export const getProducts = async (req: Request, res: Response) => {
    const { category, search, minPrice, maxPrice, sort, organic } = req.query;
    const where: any = {};

    if (category && category !== "all")
        where.category = category as string;

    if (search)
        where.name = { contains: search as string, mode: "insensitive" };

    if (organic)
        where.isOrganic = organic === "true";

    if (minPrice || maxPrice) {
        where.price = {};

        if (minPrice)
            where.price.gte = Number(minPrice);

        if (maxPrice)
            where.price.lte = Number(maxPrice);
    }

    const orderBy: any = {};

    if (sort === "price-low" || sort === "price_asc")
        orderBy.price = "asc";
    else if (sort === "price-high" || sort === "price_desc")
        orderBy.price = "desc";
    else if (sort === "rating")
        orderBy.rating = "desc";
    else if (sort === "name")
        orderBy.name = "asc";
    else
        orderBy.createdAt = "desc";

    const hasPage = req.query.page !== undefined;
    const requestedLimit = Number.parseInt(String(req.query.limit || "12"), 10);
    const limit = hasPage || req.query.limit !== undefined
        ? Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 12, 1), 100)
        : undefined;
    const page = Math.max(Number.parseInt(String(req.query.page || "1"), 10) || 1, 1);
    const query: any = { where, orderBy, select: productListSelect };

    if (limit !== undefined) {
        query.take = limit;
        query.skip = (page - 1) * limit;
    }

    let products;
    let total: number | undefined;
    if (hasPage) {
        [products, total] = await Promise.all([
            prisma.product.findMany(query),
            prisma.product.count({ where })
        ]);
    } else {
        products = await prisma.product.findMany(query);
    }

    const productsWithDiscount = products.map((p: any) => {
        const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        return { ...p, discount }
    })
    res.json({
        products: productsWithDiscount,
        ...(total !== undefined && limit !== undefined
            ? { total, pages: Math.ceil(total / limit) }
            : {})
    });
}

export const getProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id as string }
    });

    if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
    }

    const discount = product.originalPrice && product.price
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
        : 0;

    res.json({
        product: { ...product, discount }
    });
}

export const createProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.create({
        data: req.body
    })

    res.status(201).json({ product })
}

// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.update({
        where: { id: req.params.id as string },
        data: req.body
    });

    res.json({ product });
}

// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
    await prisma.product.update({
        where: { id: req.params.id as string },
        data: {stock: Number(0)}
    });

    res.json({ message: "Product Updated" });
}