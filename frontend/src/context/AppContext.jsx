import { createContext, useContext, useReducer, useCallback } from 'react';
import { VISITORS, MAINTENANCE_REQUESTS, BILLS, ANNOUNCEMENTS, FORUM_POSTS, NOTIFICATIONS, USERS } from '../data/seed';

const AppContext = createContext(null);

const initialState = {
  visitors: VISITORS,
  maintenance: MAINTENANCE_REQUESTS,
  bills: BILLS,
  announcements: ANNOUNCEMENTS,
  forum: FORUM_POSTS,
  notifications: NOTIFICATIONS,
  users: USERS,
  toast: null,
};

function appReducer(state, action) {
  switch (action.type) {
    // Visitors
    case 'ADD_VISITOR': return { ...state, visitors: [action.payload, ...state.visitors] };
    case 'UPDATE_VISITOR': return { ...state, visitors: state.visitors.map(v => v.id === action.payload.id ? { ...v, ...action.payload } : v) };

    // Maintenance
    case 'ADD_MAINTENANCE': return { ...state, maintenance: [action.payload, ...state.maintenance] };
    case 'UPDATE_MAINTENANCE': return { ...state, maintenance: state.maintenance.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) };

    // Bills
    case 'UPDATE_BILL': return { ...state, bills: state.bills.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b) };
    case 'ADD_BILL': return { ...state, bills: [action.payload, ...state.bills] };

    // Announcements
    case 'ADD_ANNOUNCEMENT': return { ...state, announcements: [action.payload, ...state.announcements] };
    case 'UPDATE_ANNOUNCEMENT': return { ...state, announcements: state.announcements.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) };
    case 'DELETE_ANNOUNCEMENT': return { ...state, announcements: state.announcements.filter(a => a.id !== action.payload) };

    // Forum
    case 'ADD_POST': return { ...state, forum: [action.payload, ...state.forum] };
    case 'ADD_REPLY': return {
      ...state,
      forum: state.forum.map(p => p.id === action.payload.postId
        ? { ...p, replies: [...p.replies, action.payload.reply] }
        : p)
    };
    case 'TOGGLE_LIKE': return {
      ...state,
      forum: state.forum.map(p => p.id === action.payload
        ? { ...p, likes: p.likes + 1 }
        : p)
    };

    // Notifications
    case 'MARK_READ': return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'MARK_ALL_READ': return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications] };

    // Users (admin)
    case 'ADD_USER': return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER': return { ...state, users: state.users.map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u) };
    case 'DELETE_USER': return { ...state, users: state.users.filter(u => u.id !== action.payload) };

    // Toast
    case 'SHOW_TOAST': return { ...state, toast: action.payload };
    case 'CLEAR_TOAST': return { ...state, toast: null };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    dispatch({ type: 'SHOW_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3500);
  }, []);

  return (
    <AppContext.Provider value={{ ...state, dispatch, toast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
