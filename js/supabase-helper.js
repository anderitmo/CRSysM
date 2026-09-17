// Helper de busca segura do Supabase com timeout para fallback instantâneo
export async function safeSupabaseQuery(queryPromise, timeoutMs = 1500) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout Supabase')), timeoutMs)
  );
  try {
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (err) {
    return { data: null, error: err, count: null };
  }
}
