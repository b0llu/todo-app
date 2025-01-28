import React, { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useSupabase } from '../context/Supabase.context'
import { useAuth } from '../context/Auth.context'
import LogoutIcon from '@mui/icons-material/Logout'
import moment from 'moment'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

type Todo = {
  id: number
  title: string
  description: string | null
  due_date: string | null // YYYY-MM-DD format
  status: 'pending' | 'completed'
  created_at: string // Timestamp of creation
}

const HomePage: React.FC = () => {
  const supabase = useSupabase()
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<
    'today' | 'this week' | 'all' | 'completed' | 'pending'
  >('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTodos = async (
    filter: 'today' | 'this week' | 'all' | 'completed' | 'pending'
  ) => {
    setLoading(true)

    let query = supabase
      .from('todo')
      .select('*')
      .order('created_at', { ascending: false })

    const now = new Date()

    if (filter === 'today') {
      const todayDate = new Date().toISOString().split('T')[0]
      query = query.eq('due_date', todayDate)
    } else if (filter === 'this week') {
      const startOfWeek = new Date(
        now.setDate(now.getDate() - now.getDay() + 1)
      )
      const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6))
      const startDate = startOfWeek.toISOString().split('T')[0]
      const endDate = endOfWeek.toISOString().split('T')[0]
      query = query.gte('due_date', startDate).lte('due_date', endDate)
    } else if (filter === 'completed') {
      query = query.eq('status', 'completed')
    } else if (filter === 'pending') {
      query = query.eq('status', 'pending')
    }

    const { data, error } = await query
    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data || [])
    }

    setLoading(false)
  }

  const handleCreateTodo = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from('todo').insert([
        {
          title,
          description,
          due_date: dueDate ? new Date(dueDate) : null,
        },
      ])

      if (insertError) throw insertError

      setTitle('')
      setDescription('')
      setDueDate(new Date().toISOString().split('T')[0])
      setModalOpen(false)
      fetchTodos(filter)
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos(filter)
  }, [filter])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleToggleComplete = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      const { error } = await supabase
        .from('todo')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      // Refresh todos
      fetchTodos(filter)
    } catch (err) {
      console.error('Error updating todo status:', err)
    }
  }

  const isDueToday = (dueDate: string | null): boolean => {
    if (!dueDate) return false
    const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
    return dueDate === today
  }

  const isOverdue = (dueDate: string | null): boolean => {
    if (!dueDate) return false
    const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
    return dueDate < today
  }

  const formatDate = (date: string | null): string => {
    if (!date) return 'No due date'
    return moment(date).format('Do MMMM YYYY') // e.g., 30th January 2025
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      const { error } = await supabase.from('todo').delete().eq('id', id)
      if (error) throw error

      // Refresh the list after deletion
      fetchTodos(filter)
    } catch (err) {
      console.error('Error deleting todo:', err)
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setModalOpen(true)
  }

  const handleUpdateTodo = async () => {
    if (!editingTodo) return

    setLoading(true)
    const { id, title, description, due_date } = editingTodo

    try {
      const { error } = await supabase
        .from('todo')
        .update({ title, description, due_date })
        .eq('id', id)

      if (error) throw error

      setEditingTodo(null) // Close the modal
      setModalOpen(false)
      fetchTodos(filter) // Refresh todos
    } catch (err) {
      console.error('Error updating todo:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTodos = todos.filter(
    (todo) =>
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.description &&
        todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-600 text-white px-6 py-4 shadow">
        <div className="flex items-center gap-3">
          <img
            src="https://picsum.photos/200"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <span className="font-semibold">Welcome, {user?.email}!</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md font-medium text-white cursor-pointer"
          >
            Create Todo
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-2 py-2 bg-red-500 hover:bg-red-600 rounded-md font-medium text-white cursor-pointer"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-col items-center py-6">
        {/* Filters */}
        <div className="flex flex-wrap w-full max-w-5xl mb-4 gap-2 px-4 md:px-6 lg:px-8">
          {['all', 'today', 'this week', 'completed', 'pending'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item as typeof filter)}
              className={`px-4 py-2 rounded-md font-medium cursor-pointer ${
                filter === item
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)} {/* Capitalize */}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ml-auto"
          />
        </div>

        {/* Todos */}
        <div className="w-full max-w-5xl px-4 md:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center my-6">
              <CircularProgress size={24} />
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <Accordion
                key={todo.id}
                className="mb-3 rounded-lg overflow-hidden"
                sx={{
                  '&::before': { display: 'none' },
                  borderTopLeftRadius: '8px !important',
                  borderTopRightRadius: '8px !important',
                  borderBottomLeftRadius: '8px !important',
                  borderBottomRightRadius: '8px !important',
                  boxShadow: 'none',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className="bg-gray-100 hover:bg-gray-200 flex items-center px-4 py-2 rounded-t-lg"
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* Checkbox to mark as completed */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="cursor-pointer h-full flex items-center"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={todo.status === 'completed'}
                        onChange={() => {
                          handleToggleComplete(todo.id, todo.status)
                        }}
                        className="w-4 h-4 rounded border-gray-300 focus:ring focus:ring-blue-300 cursor-pointer"
                      />
                    </div>
                    <div className="flex w-full">
                      {/* Title and Status */}
                      <div className="flex justify-between items-center w-full">
                        <p
                          className={`font-medium ${
                            todo.status === 'completed'
                              ? 'line-through text-gray-500'
                              : ''
                          }`}
                        >
                          {todo.title}
                        </p>
                        {/* Due Today or Overdue */}
                        {todo.status !== 'completed' && (
                          <div>
                            <span
                              className={`text-xs ml-2 ${
                                isOverdue(todo.due_date)
                                  ? 'text-red-500'
                                  : isDueToday(todo.due_date)
                                  ? 'text-blue-500'
                                  : 'text-gray-500'
                              }`}
                            >
                              {isOverdue(todo.due_date)
                                ? 'Overdue'
                                : isDueToday(todo.due_date)
                                ? 'Due Today'
                                : `Due: ${
                                    formatDate(todo.due_date) || 'No due date'
                                  }`}
                            </span>
                          </div>
                        )}
                        {/* Status Label */}
                        <span
                          className={`text-xs px-2 py-1 rounded-md ml-auto mr-2 ${
                            todo.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}
                        >
                          {todo.status === 'completed'
                            ? 'Completed'
                            : 'Pending'}
                        </span>

                        {/* Edit Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation() // Prevent accordion toggle
                            handleEditTodo(todo)
                          }}
                          className="text-blue-500 hover:text-blue-600 cursor-pointer"
                        >
                          <EditIcon />
                        </button>
                        {/* Delete Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation() // Prevent accordion toggle
                            handleDeleteTodo(todo.id)
                          }}
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </AccordionSummary>

                <AccordionDetails className="bg-gray-50 px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <div>
                      <strong>Description:</strong>{' '}
                      <span className="text-gray-700">
                        {todo.description || 'None'}
                      </span>
                    </div>
                    <div>
                      <strong>Due Date:</strong>{' '}
                      <span className="text-gray-700">
                        {formatDate(todo.due_date) || 'No due date'}
                      </span>
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`font-semibold ${
                          todo.status === 'completed'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {todo.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {editingTodo ? 'Edit Todo' : 'Create Todo'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (editingTodo) {
                  handleUpdateTodo()
                } else {
                  handleCreateTodo(e)
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editingTodo ? editingTodo.title : title}
                  onChange={(e) =>
                    editingTodo
                      ? setEditingTodo(
                          (prev) => prev && { ...prev, title: e.target.value }
                        )
                      : setTitle(e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={
                    editingTodo ? editingTodo.description || '' : description
                  }
                  onChange={(e) =>
                    editingTodo
                      ? setEditingTodo(
                          (prev) =>
                            prev && { ...prev, description: e.target.value }
                        )
                      : setDescription(e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-blue-300"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editingTodo ? editingTodo.due_date || '' : dueDate}
                  onChange={(e) =>
                    editingTodo
                      ? setEditingTodo(
                          (prev) =>
                            prev && { ...prev, due_date: e.target.value }
                        )
                      : setDueDate(e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-blue-300"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false)
                    setEditingTodo(null) // Clear editing state on cancel
                  }}
                  className="px-4 py-2 mr-3 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading
                    ? 'Submitting...'
                    : editingTodo
                    ? 'Save Changes'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
