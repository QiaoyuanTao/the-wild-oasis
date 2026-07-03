import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://vxqshsffcdhevmlwfpqu.supabase.co ";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXNoc2ZmY2RoZXZtbHdmcHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODcxMDksImV4cCI6MjA5ODQ2MzEwOX0.iphBkVAsz9odNQSSIJfY5TOoiMYmz_letrVn4qGUvpI";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
