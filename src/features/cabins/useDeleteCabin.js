import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCabin as deleteCabinApi } from "../../services/apiCabins";
import toast from "react-hot-toast";

//自定义Hook，封装deleteCabin的逻辑
export function useDeleteCabin() {
  // 获取 TanStack Query 的 QueryClient 实例
  // 用于在删除成功后让 cabins 列表缓存失效，触发页面自动刷新
  const queryClient = useQueryClient();

  // 配置 useMutation：处理"删除 Cabin"的后端写操作
  // isDeleting：删除请求是否正在进行中（可用于禁用按钮、显示 loading）
  // deleteCabin：触发删除的函数（调用方传入 id 即可）
  const { isLoading: isDeleting, mutate: deleteCabin } = useMutation({
    mutationFn: deleteCabinApi,
    onSuccess: () => {
      toast.success("Cabin deleted successfully");

      // 让 cabins 列表的缓存失效，标记为"已过期"
      // 页面上的 CabinList 组件会自动重新发起请求，刷新列表
      // 用户无需手动刷新页面，被删除的 cabin 就会从列表中消失
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
    },
    // 后端删除失败后的回调（如网络错误、权限不足、外键约束等）
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 返回状态和触发函数给调用方使用
  // 调用方：const { isDeleting, deleteCabin } = useDeleteCabin();
  return { isDeleting, deleteCabin };
}
