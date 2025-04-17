import fetch from 'node-fetch';

const registerUser = async () => {
  try {
    console.log('Starting registration test directly...');

    // Registration test
    const url = 'http://localhost:3001/api/auth/register';
    const requestBody = {
      email: `testuser${Date.now()}@example.com`,
      password: 'testpassword',
      name: 'Test User'
    };

    console.log(`\nAttempting registration at: ${url}`);
    console.log('Request body:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log(`\nResponse status: ${response.status}`);
    console.log('Response:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed response:', data);
      } catch (e) {
        console.log('Could not parse JSON response');
      }
    } else {
      console.error('Registration failed:', responseText);
    }

  } catch (error) {
    console.error('\nError during test:', error.message);
  }
};

registerUser();
