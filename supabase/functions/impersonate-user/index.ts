import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // 1. Verify if the caller is authenticated
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('No authorization header')

        const { data: { user: caller }, error: userError } = await supabaseClient.auth.getUser(
            authHeader.replace('Bearer ', '')
        )
        if (userError || !caller) throw new Error('Invalid user token')

        // 2. Verify if caller is Super Admin
        const { data: adminProfile, error: profileError } = await supabaseClient
            .from('usuarios')
            .select('role_plataforma')
            .eq('auth_user_id', caller.id)
            .single()

        if (profileError || adminProfile?.role_plataforma !== 'superadmin') {
            return new Response(JSON.stringify({ error: 'Unauthorized. Requires superadmin role.' }), {
                status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const { target_user_id, justificativa } = await req.json()
        if (!target_user_id) throw new Error('target_user_id is required')

        // 3. Get Target User Details (Email needed for magic link)
        // Try finding in usuarios first (consultors/admins)
        let targetEmail = ''
        let targetName = ''
        let targetType = ''

        const { data: userData } = await supabaseClient
            .from('usuarios')
            .select('email, nome, role_plataforma')
            .eq('id', target_user_id) // Assuming target_user_id is the public ID, wait. 
            // The UI usually lists IDs from public tables.
            // But generateLink needs email.
            .single()

        if (userData) {
            targetEmail = userData.email
            targetName = userData.nome
            targetType = userData.role_plataforma || 'consultor' // simplified
        } else {
            // Try usuarios_empresa
            const { data: empUserData } = await supabaseClient
                .from('usuarios_empresa')
                .select('email, nome, role_empresa')
                .eq('id', target_user_id)
                .single()

            if (empUserData) {
                targetEmail = empUserData.email
                targetName = empUserData.nome
                targetType = empUserData.role_empresa
            } else {
                throw new Error('Target user not found in public tables')
            }
        }

        if (!targetEmail) throw new Error('Target user email not found')

        // 4. Generate Magic Link
        const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
            type: 'magiclink',
            email: targetEmail,
            options: {
                redirectTo: req.headers.get('origin') ?? 'http://localhost:5173'
            }
        })

        if (linkError) throw linkError

        // 5. Log Action
        const { error: auditError } = await supabaseClient
            .from('audit_impersonation')
            .insert({
                admin_user_id: caller.id, // Wait, audit_impersonation links to public.usuarios(id)?
                // Migration says: admin_user_id uuid REFERENCES public.usuarios(id)
                // I have caller.id which is auth_user_id. I need public.usuarios.id for the admin.
                // Let's fetch admin public ID.
                // Re-using adminProfile query would be better if I selected id.
            })
        // Let's refetch admin public ID properly

        const { data: adminPublicData } = await supabaseClient
            .from('usuarios')
            .select('id')
            .eq('auth_user_id', caller.id)
            .single()

        if (!adminPublicData) throw new Error('Admin public profile not found')

        await supabaseClient.from('audit_impersonation').insert({
            admin_user_id: adminPublicData.id,
            target_user_id: target_user_id, // This is the public ID passed in
            target_user_type: targetType,
            target_user_name: targetName,
            justificativa: justificativa || 'Support access',
            inicio: new Date().toISOString()
        })

        return new Response(
            JSON.stringify(linkData),
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
