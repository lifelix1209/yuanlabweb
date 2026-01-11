import { useState, useEffect, createContext, useContext } from 'react';
import { db } from '../firebase';
import { doc, setDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { labInfo as defaultLabInfo } from '../data/labInfo.js';
import { membersData as defaultMembers } from '../data/membersData.js';
import { alumniData as defaultAlumni } from '../data/alumniData.js';
import { publicationsData as defaultPublications } from '../data/publicationsData.js';
import { retreatData as defaultRetreat } from '../data/retreatData.js';

// Data Context
const DataContext = createContext(null);

// Data Provider
export function DataProvider({ children }) {
  const [data, setData] = useState({
    labInfo: {},
    membersData: [],
    alumniData: [],
    publicationsData: [],
    retreatData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 使用 Firestore 实时监听
  useEffect(() => {
    const unsubscribers = [];
    let loadedCollections = 0;
    const totalCollections = 5; // labInfo + 4 个集合

    // 监听 labInfo
    const labInfoUnsub = onSnapshot(
      doc(db, 'lab', 'info'),
      (snapshot) => {
        if (snapshot.exists()) {
          console.log('📊 labInfo 加载完成');
          setData(prev => ({ ...prev, labInfo: snapshot.data() }));
          loadedCollections++;
          if (loadedCollections === totalCollections) {
            setLoading(false);
          }
        } else {
          console.log('⚠️ labInfo 不存在，使用默认值');
          setData(prev => ({ ...prev, labInfo: defaultLabInfo }));
          loadedCollections++;
          if (loadedCollections === totalCollections) {
            setLoading(false);
          }
        }
      },
      (err) => {
        console.error('❌ 监听 labInfo 失败:', err);
        setError(err.message);
      }
    );
    unsubscribers.push(labInfoUnsub);

    // 监听集合数据
    const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];
    collections.forEach(collectionName => {
      const unsub = onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const items = snapshot.docs.map(d => ({ 
            id: d.id, 
            ...d.data() 
          }));
          
          console.log(`📊 ${collectionName} 加载完成:`, items.length, '条数据');
          
          setData(prev => ({ 
            ...prev, 
            [collectionName]: items 
          }));
          
          loadedCollections++;
          if (loadedCollections === totalCollections) {
            console.log('✅ 所有数据加载完成');
            setLoading(false);
          }
        },
        (err) => {
          console.error(`❌ 监听 ${collectionName} 失败:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
      unsubscribers.push(unsub);
    });

    // 清理函数
    return () => {
      console.log('🧹 清理监听器');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ✅ 更新实验室信息
  const updateData = async (key, value) => {
    try {
      if (key === 'labInfo') {
        console.log('📝 保存 labInfo 到云端');
        await setDoc(doc(db, 'lab', 'info'), value);
        console.log('✅ labInfo 保存成功');
      }
    } catch (e) {
      console.error('❌ 保存失败:', e);
      throw e; // ✅ 抛出错误
    }
  };

  // ✅ 更新单个项目
  const updateItem = async (collectionKey, itemId, updates) => {
    try {
      console.log('📝 更新项目:', { collectionKey, itemId, updates });
      
      // ✅ 直接使用 itemId，不进行类型转换
      const docRef = doc(db, collectionKey, itemId);
      await updateDoc(docRef, updates);
      
      console.log('✅ 项目更新成功');
    } catch (e) {
      console.error('❌ 更新失败:', e);
      console.error('错误详情:', { collectionKey, itemId, error: e.message });
      throw e; // ✅ 抛出错误
    }
  };

  // ✅ 添加新项目
  const addItem = async (collectionKey, newItem) => {
    try {
      console.log('➕ 添加项目:', { collectionKey, newItem });
      
      const docRef = await addDoc(collection(db, collectionKey), newItem);
      
      console.log('✅ 项目添加成功，ID:', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('❌ 添加失败:', e);
      console.error('错误详情:', { collectionKey, error: e.message });
      throw e; // ✅ 抛出错误
    }
  };

  // ✅ 删除项目（关键修复）
  const deleteItem = async (collectionKey, itemId) => {
    try {
      console.log('🗑️ 准备删除:', { collectionKey, itemId });
      console.log('📦 itemId 类型:', typeof itemId);
      
      // ✅ 直接使用 itemId，不进行 String() 转换
      const docRef = doc(db, collectionKey, itemId);
      
      console.log('🔗 文档路径:', docRef.path);
      
      await deleteDoc(docRef);
      
      console.log('✅ 项目删除成功');
      
      // ✅ 立即更新本地状态（虽然 onSnapshot 也会更新，但这样更快）
      setData(prev => ({
        ...prev,
        [collectionKey]: prev[collectionKey].filter(item => item.id !== itemId)
      }));
      
    } catch (e) {
      console.error('❌ 删除失败:', e);
      console.error('错误详情:', { 
        collectionKey, 
        itemId, 
        itemIdType: typeof itemId,
        error: e.message,
        errorCode: e.code 
      });
      throw e; // ✅ 抛出错误
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
      console.log('📥 开始导入数据');
      const imported = JSON.parse(jsonString);

      // 上传 labInfo
      if (imported.labInfo) {
        await setDoc(doc(db, 'lab', 'info'), imported.labInfo);
      }

      // 上传集合数据
      const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];

      for (const collectionName of collections) {
        if (imported[collectionName]) {
          // 先删除现有数据
          const snapshot = await getDocs(collection(db, collectionName));
          await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
          
          // 添加新数据
          await Promise.all(
            imported[collectionName].map(item => 
              addDoc(collection(db, collectionName), item)
            )
          );
        }
      }

      console.log('✅ 导入成功');
      return { success: true };
    } catch (e) {
      console.error('❌ 导入失败:', e);
      return { success: false, error: e.message };
    }
  };

  // 重置数据
  const resetData = async () => {
    if (!confirm('确定要重置所有数据吗？此操作不可恢复！')) return;

    try {
      console.log('🔄 开始重置数据');
      setLoading(true);

      // 重置 labInfo
      await setDoc(doc(db, 'lab', 'info'), defaultLabInfo);

      // 重置集合数据
      const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];
      const defaultCollections = {
        membersData: defaultMembers,
        alumniData: defaultAlumni,
        publicationsData: defaultPublications,
        retreatData: defaultRetreat
      };

      for (const collectionName of collections) {
        // 删除现有数据
        const snapshot = await getDocs(collection(db, collectionName));
        await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
        
        // 添加默认数据
        await Promise.all(
          defaultCollections[collectionName].map(item => 
            addDoc(collection(db, collectionName), item)
          )
        );
      }

      console.log('✅ 重置成功');
      alert('数据已重置为默认值');
    } catch (e) {
      console.error('❌ 重置失败:', e);
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
