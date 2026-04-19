// services/admin/mainMenu.service.ts
import { db } from "../config/dbConnection";
import { mainMenu, subMenu } from "../db/schema/navigationItems";
import { eq, asc } from "drizzle-orm";

// ── Interface 
interface MainMenuItem {
    title: string;
    path: string;
    icon?: string;
    orderBy?: number;
    isActive?: boolean;
}

// ── Add Main Menu 
export const addService = async (payload: MainMenuItem) => {
    const { title, path, orderBy = 0, isActive = true } = payload;
    console.log('h service', payload);
    

    // Validate required fields
    if (!title || !path) {
        throw new Error('Title and path are required');
    }

    // Duplicate check
    const existingItem = await db.query.mainMenu.findFirst({
        where: eq(mainMenu.title, title),
    });

    if (existingItem) {
        throw new Error('Main menu item already exists');
    }

    // Check for duplicate path
    const existingPath = await db.query.mainMenu.findFirst({
        where: eq(mainMenu.path, path),
    });

    if (existingPath) {
        throw new Error('Path already exists');
    }

    // Insert
    const [menuItem] = await db.insert(mainMenu)
        .values({ 
            title, 
            path, 
            orderBy,
            isActive,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .returning();

    return {
        success: true,
        message: 'Main menu item created successfully',
        data: menuItem
    };
};

// ── Delete Main Menu
export const deleteService = async (id: number) => {
    // Check if exists
    const item = await db.query.mainMenu.findFirst({
        where: eq(mainMenu.id, id),
    });

    if (!item) {
        throw new Error('Main menu item not found');
    }

    // Check if has sub menus
    const subMenus = await db.query.subMenu.findMany({
        where: eq(subMenu.mainMenuId, id),
    });

    if (subMenus && subMenus.length > 0) {
        throw new Error(`Cannot delete main menu because it has ${subMenus.length} sub menu(s). Delete sub menus first.`);
    }

    // Delete
    const [deletedItem] = await db.delete(mainMenu)
        .where(eq(mainMenu.id, id))
        .returning();

    return {
        success: true,
        message: 'Main menu item deleted successfully',
        data: deletedItem
    };
};

// ── Update Main Menu
export const updateService = async (id: number, payload: Partial<MainMenuItem>) => {
    // Check if exists
    const item = await db.query.mainMenu.findFirst({
        where: eq(mainMenu.id, id),
    });

    if (!item) {
        throw new Error('Main menu item not found');
    }

    // Duplicate title check (excluding current item)
    if (payload.title) {
        const duplicate = await db.query.mainMenu.findFirst({
            where: eq(mainMenu.title, payload.title),
        });

        if (duplicate && duplicate.id !== id) {
            throw new Error('Title already exists');
        }
    }

    // Duplicate path check (excluding current item)
    if (payload.path) {
        const duplicatePath = await db.query.mainMenu.findFirst({
            where: eq(mainMenu.path, payload.path),
        });

        if (duplicatePath && duplicatePath.id !== id) {
            throw new Error('Path already exists');
        }
    }

    // Update
    const [updatedItem] = await db.update(mainMenu)
        .set({
            ...payload,
            updatedAt: new Date(),
        })
        .where(eq(mainMenu.id, id))
        .returning();

    return {
        success: true,
        message: 'Main menu item updated successfully',
        data: updatedItem
    };
};

// ── Get All Main Menus with their Sub Menus
export const getAllService = async () => {
    try {
        // Get all main menus
        const mainMenus = await db.select()
            .from(mainMenu)
            .orderBy(asc(mainMenu.orderBy));
        
        // For each main menu, get its sub menus
        const result = [];
        
        for (const menu of mainMenus) {
            const subMenus = await db.select()
                .from(subMenu)
                .where(eq(subMenu.mainMenuId, menu.id))
                .orderBy(asc(subMenu.orderBy));
            
            result.push({
                ...menu,
                subMenus: subMenus
            });
        }
        
        return {
            success: true,
            count: result.length,
            data: result
        };
    } catch (error) {
        console.error('Error in getAllService:', error);
        throw new Error(`Failed to fetch menus: ${error.message}`);
    }
};

// ── Get All Main Menus (Simple - for dropdowns)
export const getSimpleAllService = async () => {
    try {
        const menus = await db.select({
            id: mainMenu.id,
            name: mainMenu.title,
            title: mainMenu.title,
            path: mainMenu.path,
            orderBy: mainMenu.orderBy,
            isActive: mainMenu.isActive
        })
        .from(mainMenu)
        .where(eq(mainMenu.isActive, true))
        .orderBy(asc(mainMenu.orderBy));
        
        return {
            success: true,
            count: menus.length,
            data: menus
        };
    } catch (error) {
        console.error('Error in getSimpleAllService:', error);
        throw new Error(`Failed to fetch main menus: ${error.message}`);
    }
};

// ── Get Single Main Menu by ID
export const getByIdService = async (id: number) => {
    try {
        // Get main menu
        const item = await db.query.mainMenu.findFirst({
            where: eq(mainMenu.id, id),
        });

        if (!item) {
            throw new Error('Main menu item not found');
        }

        // Get its sub menus
        const subMenus = await db.select()
            .from(subMenu)
            .where(eq(subMenu.mainMenuId, id))
            .orderBy(asc(subMenu.orderBy));

        return {
            success: true,
            data: {
                ...item,
                subMenus: subMenus
            }
        };
    } catch (error) {
        console.error('Error in getByIdService:', error);
        throw new Error(`Failed to fetch menu: ${error.message}`);
    }
};

// ── Toggle Main Menu Status
export const toggleStatusService = async (id: number) => {
    const item = await db.query.mainMenu.findFirst({
        where: eq(mainMenu.id, id),
    });

    if (!item) {
        throw new Error('Main menu item not found');
    }

    const [updated] = await db.update(mainMenu)
        .set({ 
            isActive: !item.isActive,
            updatedAt: new Date()
        })
        .where(eq(mainMenu.id, id))
        .returning();

    return {
        success: true,
        message: `Main menu ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated
    };
};

// ── Reorder Main Menus
export const reorderService = async (items: { id: number; orderBy: number }[]) => {
    const results = [];
    
    for (const item of items) {
        const [updated] = await db.update(mainMenu)
            .set({ 
                orderBy: item.orderBy, 
                updatedAt: new Date() 
            })
            .where(eq(mainMenu.id, item.id))
            .returning();
        
        results.push(updated);
    }
    
    return {
        success: true,
        message: 'Menu order updated successfully',
        data: results
    };
};