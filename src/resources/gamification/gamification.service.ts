
import DBService from '../../services/db'

// Service to handle gamification logic
export const getGamificationProfile = async (userId: string) => {
    const db = DBService.getClient()
    let profile = await db.gamificationProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    })

    if (!profile) {
        profile = await db.gamificationProfile.create({
            data: { userId },
            include: {
                user: {
                    select: {
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        })
    }

    return profile
}

export const getBadges = async (userId: string) => {
    const db = DBService.getClient()

    // Get all available badges
    const allBadges = await db.badge.findMany()

    // Get user's earned badges
    const userBadges = await db.userBadge.findMany({
        where: { userId },
        include: { badge: true },
    })

    // Map to add "earned" status
    return allBadges.map((badge) => {
        const earned = userBadges.find((ub) => ub.badgeId === badge.id)
        return {
            ...badge,
            earned: !!earned,
            earnedAt: earned ? earned.earnedAt : null
        }
    })
}

export const getRewards = async (userId: string) => {
    const db = DBService.getClient()

    // Get all active rewards
    const rewards = await db.reward.findMany({
        where: { isActive: true }
    })

    // Get user rewards history/status if needed (optional)
    // For now just returning catalog
    return rewards
}

export const claimReward = async (userId: string, rewardId: string) => {
    const db = DBService.getClient()

    return await db.$transaction(async (tx) => {
        const reward = await tx.reward.findUnique({ where: { id: rewardId } })
        if (!reward) throw new Error('Reward not found')

        const profile = await tx.gamificationProfile.findUnique({ where: { userId } })
        if (!profile) throw new Error('Profile not found')

        if (profile.points < reward.costPoints) {
            throw new Error('Insufficient points')
        }

        // Deduct points
        await tx.gamificationProfile.update({
            where: { userId },
            data: { points: { decrement: reward.costPoints } }
        })

        // Create user reward
        const userReward = await tx.userReward.create({
            data: {
                userId,
                rewardId,
                status: 'AVAILABLE'
            }
        })

        return userReward
    })
}

// Initial seeder helper (can be called if no badges exist)
export const seedBadges = async () => {
    const db = DBService.getClient()
    const count = await db.badge.count()
    if (count === 0) {
        await db.badge.createMany({
            data: [
                { name: 'First Order', description: 'Placed your first order', pointsRequired: 0, criteria: 'first_order' },
                { name: 'Foodie', description: 'Ordered 10 times', pointsRequired: 100, criteria: 'orders_10' },
                { name: 'Streak 3', description: 'Ordered 3 days in a row', pointsRequired: 50, criteria: 'streak_3' },
                { name: 'Elite Member', description: 'Earned 1000 total points', pointsRequired: 500, criteria: 'points_1000' }
            ]
        })
    }
}

export const processOrderCompletion = async (userId: string, orderId: string) => {
    const db = DBService.getClient()

    return await db.$transaction(async (tx) => {
        // 1. Get or create gamification profile
        let profile = await tx.gamificationProfile.findUnique({ where: { userId } })
        if (!profile) {
            profile = await tx.gamificationProfile.create({ data: { userId } })
        }

        // 2. Award Points (e.g., 10 points per order)
        const pointsToAdd = 10
        const updatedProfile = await tx.gamificationProfile.update({
            where: { userId },
            data: {
                points: { increment: pointsToAdd },
                lastActivityDate: new Date()
            }
        })

        // 3. Check for Badges
        const orderCount = await tx.order.count({ where: { customerId: userId, status: 'DELIVERED' } })
        const earnedBadgeIds = (await tx.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map(b => b.badgeId)

        const availableBadges = await tx.badge.findMany({
            where: { id: { notIn: earnedBadgeIds } }
        })

        for (const badge of availableBadges) {
            let earned = false
            if (badge.criteria === 'first_order' && orderCount >= 1) earned = true
            if (badge.criteria === 'orders_10' && orderCount >= 10) earned = true
            if (badge.criteria === 'points_1000' && updatedProfile.points >= 1000) earned = true

            if (earned) {
                await tx.userBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id
                    }
                })
                // Award bonus points for earning a badge
                await tx.gamificationProfile.update({
                    where: { userId },
                    data: { points: { increment: 50 } }
                })
            }
        }

        return updatedProfile
    })
}
