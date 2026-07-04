import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import FormRow from "../../ui/FormRow";

import { useForm } from "react-hook-form";
import { createEditCabin } from "../../services/apiCabins";

// 组件初始化，cabinToEdit 不传参时默认为空对象
function CreateCabinForm({ cabinToEdit = {} }) {
  // 解构 cabinToEdit：id 重命名为 editId，剩余属性（name, price, image 等）打包到 editValues
  const { id: editId, ...editValues } = cabinToEdit;
  // 根据 editId 是否存在判断当前是编辑模式还是新建模式
  const isEditSession = Boolean(editId);

  // 初始化 react-hook-form，注册表单字段、验证规则、默认值等
  const { register, handleSubmit, reset, getValues, formState } = useForm({
    // 编辑模式：表单预填充已有数据（editValues）
    // 新建模式：表单默认值为空对象（各输入框空白）
    defaultValues: isEditSession ? editValues : {},
  });
  // 从 formState 中解构出验证错误信息（用于显示表单校验提示）
  const { errors } = formState;
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
      reset();
    },
    //请求失败后回调
    onError: (error) => {
      //显示后端返回的错误信息
      toast.error(error.message);
    },
  });

  // 配置 useMutation 处理"编辑 Cabin"，逻辑与 createCabin 类似
  // 区别：多传一个 id 参数，让后端走 update 分支而非 insert
  const { mutate: editCabin, isLoading: isEditing } = useMutation({
    // mutationFn 接收一个对象，解构出 newCabinData（用户修改后的表单数据）和 id
    // 然后调用 createEditCabin(newCabinData, id)，传入两个参数
    // 后端判断 id 存在，走 update（更新）逻辑
    mutationFn: ({ newCabinData, id }) => createEditCabin(newCabinData, id),
    onSuccess: () => {
      toast.success("Cabin successfully edited");
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  // 将新建（isCreating）和编辑（isEditing）的 loading 状态统一
  // 只要有一个在进行中，isWorking 就是 true，用于禁用按钮、显示 loading
  const isWorking = isCreating || isEditing;

  function onSubmit(data) {
    // 处理图片字段：判断用户是否上传了新图片
    //
    // 原因：react-hook-form 对文件输入框的处理规则：
    // - 编辑模式 + 用户没动文件框：data.image = 原来的 URL 字符串（来自 defaultValues）
    // - 新建/编辑 + 用户选了新文件：data.image = FileList（浏览器收集的文件列表）
    //
    // 判断逻辑：
    // - 如果是字符串 → 说明是旧图片 URL，原样保留传给后端
    // - 如果不是字符串 → 说明是 FileList，取 [0] 拿到单个 File 对象
    const image = typeof data.image === "string" ? data.image : data.image[0];

    // 根据当前模式调用不同的 mutation
    if (isEditSession)
      // 编辑模式：把修改后的数据 + 要编辑的 id 一起传给后端
      // 后端根据 id 判断走 update 分支
      editCabin({ newCabinData: { ...data, image }, id: editId });
    // 新建模式：只传表单数据（无 id），后端走 insert 分支
    else createCabin({ ...data, image: image });
  }

  function onError(errors) {
    // console.log(errors);
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit, onError)}>
      <FormRow label="Cabin name" error={errors?.name?.message}>
        <Input
          type="text"
          id="name"
          disabled={isWorking}
          {...register("name", {
            required: "This field is required",
            min: { value: 1, message: "Capacity should be at least 1" },
          })}
        />
      </FormRow>

      <FormRow label="Maximum capacity" error={errors?.maxCapacity?.message}>
        <Input
          type="number"
          id="maxCapacity"
          disabled={isWorking}
          {...register("maxCapacity", {
            required: "This field is required",
            min: { value: 1, message: "Capacity should be at least 1" },
          })}
        />
      </FormRow>

      <FormRow label="Regular price" error={errors?.regularPrice?.message}>
        <Input
          type="number"
          id="regularPrice"
          disabled={isWorking}
          {...register("regularPrice", {
            required: "This field is required",
            min: { value: 1, message: "Capacity should be at least 1" },
          })}
        />
      </FormRow>

      <FormRow label="Discount" error={errors?.discount?.message}>
        <Input
          type="number"
          id="discount"
          disabled={isWorking}
          defaultValue={0}
          {...register("discount", {
            required: "This field is required",
            validate: (value) =>
              Number(value) <= Number(getValues().regularPrice) ||
              "Discount should be less than regular price",
          })}
        />
      </FormRow>

      <FormRow
        label="Description for website"
        error={errors?.description?.message}
      >
        <Textarea
          type="number"
          id="description"
          disabled={isWorking}
          defaultValue=""
          {...register("description", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow label="Cabin photo">
        <FileInput
          id="image"
          accept="image/*"
          type="file"
          {...register("image", {
            required: isEditSession ? false : "This field is required",
          })}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button variation="secondary" type="reset">
          Cancel
        </Button>
        <Button disabled={isWorking}>
          {isEditSession ? "Edit cabin" : "Create new cabin"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default CreateCabinForm;
