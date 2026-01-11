import { useState, useEffect, createContext, useContext } from 'react';
import { labInfo as defaultLabInfo } from '../data/labInfo.js';
import { membersData as defaultMembers } from '../data/membersData.js';
import { alumniData as defaultAlumni } from '../data/alumniData.js';
import { publicationsData as defaultPublications } from '../data/publicationsData.js';
import { retreatData as defaultRetreat } from '../data/retreatData.js';

// Data Context
const DataContext = createContext(null);

// 默认数据
const defaultData = {
  labInfo: defaultLabInfo,
  membersData: defaultMembers,
  alumniData: defaultAlumni,
  publicationsData: defaultPublications,
  retreatData: defaultRetreat,
};

// 从 localStorage 加载数据
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('labData');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data from storage:', e);
  }
  return null;
};

// 保存数据到 localStorage
const saveToStorage = (data) => {
  try {
    localStorage.setItem('labData', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to storage:', e);
  }
};

// Data Provider
export function DataProvider({ children }) {
  const [data, setData] = useState(() => loadFromStorage() || defaultData);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isDirty) {
      saveToStorage(data);
      setIsDirty(false);
    }
  }, [data, isDirty]);

  // 更新数据
  const updateData = (key, value) => {
    setData(prev => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  // 更新单个项目
  const updateItem = (collectionKey, itemId, updates) => {
    setData(prev => ({
      ...prev,
      [collectionKey]: prev[collectionKey].map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
    setIsDirty(true);
  };

  // 添加新项目
  const addItem = (collectionKey, newItem) => {
    const id = Date.now();
    setData(prev => ({
      ...prev,
      [collectionKey]: [...prev[collectionKey], { ...newItem, id }],
    }));
    setIsDirty(true);
  };

  // 删除项目
  const deleteItem = (collectionKey, itemId) => {
    setData(prev => ({
      ...prev,
      [collectionKey]: prev[collectionKey].filter(item => item.id !== itemId),
    }));
    setIsDirty(true);
  };

  // 重置为默认数据
  const resetData = () => {
    setData(defaultData);
    setIsDirty(true);
  };

  // 导出数据为 JSON
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入数据
  const importData = (jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      setData(imported);
      setIsDirty(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      updateData,
      updateItem,
      addItem,
      deleteItem,
      resetData,
      exportData,
      importData,
      isDirty,
    }}>
      {children}
    </DataContext.Provider>
  );
}

// 使用数据的 Hook
export function useLabData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useLabData must be used within DataProvider');
  }
  return context;
}
