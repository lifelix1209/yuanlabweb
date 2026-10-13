import { useState, useEffect, createContext, useContext } from 'react';
import { db } from '../firebase';
import { doc, setDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { labInfo as defaultLabInfo } from '../data/labInfo.js';
import { membersData as defaultMembers } from '../data/membersData.js';
import { alumniData as defaultAlumni } from '../data/alumniData.js';
import { publicationsData as defaultPublications } from '../data/publicationsData.js';
import { retreatData as defaultRetreat } from '../data/retreatData.js';

const DataContext = createContext(null);

const COLLECTIONS = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];

const DEFAULT_COLLECTIONS = {
  membersData: defaultMembers,
  alumniData: defaultAlumni,
  publicationsData: defaultPublications,
  retreatData: defaultRetreat,
};

// 前台先用本地默认数据渲染，Firestore 返回后静默替换，不阻塞首屏
const INITIAL_DATA = { labInfo: defaultLabInfo, ...DEFAULT_COLLECTIONS };

const stripMeta = (item) => {
  // eslint-disable-next-line no-unused-vars
  const { id, _dataId, _collectionKey, _isNew, ...clean } = item;
  return clean;
};

export function DataProvider({ children }) {
  const [data, setData] = useState(INITIAL_DATA);
  // loading 表示「云端数据是否已首次同步」，仅后台使用；前台不应据此阻塞渲染
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loaded = new Set();
    const markLoaded = (key) => {
      loaded.add(key);
      if (loaded.size === COLLECTIONS.length + 1) setLoading(false);
    };

    const labInfoUnsub = onSnapshot(
      doc(db, 'lab', 'info'),
      (snapshot) => {
        const labInfo = snapshot.exists() ? snapshot.data() : defaultLabInfo;
        setData((prev) => ({ ...prev, labInfo }));
        markLoaded('labInfo');
      },
      (err) => {
        console.error('Failed to subscribe to labInfo:', err);
        setError(err.message);
      }
    );

    const collectionUnsubs = COLLECTIONS.map((collectionName) =>
      onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          // 始终使用 Firestore 文档 ID，原数据中的 id 保存在 _dataId
          const items = snapshot.docs.map((d) => {
            const docData = d.data();
            return { ...docData, id: d.id, _dataId: docData.id };
          });
          setData((prev) => ({ ...prev, [collectionName]: items }));
          markLoaded(collectionName);
        },
        (err) => {
          console.error(`Failed to subscribe to ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      )
    );

    return () => [labInfoUnsub, ...collectionUnsubs].forEach((unsub) => unsub());
  }, []);

  const updateData = async (key, value) => {
    if (key !== 'labInfo') return;
    try {
      await setDoc(doc(db, 'lab', 'info'), value);
    } catch (e) {
      console.error('Failed to save labInfo:', e);
      throw e;
    }
  };

  const updateItem = async (collectionKey, itemId, updates) => {
    try {
      await updateDoc(doc(db, collectionKey, String(itemId)), stripMeta(updates));
    } catch (e) {
      console.error(`Failed to update ${collectionKey}/${itemId}:`, e);
      throw e;
    }
  };

  const addItem = async (collectionKey, newItem) => {
    try {
      const docRef = await addDoc(collection(db, collectionKey), stripMeta(newItem));
      return docRef.id;
    } catch (e) {
      console.error(`Failed to add to ${collectionKey}:`, e);
      throw e;
    }
  };

  const deleteItem = async (collectionKey, itemId) => {
    const docId = String(itemId);
    try {
      await deleteDoc(doc(db, collectionKey, docId));
      setData((prev) => ({
        ...prev,
        [collectionKey]: prev[collectionKey].filter((item) => item.id !== docId),
      }));
    } catch (e) {
      console.error(`Failed to delete ${collectionKey}/${docId}:`, e);
      throw e;
    }
  };

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

  const replaceCollection = async (collectionName, items) => {
    const snapshot = await getDocs(collection(db, collectionName));
    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
    await Promise.all(items.map((item) => addDoc(collection(db, collectionName), stripMeta(item))));
  };

  const importData = async (jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.labInfo) {
        await setDoc(doc(db, 'lab', 'info'), imported.labInfo);
      }
      for (const collectionName of COLLECTIONS) {
        if (imported[collectionName]) {
          await replaceCollection(collectionName, imported[collectionName]);
        }
      }
      return { success: true };
    } catch (e) {
      console.error('Import failed:', e);
      return { success: false, error: e.message };
    }
  };

  const resetData = async () => {
    if (!confirm('确定要重置所有数据吗？此操作不可恢复！')) return;
    try {
      setLoading(true);
      await setDoc(doc(db, 'lab', 'info'), defaultLabInfo);
      for (const collectionName of COLLECTIONS) {
        await replaceCollection(collectionName, DEFAULT_COLLECTIONS[collectionName]);
      }
      alert('数据已重置为默认值');
    } catch (e) {
      console.error('Reset failed:', e);
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

// eslint-disable-next-line react-refresh/only-export-components
export function useLabData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useLabData must be used within DataProvider');
  }
  return context;
}
