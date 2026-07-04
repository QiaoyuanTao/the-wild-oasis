import supabase, { supabaseUrl } from "./supabase";

// 从 Supabase 数据库获取 cabins 表的全部数据
export async function getCabins() {
  // 查询 cabins 表，select("*") 表示获取所有字段（所有列）
  const { data, error } = await supabase.from("cabins").select("*");
  // 错误处理：如果查询失败（如网络问题、表不存在、权限不足等），抛出异常
  // 抛出后会被 useQuery 的 onError 捕获，前端可显示错误提示
  if (error) {
    console.log(error);
    throw new Error("Cabins could not be loaded");
  }

  // 返回查询结果（data 是一个数组，包含所有 cabin 对象）
  return data;
}

export async function createEditCabin(newCabin, id) {
  const hasImagePath = newCabin.image?.startsWith?.(supabaseUrl);
  const imageName = `${Math.random()}-${newCabin.image.name}`.replaceAll(
    "/",
    "",
  );
  //https://vxqshsffcdhevmlwfpqu.supabase.co/storage/v1/object/public/cabin-images/cabin-001.jpg

  const imagePath = hasImagePath
    ? newCabin.image
    : `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;

  let query = supabase.from("cabins");

  if (!id) query = query.insert([{ ...newCabin, image: imagePath }]).select();

  if (id)
    query = query
      .update({ ...newCabin, image: imagePath })
      .eq("id", id)
      .select();

  const { data, error } = await query.select().single();

  if (error) {
    console.log(error);
    throw new Error("Cabins could not be created");
  }

  if (!hasImagePath) return data;

  const { error: storageError } = await supabase.storage
    .from("cabin-images")
    .upload(imageName, newCabin.image);

  if (storageError) {
    await supabase.from("cabins").delete().eq("id", data.id);
    console.log(storageError);
    throw new Error(
      "Cabin image could not be uploaded and the cabin was not created",
    );
  }

  return data;
}

export async function deleteCabin(id) {
  const { data, error } = await supabase.from("cabins").delete().eq("id", id);

  if (error) {
    console.log(error);
    throw new Error("Cabin could not be deleted");
  }

  return data;
}
