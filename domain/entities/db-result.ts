export function returnResult(message = "Operation successful", success = true, result: any, error?: any, extraData?: Record<string, any>): ResultItem<any> {
    return {
        success,
        message,
        result,
        error,
        extraData,
    }
}