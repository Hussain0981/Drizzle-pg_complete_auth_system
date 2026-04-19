import { Request, Response } from "express";
import { successResponse, failureResponse } from "../helper/sendResponse";
import * as service from "../service/adminMenuService"

interface SubMenuItem {
    title: string;
    path: string;
    orderBy?: number;
}

// add 
export const addController = async (req: Request, res: Response) => {
    try {
        const payload: SubMenuItem = req.body
        const user = await service.addService(payload);
        successResponse(res, user, 'menu created successfully');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to add menu';
        failureResponse(res, errorMessage);
    }
};
// delete
export const deleteController = async (req: Request, res: Response) => {
    try {
        const {id} = req.body
        const user = await service.deleteService(id);
        successResponse(res, user, 'menu successfully deleted');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to delete menu';
        failureResponse(res, errorMessage);
    }
};
// update
export const updateController = async (req: Request, res: Response) => {
    try {
        const {id, ...payload} = req.body
        const user = await service.updateService(id, payload);
        successResponse(res, user, 'menu updated successfully');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to update menu';
        failureResponse(res, errorMessage);
    }
};
// get all
export const getAll = async (req: Request, res: Response) => {
    try {
        const user = await service.getAllService();
        successResponse(res, user, 'successfully fetched all menu');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to fetch all menu';
        failureResponse(res, errorMessage);
    }
};
// get by id
export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        const user = await service.getByIdService(id);
        successResponse(res, user, 'menu fetch by id');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to fetch menu by id';
        failureResponse(res, errorMessage);
    }
};