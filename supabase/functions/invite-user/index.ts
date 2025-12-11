import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const { email, password, nome, role_empresa, empresa_id, consultoria_id } = await req.json()

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: nome }
        })

        if (authError) {
            throw authError
        }

        const userId = authData.user.id

        // 2. Insert into usuarios_empresa
        const { data: empresaData, error: empresaError } = await supabaseClient
            .from('usuarios_empresa')
            .insert({
                auth_user_id: userId,
                consultoria_id: consultoria_id,
                empresa_cliente_id: empresa_id,
                nome: nome,
                email: email,
                role_empresa: role_empresa,
                ativo: true
            })
            .select()
            .single()

        if (empresaError) {
            // Rollback auth user creation if db insert fails
            await supabaseClient.auth.admin.deleteUser(userId)
            throw empresaError
        }

        return new Response(
            JSON.stringify(empresaData),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
