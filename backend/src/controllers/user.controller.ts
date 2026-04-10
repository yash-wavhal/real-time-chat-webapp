import express, {Request, Response} from "express";

export const getMe = async (req: Request, res: Response) => {
    try {
        
    } catch (err: any) {
        console.log("Error in user controller", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
