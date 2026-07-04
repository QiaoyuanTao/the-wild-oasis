import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createEditCabin } from "../../services/apiCabins";

export function useCreateCabin() {
  // 获取 TanStack Query 的 QueryClient 实例
  // 用于在 mutation 成功后手动标记缓存过期，触发列表重新获取
  const queryClient = useQueryClient();

  // 配置 useMutation 处理"新建 Cabin"的后端写操作
  // isLoading: isCreating 用于控制按钮加载状态和禁用
  const { mutate: createCabin, isLoading: isCreating } = useMutation({
    // 实际执行后端请求的 API 函数
    // 调用 createCabin(data) 时，react-query 会自动执行 createEditCabin(data, undefined)
    // 注意这里没传 id，所以后端走 insert（新建）分支
    mutationFn: createEditCabin,
    //请求成功后回调
    onSuccess: () => {
      //提示成功信息
      toast.success("New cabin successfully created");
      // 让 cabins 列表的缓存失效，标记为"已过期"
      // 页面上的 CabinList 组件会自动重新获取数据，无需刷新页面
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
      // 重置表单为初始状态（新建模式下 defaultValues 是 {}，所以清空）
    },
    //请求失败后回调
    onError: (error) => {
      //显示后端返回的错误信息
      toast.error(error.message);
    },
  });

  return { isCreating, createCabin };
}
