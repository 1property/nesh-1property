const { createClient } = require('@supabase/supabase-js');

// Initialize your Supabase client
const supabase = createClient('https://erabbaphqueanoddsoqh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4');

async function insertData() {
  // Check if data with the same email already exists
  const { data: existingData, error: fetchError } = await supabase
    .from('callproperty')
    .select('*')
    .eq('email', 'janesmith2025@example.com');  // Use a different email to avoid skipping

  if (fetchError) {
    console.error('Error fetching data:', fetchError.message);
    return;
  }

  if (existingData.length > 0) {
    console.log('⚠️ Data already exists. Skipping insert.');
    return;
  }

  // If data doesn't exist, insert new record
  const { data, error } = await supabase
    .from('callproperty')
    .insert([
      {
        name: 'Jane Smith',
        phone: '987-654-3210',
        email: 'janesmith2025@example.com',  // Unique email
        location: 'Los Angeles',
        property: 'Apartment',
        source: 'Facebook',
        followup: '2025-05-10',
        status: 'New',
        notes: 'Interested in a callback next week'
      }
    ]);

  if (error) {
    console.error('Insert Error:', error.message);
  } else {
    console.log('📥 Inserted:', data);
  }
}

async function fetchData() {
  const { data, error } = await supabase
    .from('callproperty')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error.message);
  } else {
    console.log('📦 Fetched Data:', data);
  }
}

async function main() {
  await insertData();
  await fetchData();
}

main();
