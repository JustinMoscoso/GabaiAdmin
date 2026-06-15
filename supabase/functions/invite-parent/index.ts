import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type InvitePayload = {
  email?: string;
  name?: string;
  gender?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!serviceRoleKey || !supabaseUrl) {
    return json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." }, 500);
  }

  const { email, name, gender } = (await req.json()) as InvitePayload;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return json({ error: "Email is required." }, 400);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      data: {
        name: name?.trim() || null,
        gender: gender?.trim() || null,
        role: "parent",
      },
    },
  );

  if (inviteError) {
    return json({ error: inviteError.message }, 400);
  }

  const userId = inviteData.user?.id;

  if (!userId) {
    return json({ error: "Invite succeeded but no user id was returned." }, 500);
  }

  const { error: profileError } = await supabaseAdmin.from("users").upsert(
    {
      id: userId,
      role: "parent",
      name: name?.trim() || normalizedEmail,
      email: normalizedEmail,
      gender: gender?.trim() || null,
      is_active: true,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return json({ error: profileError.message }, 500);
  }

  return json({
    message: `Invite sent to ${normalizedEmail}.`,
    user_id: userId,
  });
});
