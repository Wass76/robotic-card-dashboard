import React, { useMemo, useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context';
import { useUsers, useModal, useDebounce } from '../../hooks';
import { USER_ROLES } from '../../constants';
import { useToast } from '../common';
import Button from '../common/Button';
import UserTable from './UserTable';
import UserForm from './UserForm';
import UserModal from './UserModal';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const UsersManagement = ({ searchTerm, setSearchTerm }) => {
  const { users, cards, loading, error } = useApp();
  const { createUser, updateUser, deleteUser, loading: actionLoading } = useUsers();
  const toast = useToast();
  const addUserModal = useModal();
  const viewUserModal = useModal();
  const editUserModal = useModal();
  const deleteConfirmModal = useModal();
  
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  
  const debouncedSearchTerm = useDebounce(searchTerm);
  
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(searchLower) || 
        user.last_name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Sort by created_at
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return sortOrder === 'asc' 
        ? dateA - dateB 
        : dateB - dateA;
    });
    
    return filtered;
  }, [users, debouncedSearchTerm, roleFilter, sortOrder]);

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      deleteConfirmModal.close();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      toast.showSuccess('تم إضافة المستخدم بنجاح');
      addUserModal.close();
    } catch (err) {
      toast.showError(err.message || 'فشل في إضافة المستخدم');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await updateUser(editUserModal.data.id, userData);
      toast.showSuccess('تم تحديث المستخدم بنجاح');
      editUserModal.close();
    } catch (err) {
      toast.showError(err.message || 'فشل في تحديث المستخدم');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
        <Button 
          onClick={() => addUserModal.open('create')}
          variant="primary"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
              >
                <option value="all">جميع الأدوار</option>
                <option value={USER_ROLES.ADMIN}>{USER_ROLES.ADMIN}</option>
                <option value={USER_ROLES.USER}>{USER_ROLES.USER}</option>
              </select>
            </div>
            
            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                title={sortOrder === 'asc' ? 'الأقدم أولاً' : 'الأحدث أولاً'}
              >
                {sortOrder === 'asc' ? 'الأقدم أولاً' : 'الأحدث أولاً'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage error={error} onDismiss={() => {}} />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="card">
          <div className="p-8">
            <LoadingSpinner message="جاري تحميل المستخدمين..." />
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="p-4 lg:p-6">
            {filteredAndSortedUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {users.length === 0 
                    ? 'لا يوجد مستخدمين' 
                    : 'لا توجد نتائج مطابقة للبحث'}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  عرض {filteredAndSortedUsers.length} من {users.length} مستخدم
                </div>
                <UserTable
                  users={filteredAndSortedUsers}
                  onView={(user) => viewUserModal.open('view', user)}
                  onEdit={(user) => editUserModal.open('edit', user)}
                  onDelete={(userId) => deleteConfirmModal.open('delete', userId)}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {addUserModal.isOpen && (
        <UserForm
          user={null}
          onSubmit={handleCreateUser}
          onClose={addUserModal.close}
          loading={actionLoading}
        />
      )}

      {viewUserModal.isOpen && viewUserModal.data && (
        <UserModal
          user={viewUserModal.data}
          hasCard={Array.isArray(cards) && cards.some(c => c.user_id === viewUserModal.data.id)}
          onClose={viewUserModal.close}
          onEdit={(user) => {
            viewUserModal.close();
            editUserModal.open('edit', user);
          }}
          onDelete={(userId) => {
            viewUserModal.close();
            deleteConfirmModal.open('delete', userId);
          }}
          onCreateCard={(user) => {
            // Navigate to cards view and trigger create card modal
            const event = new CustomEvent('openCreateCard', { detail: user });
            window.dispatchEvent(event);
          }}
        />
      )}

      {editUserModal.isOpen && editUserModal.data && (
        <UserForm
          user={editUserModal.data}
          onSubmit={handleUpdateUser}
          onClose={editUserModal.close}
          loading={actionLoading}
        />
      )}

      {deleteConfirmModal.isOpen && deleteConfirmModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-gray-600 mb-4">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-2">
                <button
                  onClick={deleteConfirmModal.close}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmModal.data)}
                  className="action-btn-delete flex-1 text-sm py-2"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;

