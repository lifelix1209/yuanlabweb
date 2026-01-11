import { useState, useEffect, createContext, useContext } from 'react';
import { db } from '../firebase';
import { doc, setDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { labInfo as defaultLabInfo } from '../data/labInfo.js';
import { membersData as defaultMembers } from '../data/membersData.js';
import { alumniData as defaultAlumni } from '../data/alumniData.js';
import { publicationsData as defaultPublications } from '../data/publicationsData.js';
import { retreatData as defaultRetreat } from '../data/retreatData.js';

const DataContext = createContext(null);

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
    const totalCollections = 5;

    // 监听 labInfo
    const labInfoUnsub = onSnapshot(
      doc(db, 'lab', 'info'),
      (snapshot) => {
        if (snapshot.exists()) {
          console.log('📊 labInfo 加载完成');
          setData(prev => ({ ...prev, labInfo: snapshot.data() }));
        } else {
          console.log('⚠️ labInfo 不存在，使用默认值');
          setData(prev => ({ ...prev, labInfo: defaultLabInfo }));
        }
        loadedCollections++;
        if (loadedCollections === totalCollections) {
          setLoading(false);
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
          console.log(`\n📊 ${collectionName} 数据快照:`);
          
          const items = snapshot.docs.map(d => {
            const docData = d.data();
            const firestoreId = d.id; // Firestore 自动生成的文档 ID
            
            console.log(`  📄 文档:`, {
              'Firestore ID': firestoreId,
              '数据中的 id': docData.id,
              '数据': docData
            });
            
            // ✅ 关键：始终使用 Firestore 文档 ID，忽略数据中的 id 字段
            return {
              ...docData,
              id: firestoreId, // 用 Firestore ID 覆盖数据中的 id
              _dataId: docData.id, // 保存原始 id（调试用）
            };
          });
          
          console.log(`✅ ${collectionName} 最终数据:`, items.length, '条');
          
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
      throw e;
    }
  };

  // ✅ 更新单个项目
  const updateItem = async (collectionKey, itemId, updates) => {
    try {
      console.log('📝 更新项目:', { 
        collectionKey, 
        itemId, 
        itemIdType: typeof itemId,
        updates 
      });
      
      // ✅ 确保 itemId 是字符串
      const docId = String(itemId);
      console.log('🔗 文档路径:', `${collectionKey}/${docId}`);
      
      const docRef = doc(db, collectionKey, docId);
      
      // ✅ 不要在 updates 中包含 id 字段
      const { id, _dataId, ...cleanUpdates } = updates;
      
      await updateDoc(docRef, cleanUpdates);
      
      console.log('✅ 项目更新成功');
    } catch (e) {
      console.error('❌ 更新失败:', e);
      console.error('错误详情:', e.message, e.code);
      throw e;
    }
  };

  // ✅ 添加新项目
  const addItem = async (collectionKey, newItem) => {
    try {
      console.log('➕ 添加项目:', { collectionKey, newItem });
      
      // ✅ 移除所有 id 相关字段，让 Firestore 自动生成
      const { id, _dataId, _collectionKey, _isNew, ...cleanItem } = newItem;
      
      console.log('🧹 清理后的数据:', cleanItem);
      
      const docRef = await addDoc(collection(db, collectionKey), cleanItem);
      
      console.log('✅ 项目添加成功，Firestore 生成的 ID:', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('❌ 添加失败:', e);
      console.error('错误详情:', e.message, e.code);
      throw e;
    }
  };

  // ✅ 删除项目（关键修复）
  const deleteItem = async (collectionKey, itemId) => {
    try {
      console.log('\n🗑️ ===== 开始删除 =====');
      console.log('集合:', collectionKey);
      console.log('itemId:', itemId);
      console.log('itemId 类型:', typeof itemId);
      
      // ✅ 确保 itemId 是字符串
      const docId = String(itemId);
      console.log('转换后的 docId:', docId);
      
      // ✅ 构建文档引用
      const docRef = doc(db, collectionKey, docId);
      console.log('文档完整路径:', docRef.path);
      
      // ✅ 执行删除
      await deleteDoc(docRef);
      
      console.log('✅ Firestore 删除操作完成');
      console.log('===== 删除结束 =====\n');
      
      // ✅ 立即更新本地状态
      setData(prev => ({
        ...prev,
        [collectionKey]: prev[collectionKey].filter(item => item.id !== docId)
      }));
      
    } catch (e) {
      console.error('\n❌ ===== 删除失败 =====');
      console.error('错误类型:', e.name);
      console.error('错误信息:', e.message);
      console.error('错误代码:', e.code);
      console.error('完整错误:', e);
      console.error('尝试删除的路径:', `${collectionKey}/${String(itemId)}`);
      console.error('===== 错误结束 =====\n');
      throw e;
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

      if (imported.labInfo) {
        await setDoc(doc(db, 'lab', 'info'), imported.labInfo);
      }

      const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];

      for (const collectionName of collections) {
        if (imported[collectionName]) {
          const snapshot = await getDocs(collection(db, collectionName));
          await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
          
          // ✅ 移除所有 id 字段
          await Promise.all(
            imported[collectionName].map(item => {
              const { id, _dataId, ...cleanItem } = item;
              return addDoc(collection(db, collectionName), cleanItem);
            })
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

      await setDoc(doc(db, 'lab', 'info'), defaultLabInfo);

      const collections = ['membersData', 'alumniData', 'publicationsData', 'retreatData'];
      const defaultCollections = {
        membersData: defaultMembers,
        alumniData: defaultAlumni,
        publicationsData: defaultPublications,
        retreatData: defaultRetreat
      };

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
        
        // ✅ 移除所有 id 字段
        await Promise.all(
          defaultCollections[collectionName].map(item => {
            const { id, ...cleanItem } = item;
            return addDoc(collection(db, collectionName), cleanItem);
          })
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

export function useLabData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useLabData must be used within DataProvider');
  }
  return context;
}
