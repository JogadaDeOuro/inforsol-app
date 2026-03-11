import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, contractId, contractName, signerName, signerEmail, signerType } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all authenticated users to notify (gestores)
    const { data: profiles } = await supabase.from("profiles").select("id");
    const userIds = profiles?.map((p) => p.id) || [];

    let title = "";
    let message = "";
    let notifType = "contract_signed";

    if (type === "company_signed") {
      title = "Contrato assinado pela empresa";
      message = `${signerName} assinou o contrato ${contractId} (${contractName}) pela empresa.`;
    } else if (type === "client_signed") {
      title = "Cliente assinou o contrato";
      message = `${signerName} assinou o contrato ${contractId} (${contractName}) como cliente.`;
    } else if (type === "fully_signed") {
      title = "Contrato totalmente assinado! 🎉";
      message = `O contrato ${contractId} (${contractName}) foi assinado por ambas as partes.`;
    } else if (type === "proposal_sent") {
      title = "Nova proposta enviada";
      message = `A proposta para ${contractName} foi enviada ao cliente.`;
      notifType = "proposal_sent";
    }

    // Insert notification for all gestores
    if (userIds.length > 0 && title) {
      const notifications = userIds.map((userId) => ({
        user_id: userId,
        title,
        message,
        type: notifType,
        metadata: { contractId, contractName, signerName, signerEmail, signerType },
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
