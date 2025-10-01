import { clearAllAuthData } from './authUtils';

interface SafeDbResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  shouldSignOut?: boolean;
}

export class SafeDbWrapper {
  private db: any;
  private onTokenError?: () => void;

  constructor(db: any, onTokenError?: () => void) {
    this.db = db;
    this.onTokenError = onTokenError;
  }

  private isTokenError(error: any): boolean {
    return error?.message?.includes('Failed to refresh token') ||
           error?.message?.includes('failed_to_get_token') ||
           error?.message?.includes('Bad Request');
  }

  private handleTokenError(error: any): SafeDbResult<any> {
    console.error('Token error detected:', error);
    
    if (this.onTokenError) {
      this.onTokenError();
    }
    
    return {
      success: false,
      error: 'Authentication session expired. Please sign in again.',
      shouldSignOut: true
    };
  }

  async safeGetAll<T>(tableName: string): Promise<SafeDbResult<T[]>> {
    try {
      if (!this.db) {
        return {
          success: false,
          error: 'Database not available'
        };
      }

      const result = await this.db.from(tableName).getAll();
      return {
        success: true,
        data: result || []
      };
    } catch (error) {
      if (this.isTokenError(error)) {
        return this.handleTokenError(error);
      }
      
      console.error(`Error in safeGetAll for ${tableName}:`, error);
      return {
        success: false,
        error: `Failed to fetch ${tableName}`,
        data: [] // Return empty array as fallback
      };
    }
  }

  async safeAdd<T>(tableName: string, data: any): Promise<SafeDbResult<T>> {
    try {
      if (!this.db) {
        return {
          success: false,
          error: 'Database not available'
        };
      }

      const result = await this.db.from(tableName).add(data);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (this.isTokenError(error)) {
        return this.handleTokenError(error);
      }
      
      console.error(`Error in safeAdd for ${tableName}:`, error);
      return {
        success: false,
        error: `Failed to add to ${tableName}`
      };
    }
  }

  async safeUpdate<T>(tableName: string, id: string, data: any): Promise<SafeDbResult<T>> {
    try {
      if (!this.db) {
        return {
          success: false,
          error: 'Database not available'
        };
      }

      const result = await this.db.from(tableName).update(id, data);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (this.isTokenError(error)) {
        return this.handleTokenError(error);
      }
      
      console.error(`Error in safeUpdate for ${tableName}:`, error);
      return {
        success: false,
        error: `Failed to update ${tableName}`
      };
    }
  }

  async safeDelete<T>(tableName: string, id: string): Promise<SafeDbResult<T>> {
    try {
      if (!this.db) {
        return {
          success: false,
          error: 'Database not available'
        };
      }

      const result = await this.db.from(tableName).delete(id);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (this.isTokenError(error)) {
        return this.handleTokenError(error);
      }
      
      console.error(`Error in safeDelete for ${tableName}:`, error);
      return {
        success: false,
        error: `Failed to delete from ${tableName}`
      };
    }
  }

  async safeGet<T>(tableName: string, id: string): Promise<SafeDbResult<T>> {
    try {
      if (!this.db) {
        return {
          success: false,
          error: 'Database not available'
        };
      }

      const result = await this.db.from(tableName).get(id);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (this.isTokenError(error)) {
        return this.handleTokenError(error);
      }
      
      console.error(`Error in safeGet for ${tableName}:`, error);
      return {
        success: false,
        error: `Failed to get from ${tableName}`
      };
    }
  }
}

export const createSafeDbWrapper = (db: any, onTokenError?: () => void) => {
  return new SafeDbWrapper(db, onTokenError);
};