export function successResponse(res: Response, data: any, message: string, success = true, statusCode = 200) {
    res.status(statusCode).json({
        success,
        message,
        data,
    })
}
export function failureResponse(res: Response, message: string, success = false, statusCode = 400) {
    res.status(statusCode).json({
        success,
        message,
    })
}