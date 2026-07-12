import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateCurrentUser } from "../../services/apiAuth";

export function useUpdateUser() {
  // 获取 TanStack Query 的 QueryClient 实例
  // 用于在 mutation 成功后手动标记缓存过期，触发列表重新获取
  const queryClient = useQueryClient();

  // 配置 useMutation 处理"编辑 Cabin"，逻辑与 createCabin 类似
  // 区别：多传一个 id 参数，让后端走 update 分支而非 insert
  const { mutate: updateUser, isLoading: isUpdating } = useMutation({
    // mutationFn 接收一个对象，解构出 newCabinData（用户修改后的表单数据）和 id
    // 然后调用 createEditCabin(newCabinData, id)，传入两个参数
    // 后端判断 id 存在，走 update（更新）逻辑
    mutationFn: updateCurrentUser,

    onSuccess: ({ user }) => {
      toast.success("User account successfully updated");
      queryClient.setQueryData(["user"], user);
      // queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return { updateUser, isUpdating };
}
