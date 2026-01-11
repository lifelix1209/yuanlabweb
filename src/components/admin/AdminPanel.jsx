import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Upload, Download, RotateCcw, Plus, Trash2, Edit2, Save, X,
  Users, GraduationCap, FileText, Images, LogOut, Building2, Menu, X as CloseIcon
} from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';
import { Tag } from '../ui';

const tabs = [
  { key: 'labInfo', label: '实验室信息', icon: Building2 },
  { key: 'membersData', label: '团队成员', icon: Users },
  { key: 'alumniData', label: 'Alumni', icon: GraduationCap },
  { key: 'publicationsData', label: '出版物', icon: FileText },
  { key: 'retreatData', label: '团建相册', icon: Images },
];

export function AdminPanel() {
  const { data, updateData, updateItem, addItem, deleteItem, resetData, exportData, importData } = useLabData();
  const [activeTab, setActiveTab] = useState('labInfo');
  const [editingItem, setEditingItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 表单状态
  const [formData, setFormData] = useState({});

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/login');
  };

  const handleEdit = (item, collectionKey) => {
    setEditingItem({ ...item, _collectionKey: collectionKey });
    setFormData(item);
  };

  const handleSave = () => {
    try {
      if (editingItem._collectionKey === 'labInfo') {
        updateData('labInfo', formData);
        alert('保存成功！');
      } else if (editingItem._isNew) {
        // 新增项目
        const { _collectionKey, _isNew, id, ...newItem } = formData;
        addItem(_collectionKey, { ...newItem, id: Date.now() });
        alert('添加成功！');
      } else {
        // 更新项目
        const { _collectionKey, _isNew, id, ...updateItemData } = formData;
        updateItem(editingItem._collectionKey, editingItem.id, updateItemData);
        alert('保存成功！');
      }
      // 清空编辑状态
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('保存失败：', error);
      alert('保存失败：' + error.message);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = (collectionKey, id) => {
    if (confirm('确定要删除此项目吗？')) {
      deleteItem(collectionKey, id);
    }
  };

  const handleAddNew = () => {
    const collectionKey = activeTab;
    // 使用时间戳 + 随机数生成唯一 ID
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    let newItem = { id: newId };

    // 根据类型设置默认字段
    if (collectionKey === 'membersData') {
      newItem = { ...newItem, name: '', role: '', avatar: '', bio: '', tags: [] };
    } else if (collectionKey === 'alumniData') {
      newItem = { ...newItem, name: '', role: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() + 1, destination: '', note: '' };
    } else if (collectionKey === 'publicationsData') {
      newItem = { ...newItem, title: '', authors: '', conference: '', year: new Date().getFullYear().toString(), link: '', abstract: '' };
    } else if (collectionKey === 'retreatData') {
      newItem = { ...newItem, src: '', alt: '', title: '', desc: '' };
    }

    setEditingItem({ ...newItem, _collectionKey: collectionKey, _isNew: true });
    setFormData({ ...newItem, _collectionKey: collectionKey, _isNew: true });
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImportText(ev.target?.result || '');
      };
      reader.readAsText(file);
    }
  };

  const confirmImport = () => {
    const result = importData(importText);
    if (result.success) {
      setShowImportModal(false);
      setImportText('');
      alert('导入成功！');
    } else {
      alert(`导入失败：${result.error}`);
    }
  };

  const currentTab = tabs.find(t => t.key === activeTab);

  return (
    <div className="min-h-screen bg-sci-darker flex">
      {/* 侧边栏 */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-sci-card border-r border-slate-700 flex flex-col transition-all duration-300 fixed h-full z-20`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sci-gradient rounded-xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-white">管理后台</h1>
                <p className="text-xs text-slate-400">Yuan Lab</p>
              </div>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setEditingItem(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-sci-gradient text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-colors"
          >
            {sidebarOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
            {sidebarOpen && <span>{sidebarOpen ? '收起' : '展开'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* 顶部栏 */}
        <header className="bg-sci-card border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-white">{currentTab?.label}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
              <Download size={18} /> 导出
            </button>
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
              <Upload size={18} /> 导入
            </button>
            <button onClick={resetData} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
              <RotateCcw size={18} /> 重置
            </button>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="p-6">
          <div className="bg-sci-card rounded-2xl p-6 min-h-[calc(100vh-140px)]">
            {activeTab === 'labInfo' ? (
              <LabInfoEditor
                data={data.labInfo}
                editing={editingItem}
                formData={formData}
                setFormData={setFormData}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <CollectionEditor
                collectionKey={activeTab}
                data={data[activeTab]}
                editing={editingItem}
                formData={formData}
                setFormData={setFormData}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onAdd={handleAddNew}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </main>

      {/* 导入弹窗 */}
      {showImportModal && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-sci-card rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">导入 JSON 数据</h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="粘贴 JSON 数据..."
              className="w-full h-64 bg-sci-darker text-white rounded-xl p-4 font-mono text-sm"
            />
            <div className="flex justify-between mt-4">
              <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                选择文件
              </button>
              <div className="flex gap-2">
                <button onClick={() => { setShowImportModal(false); setImportText(''); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500">
                  取消
                </button>
                <button onClick={confirmImport} className="px-4 py-2 bg-sci-gradient text-white rounded-lg hover:bg-sci-gradient">
                  确认导入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 实验室信息编辑器
function LabInfoEditor({ data, editing, formData, setFormData, onEdit, onSave, onCancel }) {
  const isEditing = editing && editing._collectionKey === 'labInfo';

  return (
    <div>
      {!isEditing ? (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-white">实验室基本信息</h2>
            <button onClick={() => onEdit(data, 'labInfo')} className="flex items-center gap-2 px-4 py-2 bg-sci-gradient text-white rounded-lg hover:bg-sci-gradient">
              <Edit2 size={16} /> 编辑
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="bg-sci-darker rounded-xl p-4">
                <div className="text-xs text-slate-500 uppercase mb-1">{key}</div>
                <div className="text-white break-all">{typeof value === 'string' ? value : JSON.stringify(value)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">编辑实验室信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-slate-500 uppercase mb-1 block">{key}</label>
                {key === 'abstract' ? (
                  <textarea
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full bg-sci-darker text-white rounded-xl p-3 min-h-[100px]"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full bg-sci-darker text-white rounded-xl p-3"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
              <Save size={16} /> 保存
            </button>
            <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500">
              <X size={16} /> 取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 集合编辑器（成员、Alumni等）
function CollectionEditor({ collectionKey, data, editing, formData, setFormData, onEdit, onSave, onCancel, onAdd, onDelete }) {
  const isEditing = editing && editing._collectionKey === collectionKey;
  const title = tabs.find(t => t.key === collectionKey)?.label || collectionKey;

  const handleTagsChange = (value) => {
    setFormData({ ...formData, tags: value.split(',').map(t => t.trim()).filter(Boolean) });
  };

  const handleFileUpload = (key, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData({ ...formData, [key]: ev.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const isImageField = (key) => {
    return key === 'avatar' || key === 'src';
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title} 管理</h2>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
          <Plus size={16} /> 新增
        </button>
      </div>

      {isEditing ? (
        <div className="bg-sci-darker rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editing.id ? '编辑项目' : '新增项目'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData).map(([key, value]) => {
              if (key === 'id' || key === '_collectionKey' || key === '_isNew') return null;
              return (
                <div key={key}>
                  <label className="text-xs text-slate-500 uppercase mb-1 block">{key}</label>
                  {key === 'bio' || key === 'abstract' || key === 'note' || key === 'desc' ? (
                    <textarea
                      value={value || ''}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full bg-sci-card text-white rounded-xl p-3 min-h-[80px]"
                    />
                  ) : key === 'tags' ? (
                    <input
                      type="text"
                      value={Array.isArray(value) ? value.join(', ') : value || ''}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="用逗号分隔"
                      className="w-full bg-sci-card text-white rounded-xl p-3"
                    />
                  ) : isImageField(key) ? (
                    <div className="space-y-2">
                      {value && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-600">
                          <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          placeholder="输入图片链接或上传文件"
                          className="flex-1 bg-sci-card text-white rounded-xl p-3"
                        />
                        <label className="flex items-center gap-2 px-4 py-2 bg-sci-gradient text-white rounded-lg cursor-pointer hover:bg-sci-gradient hover:opacity-90 transition-opacity">
                          <Upload size={16} />
                          上传
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(key, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <input
                      type={key === 'startYear' || key === 'endYear' || key === 'year' ? 'number' : 'text'}
                      value={value || ''}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full bg-sci-card text-white rounded-xl p-3"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
              <Save size={16} /> 保存
            </button>
            <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500">
              <X size={16} /> 取消
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="bg-sci-darker rounded-xl p-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-white">{item.name || item.title}</span>
                {item.role && (
                  <Tag>{item.role}</Tag>
                )}
              </div>
              <div className="text-slate-400 text-sm">
                {item.bio?.slice(0, 50) || item.destination || item.conference || ''}
                {(item.bio?.length > 50 || item.destination?.length > 50) && '...'}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button onClick={() => onEdit(item, collectionKey)} className="p-2 text-sci-primary hover:bg-sci-card rounded-lg transition-colors">
                <Edit2 size={18} />
              </button>
              <button onClick={() => onDelete(collectionKey, item.id)} className="p-2 text-red-400 hover:bg-sci-card rounded-lg">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-center text-slate-500 py-8">暂无数据</div>
        )}
      </div>
    </div>
  );
}
