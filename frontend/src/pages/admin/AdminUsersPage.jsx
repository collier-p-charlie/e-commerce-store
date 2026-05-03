import toast from 'react-hot-toast'
import { useAllUsers, useDeleteUser } from '../../hooks/useAdmin'
import AdminLayout from './AdminLayout'

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAllUsers()
  const deleteUser = useDeleteUser()

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await deleteUser.mutateAsync(id)
      toast.success('User deleted')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user')
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-6">Users</h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading users...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {!users || users.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.is_admin && (
                      <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                        admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {user.email} · Joined {new Date(user.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                {!user.is_admin && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  )
}
