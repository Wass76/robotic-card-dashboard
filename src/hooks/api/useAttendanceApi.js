import * as api from '../../services/api';
import { useApi } from './useApi';

/**
 * Hook for attendance API operations
 */
export const useAttendanceApi = () => {
  const getAllAttendance = useApi(api.getAllAttendance);
  const getUserAttendance = useApi(api.getUserAttendance);
  const getMonthlyAttendance = useApi(api.getMonthlyAttendance);

  return {
    getAllAttendance,
    getUserAttendance,
    getMonthlyAttendance,
  };
};

