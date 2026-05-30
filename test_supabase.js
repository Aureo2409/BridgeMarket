import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gexlmuclvadddhlbmgkl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleGxtdWNsdmFkZGRobGJtZ2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTM2NjksImV4cCI6MjA5MzY2OTY2OX0.c4Bgf2C-QcTSsl_CzCvyBHzpFDmKVXVdQ0x34LywFTk";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testInsert() {
  console.log("=== TEST INSERT START ===");

  // Let's try to insert a message with a random/null order_id to see what schema errors we get
  const { data, error } = await sb.from("chat_messages").insert({
    order_id: "00000000-0000-0000-0000-000000000000",
    user_id: "00000000-0000-0000-0000-000000000000",
    sender_id: "00000000-0000-0000-0000-000000000000",
    sender_role: "client",
    body: "Test message"
  }).select();

  console.log("Insert response error:", error);
  console.log("Insert response data:", data);
}

testInsert();
