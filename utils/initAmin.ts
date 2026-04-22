import bcrypt from 'bcrypt';
import { db } from "../config/dbConnection";
import { admin } from '../db/schema/admin';
import { eq } from 'drizzle-orm';

export async function initSuperAdmin() {
    try {
        await db.transaction(async (tx) => {
            const email = "enghussainullah@gmail.com";
            
            // Check if super admin exists
            const existingAdmin = await tx.select().from(admin).where(eq(admin.email, email));
            
            if (existingAdmin.length > 0) {
                console.log(" Super admin already exists");
                return;
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash('khan123', 10);
            
            // Insert super admin
            await tx.insert(admin).values({
                email: email,
                password: hashedPassword,
                name: "Hussain Ullah",
                role: "super_admin",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log("Super admin created successfully");
        });
    } catch (error) {
        console.error("Failed to create super admin:", error);
        throw error;
    }
}