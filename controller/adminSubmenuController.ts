import { Request, Response } from "express";
import { successResponse, failureResponse } from "../helper/sendResponse";
import * as service from "../service/adminSubmenuService"

interface SubMenuItem {
    title: string;
    icon: string;
    orderBy: number;
    parent_id: number;  // Changed from string to number
    path: string;
    isActive?: boolean;
    requiresAuth?: boolean;
    roles?: string[];
}

// add 
export const addController = async (req: Request, res: Response) => {
    try {
        const payload: SubMenuItem = req.body
        const user = await service.addService(payload);
        successResponse(res, user, 'sub-menu created successfully');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to add sub-menu';
        failureResponse(res, errorMessage);
    }
};
// delete
export const deleteController = async (req: Request, res: Response) => {
    try {
        const {id} = req.body
        const user = await service.deleteService(id);
        successResponse(res, user, 'sub-menu successfully deleted');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to delete sub-menu';
        failureResponse(res, errorMessage);
    }
};
// update
export const updateController = async (req: Request, res: Response) => {
    try {
        const {id, ...payload} = req.body
        const user = await service.updateService(id, payload);
        successResponse(res, user, 'sub-menu updated successfully');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to update sub-menu';
        failureResponse(res, errorMessage);
    }
};
// get all
export const getAll = async (req: Request, res: Response) => {
    try {
        const user = await service.getAllService();
        successResponse(res, user, 'successfully fetched all sub-menu');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to fetch all sub-menu';
        failureResponse(res, errorMessage);
    }
};
// get by id
export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        const user = await service.getByIdService(id);
        successResponse(res, user, 'sub-menu fetch by id');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to fetch sub-menu by id';
        failureResponse(res, errorMessage);
    }
};