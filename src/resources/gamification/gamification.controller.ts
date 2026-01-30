
import { Request, Response, NextFunction } from 'express'
import * as GamificationService from './gamification.service'

export const getMyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user?.id // Assuming auth middleware populates user
        if (!userId) throw new Error('User not authenticated')

        const profile = await GamificationService.getGamificationProfile(userId)
        res.status(200).json(profile)
    } catch (error) {
        next(error)
    }
}

export const getMyBadges = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user?.id
        if (!userId) throw new Error('User not authenticated')

        // Optional: seed badges if empty (temporary hack for dev)
        await GamificationService.seedBadges()

        const badges = await GamificationService.getBadges(userId)
        res.status(200).json(badges)
    } catch (error) {
        next(error)
    }
}

export const getMyRewards = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user?.id
        if (!userId) throw new Error('User not authenticated')

        const rewards = await GamificationService.getRewards(userId)
        res.status(200).json(rewards)
    } catch (error) {
        next(error)
    }
}

export const claimReward = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user?.id
        const { id } = req.params // rewardId

        if (!userId) throw new Error('User not authenticated')

        const result = await GamificationService.claimReward(userId, id)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}
