const User = require('../models/userModel');

const generateISAFid = async (countryResiding, membershipType) => {
  const currentYear = new Date().getFullYear().toString().slice(2);
  
  // Set country code
  let countryCode = 'XX';
  if (countryResiding === 'France') countryCode = 'FR';
  else if (countryResiding === 'India') countryCode = 'IN';

  // Set membership type code
  let memberTypeCode = 'X';
  if (membershipType === 'Executive Team Member') memberTypeCode = 'E';
  else if (membershipType === 'Student Member') memberTypeCode = 'S';

  try {
    // Find the latest created user in the database
    const latestUser = await User.findOne({})
      .sort({ createdAt: -1 })
      .limit(1);

    let sequence;
    
    if (!latestUser) {
      // If no user exists, start with sequence 0001
      sequence = 1;
    } else {
      // Extract sequence from the latest user's ISAF ID
      const lastSequence = parseInt(latestUser.ISAFid.slice(-4));
      // Increment the sequence by 1
      sequence = lastSequence + 1;
    }

    // Generate new ISAF ID with the incremented sequence
    const newId = `ISAP${currentYear}${countryCode}${memberTypeCode}${sequence.toString().padStart(4, '0')}`;
    
    return newId;

  } catch (error) {
    console.error('Error generating ISAF ID:', error);
    throw error;
  }
};

module.exports = generateISAFid;