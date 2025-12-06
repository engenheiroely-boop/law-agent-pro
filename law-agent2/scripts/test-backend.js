
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://woghysbojhlopwfzcwnq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2h5c2Jvamhsb3B3Znpjd25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTI4MjIsImV4cCI6MjA4MDU4ODgyMn0.KYsRyO_EdRdTTQHY-K4tKSuLWTmXovKa9o8lR9knejY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EMAIL = 'betatester@lawpro.com';
const PASSWORD = '12345678';

async function runTests() {
    console.log("🚀 Starting Backend Verification Tests...");

    // 1. Authentication
    console.log("\n1. Testing Authentication...");
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: EMAIL,
        password: PASSWORD
    });

    if (authError && authError.message.includes('Invalid login credentials')) {
        console.log("   User not found, attempting to Sign Up...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: EMAIL,
            password: PASSWORD
        });
        if (signUpError) {
            console.error("   ❌ Sign Up Failed:", signUpError.message);
            process.exit(1);
        }
        console.log("   ✅ User Created & Signed In");
        authData = signUpData;
    } else if (authError) {
        console.error("   ❌ Login Failed:", authError.message);
        process.exit(1);
    } else {
        console.log("   ✅ Login Successful");
    }

    const userId = authData.user.id;

    // 2. Clients Table
    console.log("\n2. Testing 'clients' Table...");
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
            name: 'Test Client Automation',
            type: 'PF',
            email: 'test@client.com',
            user_id: userId
        })
        .select()
        .single();

    if (clientError) {
        console.error("   ❌ Create Client Failed:", clientError.message);
        console.error("      (Did you run the SQL script to create the table?)");
        process.exit(1);
    }
    console.log("   ✅ Client Created:", client.id);

    // 3. Cases Table
    console.log("\n3. Testing 'cases' Table...");
    const { data: legalCase, error: caseError } = await supabase
        .from('cases')
        .insert({
            title: 'Test Case Automation',
            clientId: client.id,
            user_id: userId
        })
        .select()
        .single();

    if (caseError) {
        console.error("   ❌ Create Case Failed:", caseError.message);
        console.error("      (Did you run the SQL script for 'cases'?)");
        process.exit(1);
    }
    console.log("   ✅ Case Created:", legalCase.id);

    // 4. Tasks Table
    console.log("\n4. Testing 'tasks' Table...");
    const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
            title: 'Test Task Automation',
            priority: 'HIGH',
            status: 'TODO',
            user_id: userId
        })
        .select()
        .single();

    if (taskError) {
        console.error("   ❌ Create Task Failed:", taskError.message);
        process.exit(1);
    }
    console.log("   ✅ Task Created:", task.id);

    // 5. Cleanup
    console.log("\n5. Cleaning up...");
    await supabase.from('tasks').delete().eq('id', task.id);
    await supabase.from('cases').delete().eq('id', legalCase.id);
    await supabase.from('clients').delete().eq('id', client.id);
    console.log("   ✅ Test Data Deleted");

    console.log("\n🎉 ALL SYSTEMS GO! Phase 1 is fully operational.");
}

runTests();
