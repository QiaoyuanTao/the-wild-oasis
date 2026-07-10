import supabase from "./supabase";
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}
export async function getCurrentUser() {
  // 第 1 步：快速检查本地是否有 session
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  // 第 2 步：向服务端验证 token 有效性，获取完整用户信息
  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return data?.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
