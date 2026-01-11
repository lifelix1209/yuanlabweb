import { useState, useEffect, createContext, useContext } from 'react';
import { db } from '../firebase';
import { doc, setDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { labInfo as defaultLabInfo } from '../data/labInfo.js';
import { membersData as defaultMembers } from '../data/membersData.js';
import { alumniData as defaultAlumni } from '../data/alumniData.js';
import { publicationsData as defaultPublications } from '../data/publicationsData.js';
import { retreatData as defaultRetreat } from '../data/retreatData.js';

// Data Context
const DataContext = createContext(null);

// Data Provider
export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 使用 Firestore 实时监听
  useEffect(() => {
    const unsubscribers = [];

    // 监听 labInfo
    const labInfoUnsub = onSnapshot(
      doc(db, 'lab', 'info'),
      (snapshot) => {
        if (snapshot.exists()) {
          setData(prev => prev ? ({ ...prev, labInfo: snapshot.data() }) : { labInfo: snapshot.data() });
        }
      },
      (err) => console.error('监听 labInfo 失败:', err)
    );
    unsubscribers.push(labInfoUnsub);

    // 监听集合数据
    const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];
    collections.forEach(collectionName => {
      const unsub = onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setData(prev => prev ? ({ ...prev, [collectionName]: items }) : { [collectionName]: items });
          // 所有集合都加载完成后，设置 loading = false
          if (collectionName === 'retreatData') {
            setLoading(false);
          }
        },
        (err) => {
          console.error(`监听 ${collectionName} 失败:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
      unsubscribers.push(unsub);
    });

    // 清理函数
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // 更新实验室信息
  const updateData = async (key, value) => {
    try {
      if (key === 'labInfo') {
        await setDoc(doc(db, 'lab', 'info'), value);
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
      await updateDoc(doc(db, collectionKey, String(itemId)), updates);
      console.log('项目已更新到云端');
    } catch (e) {
      console.error('更新失败:', e);
      alert('更新失败：' + e.message);
    }
  };

  // 添加新项目
  const addItem = async (collectionKey, newItem) => {
    try {
      const docRef = await addDoc(collection(db, collectionKey), newItem);
      console.log('新项目已添加到云端，ID:', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('添加失败:', e);
      alert('添加失败：' + e.message);
      throw e;
    }
  };

  // 删除项目
  const deleteItem = async (collectionKey, itemId) => {
    try {
      console.log('删除中:', collectionKey, itemId);
      await deleteDoc(doc(db, collectionKey, String(itemId)));
      console.log('项目已从云端删除');
    } catch (e) {
      console.error('删除失败:', e);
      alert('删除失败：' + e.message);
    }
  };

  // 导出数据
  const exportData = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入数据
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
          await import('firebase/firestore').then(({ getDocs, collection, deleteDoc, addDoc }) =>
            getDocs(collection(db, collectionName)).then(snap =>
              Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
            ).then(() =>
              Promise.all(imported[collectionName].map(item =>
                addDoc(collection(db, collectionName), item)
              ))
            )
          );
        }
      }

      setData(imported);
      return { success: true };
    } catch (e) {
      console.error('导入失败:', e);
      return { success: false, error: e.message };
    }
  };

  // 重置数据
  const resetData = async () => {
    if (!confirm('确定要重置所有数据吗？此操作不可恢复！')) return;

    try {
      setLoading(true);

      await setDoc(doc(db, 'lab', 'info'), defaultLabInfo);

      const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];

      for (const collectionName of collections) {
        await import('firebase/firestore').then(({ getDocs, collection, deleteDoc, addDoc }) =>
          getDocs(collection(db, collectionName)).then(snap =>
            Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
          ).then(() =>
            Promise.all(defaultData[collectionName].map(item =>
              addDoc(collection(db, collectionName), item)
            ))
          )
        );
      }

      setData(defaultData);
      alert('数据已重置为默认值');
    } catch (e) {
      console.error('重置失败:', e);
      alert('重置失败：' + e.message);
    } finally {
      setLoading(false);
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

// 默认数据
const defaultData = {
  labInfo: defaultLabInfo,
  membersData: defaultMembers,
  alumniData: defaultAlumni,
  publicationsData: defaultPublications,
  retreatData: defaultRetreat,
};
