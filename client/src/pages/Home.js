import React, { useState, useEffect, useCallback } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import useFetch from '../hooks/useFetch';
import Modal from '../components/Modals/Modal';
import FormInput from '../components/Form/FormInput';
import FormSelect from '../components/Form/FormSelect';
import Checkbox from '../components/Form/Checkbox';
import { Plus, Search, Calendar, AlertCircle, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function Home() {
  const { token } = useAnalytics();
  const { request, loading, error } = useFetch();
  
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null); // null means "Create" mode
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  // Load initial todos
  const loadTodos = useCallback(async () => {
    try {
      const data = await request('/api/todos');
      if (data) {
        setTodos(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [request]);

  useEffect(() => {
    if (token) {
      loadTodos();
    }
  }, [token, loadTodos]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingTodo(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description || '');
    setPriority(todo.priority || 'medium');
    setDueDate(todo.due_date || '');
    setIsModalOpen(true);
  };

  // Handle Form Submission (Create or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingTodo) {
        // Edit mode
        const updated = await request(`/api/todos/${editingTodo.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title,
            description,
            priority,
            due_date: dueDate || null
          })
        });
        if (updated) {
          setTodos(todos.map(t => t.id === editingTodo.id ? updated : t));
        }
      } else {
        // Create mode
        const created = await request('/api/todos', {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            priority,
            due_date: dueDate || null,
            completed: false
          })
        });
        if (created) {
          setTodos([created, ...todos]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle todo completion
  const handleToggleComplete = async (todo) => {
    try {
      const updated = await request(`/api/todos/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          completed: !todo.completed
        })
      });
      if (updated) {
        setTodos(todos.map(t => t.id === todo.id ? updated : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await request(`/api/todos/${todoId}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== todoId));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Search processing
  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'completed') return todo.completed;
      if (filter === 'pending') return !todo.completed;
      return true;
    })
    .filter(todo => {
      return todo.title.toLowerCase().includes(search.toLowerCase()) || 
             (todo.description && todo.description.toLowerCase().includes(search.toLowerCase()));
    });

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      default: return 'var(--color-success)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Top action section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to your workspace! Manage your tasks efficiently.</p>
        </div>
        
        <button type="button" onClick={handleOpenCreateModal} className="btn btn-primary">
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', width: '100%', borderRadius: 'var(--radius-full)' }}
          />
        </div>

        {/* Tab filters */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          {['all', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: filter === tab ? 'var(--bg-secondary)' : 'transparent',
                color: filter === tab ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Error displays */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
          Failed to process action: {error}
        </div>
      )}

      {/* Task List Rendering */}
      {loading && todos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading your tasks...
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Tasks Found</span>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', fontSize: '0.9rem' }}>
            {search ? "No tasks match your search keywords." : "You have no tasks listed here. Create one to get started!"}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className="glass-card animate-slide-up"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                borderLeft: `5px solid ${getPriorityColor(todo.priority)}`,
                opacity: todo.completed ? 0.75 : 1,
                background: todo.completed ? 'rgba(17, 24, 39, 0.4)' : 'var(--bg-surface)'
              }}
            >
              {/* Checkbox and Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                <div style={{ marginTop: '3px' }}>
                  <Checkbox
                    id={`todo-chk-${todo.id}`}
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {todo.title}
                  </span>
                  
                  {todo.description && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {todo.description}
                    </span>
                  )}

                  {/* Metadata labels */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {todo.due_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={14} />
                        <span>Due {formatDate(todo.due_date)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: getPriorityColor(todo.priority) }}>
                      <AlertCircle size={14} />
                      <span style={{ textTransform: 'capitalize' }}>{todo.priority} Priority</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(todo)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                  title="Edit Task"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTodo(todo.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                    e.currentTarget.style.color = 'var(--color-danger)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTodo ? "Modify Task" : "Create New Task"}
        footerActions={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="btn btn-primary">
              {editingTodo ? "Save Changes" : "Create Task"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormInput
            label="Task Title"
            type="text"
            id="todo-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Complete documentation..."
            required
          />

          <div className="form-group">
            <label htmlFor="todo-desc" className="form-label">Description</label>
            <textarea
              id="todo-desc"
              className="form-input"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short description..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <FormSelect
            label="Priority Level"
            id="todo-prio"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
          />

          <FormInput
            label="Due Date"
            type="date"
            id="todo-due"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </form>
      </Modal>

    </div>
  );
}
