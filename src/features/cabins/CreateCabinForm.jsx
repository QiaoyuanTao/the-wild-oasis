import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import FormRow from "../../ui/FormRow";

import { useForm } from "react-hook-form";
import { useCreateCabin } from "./useCreateCabin";
import { useEditCabin } from "./useEditCabin";

// 组件初始化，cabinToEdit 不传参时默认为空对象
function CreateCabinForm({ cabinToEdit = {}, onCloseModal }) {
  const { isCreating, createCabin } = useCreateCabin();

  const { isEditing, editCabin } = useEditCabin();

  // 将新建（isCreating）和编辑（isEditing）的 loading 状态统一
  // 只要有一个在进行中，isWorking 就是 true，用于禁用按钮、显示 loading
  const isWorking = isCreating || isEditing;

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
      editCabin(
        { newCabinData: { ...data, image }, id: editId },
        {
          onSuccess: (data) => {
            reset();
          },
        },
      );
    // 新建模式：只传表单数据（无 id），后端走 insert 分支
    else
      createCabin(
        { ...data, image: image },
        {
          onSuccess: (data) => {
            reset();
            onCloseModal?.();
          },
        },
      );
  }

  function onError(errors) {
    // console.log(errors);
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      type={onCloseModal ? "modal" : "regular"}
    >
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
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
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
