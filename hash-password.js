const bcrypt = require('bcrypt');

const password = '66606@Admin'; // Password to hash

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  } else {
    console.log('Hashed password:', hash);
  }
});
