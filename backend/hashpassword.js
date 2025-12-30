const bcrypt = require("bcryptjs");

/**
 * @description Manual Password Encryption Utility
 * Use this to generate hashes for manual database injection (Postman/Compass).
 */
const generateHash = async (plainPassword) => {
  try {
    console.log(`\n--- Encryption Protocol Initialized ---`);
    console.log(`Plaintext: ${plainPassword}`);

    // 1. Generate Salt
    const salt = await bcrypt.genSalt(10);
    
    // 2. Generate Hash
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    console.log(`Hashed Result: ${hashedPassword}`);
    
    // 3. Integrity Test
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`Integrity Test: ${isMatch ? "PASSED ✅" : "FAILED ❌"}`);
    console.log(`---------------------------------------\n`);

  } catch (err) {
    console.error("Encryption Error:", err.message);
  }
};

// Execute with your desired password
generateHash("Khan768.");