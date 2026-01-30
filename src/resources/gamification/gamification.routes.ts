
import { Router } from 'express'
import * as GamificationController from './gamification.controller'
import { authenticateJWT } from '../../common/middleware/auth.middleware'

const router: Router = Router()

// All routes here should be protected
router.use(authenticateJWT)

router.get('/me/gamification', GamificationController.getMyProfile)
router.get('/me/badges', GamificationController.getMyBadges)
router.get('/me/rewards', GamificationController.getMyRewards)
router.post('/rewards/:id/claim', GamificationController.claimReward)

export default router
