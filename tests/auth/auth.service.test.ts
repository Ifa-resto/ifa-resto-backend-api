import { AuthService } from '../../src/services/auth.service'
import { prismaMock } from '../__mocks__/prisma'

jest.mock('@prisma/client')

describe('AuthService', () => {
  describe('register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'CUSTOMER',
        firstName: 'John',
        lastName: 'Doe',
      }

      prismaMock.user.findUnique.mockResolvedValue(null)
      prismaMock.user.create.mockResolvedValue({
        id: '1',
        email: userData.email,
        role: userData.role,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      })

      const result = await AuthService.register(userData)
      expect(result.email).toBe(userData.email)
    })
  })
})
