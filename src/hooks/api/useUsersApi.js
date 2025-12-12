import * as api from '../../services/api';
import { useApi } from './useApi';

/**
 * Hook for user API operations
 */
export const useUsersApi = () => {
  const getUsers = useApi(api.getUsers);
  const getUserById = useApi(api.getUserById);
  const createUser = useApi(api.createUser);
  const updateUser = useApi(api.updateUser);
  const deleteUser = useApi(api.deleteUser);

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};

