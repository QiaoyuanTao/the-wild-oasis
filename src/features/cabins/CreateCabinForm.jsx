import { useForm } from "react-hook-form";
import styled from "styled-components";

import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCabin } from "../../services/apiCabins";
import FormRow from "../../ui/FormRow";

const FormRow2 = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 24rem 1fr 1.2fr;
  gap: 2.4rem;

  padding: 1.2rem 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  &:has(button) {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }
`;

const Label = styled.label`
  font-weight: 500;
`;

const Error = styled.span`
  font-size: 1.4rem;
  color: var(--color-red-700);
`;
function CreateCabinForm() {
  const { register, handleSubmit, reset, getValues, formState } = useForm();
  const { errors } = formState;

  //获取react-qeury的客户端实例，用于后续手动让缓存失效（invalidate），强制重新获取数据
  const queryClient = useQueryClient();

  //useMutation是react-query的核心钩子，专门用于处理服务端数据的写操作
  //useMutation用于处理写操作，区别于useQuery的读操作，useMutation返回一个mutate函数，用于触发写操作，isLoading用于捕获当前的加载状态
  const { mutate, isLoading: isCreating } = useMutation({
    //mutaionFn是一个函数，接收一个参数，这个参数就是我们在调用mutate函数时传入的参数，这里我们传入的是一个对象，包含了cabin的所有信息
    //告诉react-query如何去创建一个新的cabin，这里我们调用了apiCabins.js中的createCabin函数，这个函数会向后端发送一个POST请求，创建一个新的cabin
    //react-query会自动处理请求的状态，包括loading、error、success等状态，并且会缓存请求的结果，避免重复请求
    mutationFn: createCabin,
    //请求成功后的回调
    onSuccess: () => {
      //显示成功提示
      toast.success("New cabin successfully created");
      //让缓存失效，强制重新获取数据，这里我们让cabins的缓存失效，重新获取cabins的数据
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
      reset();
    },
    //请求失败后的回调
    onError: (error) => {
      //显示错误提示，这里我们假设error是一个对象，包含了message属性，实际情况可能需要根据后端返回的错误格式进行调整
      toast.error(error.message);
    },
  });

  function onSubmit(data) {
    //把image字段的值从FileList对象转换为File对象，取第一个文件
    mutate({ ...data, image: data.image[0] });
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
          disabled={isCreating}
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
          disabled={isCreating}
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
          disabled={isCreating}
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
          disabled={isCreating}
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
          disabled={isCreating}
          defaultValue=""
          {...register("description", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow label="Cabin photo">
        <FileInput
          id="image"
          accept="image/*"
          type="file"
          {...register("image", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button variation="secondary" type="reset">
          Cancel
        </Button>
        <Button disabled={isCreating}>Add cabin</Button>
      </FormRow>
    </Form>
  );
}

export default CreateCabinForm;
