import { PrismaClient } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';
import bcrypt from 'bcryptjs';

export class UserService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async createUser(userData: any) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user with profile
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          role: userData.role || 'CUSTOMER',
          emailVerified: false,
          isActive: true,
          profile: {
            create: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              phoneNumber: userData.phone || null
            }
          }
        },
        include: {
          profile: true
        }
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          profile: true
        }
      });
      
      if (!user) {
        return null;
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          profile: true
        }
      });
      
      if (!user) {
        return null;
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: any) {
    try {
      // Separate profile data from user data
      const { firstName, lastName, phone, ...userData } = updateData;
      
      // Update user
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...userData,
          profile: {
            update: {
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(phone && { phoneNumber: phone })
            }
          }
        },
        include: {
          profile: true
        }
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      // Delete user (cascade will delete profile)
      await this.prisma.user.delete({
        where: { id }
      });
      
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async getAllUsers(page: number = 1, limit: number = 10, filters?: { role?: string, isActive?: boolean }) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {};
      if (filters?.role) {
        where.role = filters.role;
      }
      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          include: {
            profile: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        this.prisma.user.count({ where })
      ]);
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return {
        users: usersWithoutPasswords,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          orders: {
            take: 5,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              restaurant: true,
              tracking: {
                take: 1,
                orderBy: {
                  timestamp: 'desc'
                }
              }
            }
          }
        }
      });
      
      if (!user) {
        return null;
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      // Get current user with password
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });
      
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      logger.error('Error updating password:', error);
      throw error;
    }
  }

  async addDeliveryAddress(userId: string, addressData: any) {
    try {
      // Get user profile
      const profile = await this.prisma.profile.findUnique({
        where: { userId }
      });
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      // Create address
      const address = await this.prisma.address.create({
        data: {
          ...addressData,
          profileId: profile.id
        }
      });
      
      return address;
    } catch (error) {
      logger.error('Error adding delivery address:', error);
      throw error;
    }
  }

  async getDeliveryAddresses(userId: string) {
    try {
      // Get user profile
      const profile = await this.prisma.profile.findUnique({
        where: { userId }
      });
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      // Get addresses
      const addresses = await this.prisma.address.findMany({
        where: { profileId: profile.id },
        orderBy: { isDefault: 'desc' }
      });
      
      return addresses;
    } catch (error) {
      logger.error('Error fetching delivery addresses:', error);
      throw error;
    }
  }

  async updateDeliveryAddress(userId: string, addressId: string, addressData: any) {
    try {
      // Get user profile
      const profile = await this.prisma.profile.findUnique({
        where: { userId }
      });
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      // Verify address belongs to user
      const address = await this.prisma.address.findUnique({
        where: { id: addressId }
      });
      
      if (!address || address.profileId !== profile.id) {
        throw new Error('Address not found or does not belong to user');
      }
      
      // Update address
      const updatedAddress = await this.prisma.address.update({
        where: { id: addressId },
        data: addressData
      });
      
      return updatedAddress;
    } catch (error) {
      logger.error('Error updating delivery address:', error);
      throw error;
    }
  }

  async deleteDeliveryAddress(userId: string, addressId: string) {
    try {
      // Get user profile
      const profile = await this.prisma.profile.findUnique({
        where: { userId }
      });
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      // Verify address belongs to user
      const address = await this.prisma.address.findUnique({
        where: { id: addressId }
      });
      
      if (!address || address.profileId !== profile.id) {
        throw new Error('Address not found or does not belong to user');
      }
      
      // Delete address
      await this.prisma.address.delete({
        where: { id: addressId }
      });
      
      return { success: true, message: 'Address deleted successfully' };
    } catch (error) {
      logger.error('Error deleting delivery address:', error);
      throw error;
    }
  }

  async setDefaultAddress(userId: string, addressId: string) {
    try {
      // Get user profile
      const profile = await this.prisma.profile.findUnique({
        where: { userId }
      });
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      // Verify address belongs to user
      const address = await this.prisma.address.findUnique({
        where: { id: addressId }
      });
      
      if (!address || address.profileId !== profile.id) {
        throw new Error('Address not found or does not belong to user');
      }
      
      // Set all addresses to non-default
      await this.prisma.address.updateMany({
        where: { profileId: profile.id },
        data: { isDefault: false }
      });
      
      // Set selected address as default
      const updatedAddress = await this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true }
      });
      
      return updatedAddress;
    } catch (error) {
      logger.error('Error setting default address:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
export default UserService;
