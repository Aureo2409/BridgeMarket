// Leitura dos dados do dashboard (só leitura; o ADM já tem permissão via RLS).
import { sb } from "../../lib/supabase.js";

const PAGE = 1000;     // limite por pedido do PostgREST
const MAX_ROWS = 20000; // tecto de segurança

async function fetchAll(table, columns, orderBy) {
  let out = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await sb
      .from(table)
      .select(columns)
      .order(orderBy, { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    out = out.concat(data || []);
    if (!data || data.length < PAGE) break;
  }
  return out;
}

export async function fetchDashboardRows() {
  const [orders, recharges, ledger, profiles] = await Promise.all([
    fetchAll(
      "orders",
      "id,order_ref,user_id,funder_id,status,destination,payment_method,side,currency,amount_usd,amount_aoa,rate_applied,created_at,updated_at,sent_at,funder_rating,buyer_rating,seller_rating",
      "created_at"
    ),
    fetchAll("credit_recharges", "id,user_id,status,amount_kz,credits_added,package_id,created_at,confirmed_at", "created_at"),
    fetchAll("credit_transactions", "id,user_id,type,amount,created_at", "created_at"),
    fetchAll("profiles", "id,full_name,first_name,last_name,kyc_status,credits_balance,created_at", "created_at"),
  ]);
  return { orders, recharges, ledger, profiles };
}
