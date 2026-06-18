import { NodeTimeline } from '@/components/nodes/NodeTimeline';
import { NodeDetailChart } from '@/components/nodes/NodeDetailChart';
import { CommentList } from '@/components/nodes/CommentList';
import { useAppStore } from '@/store/useAppStore';
import {
  versionNodes,
  getNodeById,
  getNodeComments,
  getNodeDailyData,
} from '@/data/mockData';
import { Package, Sword } from 'lucide-react';

export function NodesPage() {
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);
  const openWatchModalWithPrefill = useAppStore((state) => state.openWatchModalWithPrefill);

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  const nodeComments = selectedNodeId ? getNodeComments(selectedNodeId) : [];
  const nodeDailyData = selectedNodeId ? getNodeDailyData(selectedNodeId) : [];

  const handleAddToWatch = () => {
    if (selectedNode) {
      openWatchModalWithPrefill({
        title: `关注: ${selectedNode.title}`,
        description: `${selectedNode.description}。上线前情绪 ${(selectedNode.beforeSentiment * 100).toFixed(0)}%，上线后 ${(selectedNode.afterSentiment * 100).toFixed(0)}%，峰值讨论 ${(selectedNode.peakDiscussion / 1000).toFixed(1)}k。`,
        relatedNodeId: selectedNode.id,
      });
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">节点分析</h2>
          <p className="text-sm text-slate-400 mt-1">
            追踪版本节点前后的社区口碑变化
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500/50">
            <option>全部类型</option>
            <option>新英雄</option>
            <option>新皮肤</option>
            <option>赛季</option>
            <option>付费礼包</option>
            <option>版本补丁</option>
          </select>
          {selectedNode && (
            <button
              onClick={handleAddToWatch}
              className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Package size={14} />
              加入观察
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <NodeTimeline nodes={versionNodes} />
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-6">
          {selectedNode ? (
            <>
              <NodeDetailChart node={selectedNode} dailyData={nodeDailyData} />
              <CommentList comments={nodeComments} nodeTitle={selectedNode.title} />
            </>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-4">
                <Sword size={28} className="text-slate-500" />
              </div>
              <h3 className="text-base font-medium text-slate-300 mb-2">选择一个版本节点</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                从左侧时间轴选择一个版本节点，查看该事件前后的社区讨论热度和典型评论
              </p>
              <button
                onClick={() => setSelectedNodeId(versionNodes[0].id)}
                className="mt-6 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                查看最新节点
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
