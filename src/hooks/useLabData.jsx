import { useState, useEffect, createContext, useContext } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
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

// Data Provider
export function DataProvider({ children }) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从 Firestore 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 加载 labInfo
        const labInfoDoc = await getDoc(doc(db, 'lab', 'info'));
        const labInfoData = labInfoDoc.exists() ? labInfoDoc.data() : defaultLabInfo;

        // 加载集合数据
        const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];
        const collectionsData = {};

        for (const collectionName of collections) {
          const snapshot = await getDocs(collection(db, collectionName));
          collectionsData[collectionName] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }

        setData({
          labInfo: labInfoData,
          ...collectionsData
        });

        console.log('数据从云端加载成功');
      } catch (e) {
        console.error('加载数据失败:', e);
        setError(e.message);
        // 失败时使用默认数据
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 更新实验室信息
  const updateData = async (key, value) => {
    try {
      if (key === 'labInfo') {
        await setDoc(doc(db, 'lab', 'info'), value);
        setData(prev => ({ ...prev, labInfo: value }));
        console.log('实验室信息已保存到云端');
      }
    } catch (e) {
      console.error('保存失败:', e);
      alert('保存失败：' + e.message);
    }
  };

  // 更新单个项目
  const updateItem = async (collectionKey, itemId, updates) => {
    try {
      const itemRef = doc(db, collectionKey, String(itemId));
      await updateDoc(itemRef, updates);

      setData(prev => ({
        ...prev,
        [collectionKey]: prev[collectionKey].map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      }));

      console.log('项目已更新到云端');
    } catch (e) {
      console.error('更新失败:', e);
      alert('更新失败：' + e.message);
    }
  };

  // 添加新项目
  const addItem = async (collectionKey, newItem) => {
    try {
      // 添加到 Firestore
      const docRef = await addDoc(collection(db, collectionKey), newItem);

      // 更新本地状态（使用 Firestore 生成的 ID）
      const itemWithId = { ...newItem, id: docRef.id };
      setData(prev => ({
        ...prev,
        [collectionKey]: [...prev[collectionKey], itemWithId],
      }));

      console.log('新项目已添加到云端，ID:', docRef.id);
    } catch (e) {
      console.error('添加失败:', e);
      alert('添加失败：' + e.message);
      throw e;
    }
  };

  // 删除项目
  const deleteItem = async (collectionKey, itemId) => {
    try {
      await deleteDoc(doc(db, collectionKey, String(itemId)));

      setData(prev => ({
        ...prev,
        [collectionKey]: prev[collectionKey].filter(item => item.id !== itemId),
      }));

      console.log('项目已从云端删除');
    } catch (e) {
      console.error('删除失败:', e);
      alert('删除失败：' + e.message);
    }
  };

  // 重置为默认数据
  const resetData = async () => {
    if (!confirm('确定要重置所有数据吗？此操作不可恢复！')) return;

    try {
      // 重置 labInfo
      await setDoc(doc(db, 'lab', 'info'), defaultLabInfo);

      // 清空并重置集合
      const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];

      for (const collectionName of collections) {
        // 删除现有数据
        const snapshot = await getDocs(collection(db, collectionName));
        await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));

        // 添加默认数据
        const defaultItems = defaultData[collectionName];
        await Promise.all(defaultItems.map(item =>
          addDoc(collection(db, collectionName), item)
        ));
      }

      setData(defaultData);
      alert('数据已重置为默认值');
    } catch (e) {
      console.error('重置失败:', e);
      alert('重置失败：' + e.message);
    }
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

  // 导入数据（上传到云端）
  const importData = async (jsonString) => {
    try {
      const imported = JSON.parse(jsonString);

      // 上传 labInfo
      if (imported.labInfo) {
        await setDoc(doc(db, 'lab', 'info'), imported.labInfo);
      }

      // 上传集合数据
      const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];

      for (const collectionName of collections) {
        if (imported[collectionName]) {
          // 清空现有数据
          const snapshot = await getDocs(collection(db, collectionName));
          await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));

          // 添加新数据
          await Promise.all(imported[collectionName].map(item =>
            addDoc(collection(db, collectionName), item)
          ));
        }
      }

      setData(imported);
      return { success: true };
    } catch (e) {
      console.error('导入失败:', e);
      return { success: false, error: e.message };
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      loading,
      error,
      updateData,
      updateItem,
      addItem,
      deleteItem,
      resetData,
      exportData,
      importData,
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
