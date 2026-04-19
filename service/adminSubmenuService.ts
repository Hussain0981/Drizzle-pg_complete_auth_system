import { db } from "../config/dbConnection";
import { subMenu, mainMenu } from "../db/schema/navigationItems";
import { eq, asc } from "drizzle-orm";

interface SubMenuItem {
    title: string;
    icon: string;
    orderBy: number;
    parent_id: number;  
    path: string;
    isActive?: boolean;
    requiresAuth?: boolean;
    roles?: string[];
}

// ── Add Sub Menu Item 
export const addService = async (payload: SubMenuItem) => {
    const { title, path, icon, parent_id } = payload;
    console.log('service', payload)
    const parentMenu = await db.query.mainMenu.findFirst({
        where: eq(mainMenu.id, parent_id),
    });

    if (!parentMenu) {
        throw new Error('Parent menu not found');
    }

    // check duplicate
    const existingItem = await db.query.subMenu.findFirst({
        where: eq(subMenu.title, title),
    });

    if (existingItem) {
        throw new Error('Menu item already exists');
    }

    // Insert
    const [menuItem] = await db.insert(subMenu)
        .values({
            title,
            path,
            icon: icon ?? null,
            mainMenuId : parent_id,
        })
        .returning();

    return menuItem;
};

// ── Delete Sub Menu Item ─────────────────────────────────
export const deleteService = async (id: number) => {
    // if exists
    const item = await db.query.subMenu.findFirst({
        where: eq(subMenu.id, id),
    });

    if (!item) {
        throw new Error('Menu item not found');
    }

    // Delete
    const [deletedItem] = await db.delete(subMenu)
        .where(eq(subMenu.id, id))
        .returning();

    return deletedItem;
};

// ── Update Sub Menu Item ─────────────────────────────────
export const updateService = async (id: number, payload: Partial<SubMenuItem>) => {
    // if exist 
    const item = await db.query.subMenu.findFirst({
        where: eq(subMenu.id, id),
    });

    if (!item) {
        throw new Error('Menu item not found');
    }

    if (payload.parent_id) {
        const parentMenu = await db.query.mainMenu.findFirst({
            where: eq(mainMenu.id, payload.parent_id),
        });

        if (!parentMenu) {
            throw new Error('Parent menu not found');
        }
    }

    //  Update
    const [updatedItem] = await db.update(subMenu)
        .set({
            ...payload,
            updatedAt: new Date(),
        })
        .where(eq(subMenu.id, id))
        .returning();

    return updatedItem;
};

// ── Get All
export const getAllService = async () => {
    const items = await db.query.mainMenu.findMany({
        with: {
            subMenus: {
                orderBy: asc(subMenu.title),
            },
        },
        orderBy: asc(mainMenu.title),
    });

    return items;
};

// ── Get Single Sub Menu Item 
export const getByIdService = async (id: number) => {
    const item = await db.query.subMenu.findFirst({
        where: eq(subMenu.id, id),
        with: {
            mainMenu: true,
        },
    });

    if (!item) {
        throw new Error('Menu item not found');
    }

    return item;
};