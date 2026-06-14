export const computeMatchScore = (currentUser, candidateUser, teamContext = null) => {
  // If either user is missing, return 0
  if (!currentUser || !candidateUser) {
    return { score: 0, breakdown: {} };
  }

  const aSkills = (currentUser.skills || []).map(s => s.skill?.toString() || s.toString());
  const bSkills = (candidateUser.skills || []).map(s => s.skill?.toString() || s.toString());

  // 1. Skill Complementarity (35%)
  let complementarityScore = 0;
  if (teamContext && teamContext.skills && teamContext.skills.length > 0) {
    const requiredSkills = teamContext.skills.map(s => s.toString());
    const missingFromTeam = requiredSkills.filter(s => !aSkills.includes(s));
    
    if (missingFromTeam.length > 0) {
      const bMatchesMissing = bSkills.filter(s => missingFromTeam.includes(s));
      complementarityScore = (bMatchesMissing.length / missingFromTeam.length) * 35;
    } else {
      complementarityScore = 35; // Team needs nothing A lacks, B is fully compatible
    }
  } else {
    // Pairwise complementarity: B has skills A lacks, normalized by B's total skills
    const missingFromA = bSkills.filter(s => !aSkills.includes(s));
    complementarityScore = bSkills.length > 0 ? (missingFromA.length / bSkills.length) * 35 : 0;
  }

  // 2. Skill Overlap (10%)
  let overlapScore = 0;
  const unionSkills = [...new Set([...aSkills, ...bSkills])];
  if (unionSkills.length > 0) {
    const intersectionSkills = aSkills.filter(s => bSkills.includes(s));
    overlapScore = (intersectionSkills.length / unionSkills.length) * 10;
  }

  // 3. College Match (15%)
  let collegeScore = 0;
  const aCollege = (currentUser.college || '').trim().toLowerCase();
  const bCollege = (candidateUser.college || '').trim().toLowerCase();
  
  if (aCollege && bCollege) {
    if (aCollege === bCollege) {
      collegeScore = 15;
    } else {
      const cities = ['delhi', 'mumbai', 'bangalore', 'bengaluru', 'ghaziabad', 'noida', 'pune', 'chennai', 'hyderabad', 'kolkata'];
      const matchedCity = cities.find(city => aCollege.includes(city) && bCollege.includes(city));
      if (matchedCity) {
        collegeScore = 7;
      }
    }
  }

  // 4. Year Proximity (10%)
  let yearScore = 0;
  const yearDiff = Math.abs((currentUser.year || 1) - (candidateUser.year || 1));
  if (yearDiff <= 1) {
    yearScore = 10;
  } else if (yearDiff <= 2) {
    yearScore = 5;
  }

  // 5. Interests Overlap (10%)
  let interestsScore = 0;
  const aInterests = currentUser.interests || [];
  const bInterests = candidateUser.interests || [];
  const unionInterests = [...new Set([...aInterests, ...bInterests])];
  if (unionInterests.length > 0) {
    const intersectionInterests = aInterests.filter(i => bInterests.includes(i));
    interestsScore = (intersectionInterests.length / unionInterests.length) * 10;
  }

  // 6. Experience (10%)
  const experienceScore = Math.min(candidateUser.hackathonsAttended || 0, 10);

  // 7. Availability (10%)
  let availabilityScore = 0;
  if (candidateUser.availability === 'available') {
    availabilityScore = 10;
  } else if (candidateUser.availability === 'busy') {
    availabilityScore = 5;
  }

  // Compile final score
  const finalScore = Math.min(
    Math.round(
      complementarityScore +
      overlapScore +
      collegeScore +
      yearScore +
      interestsScore +
      experienceScore +
      availabilityScore
    ),
    100
  );

  return {
    score: finalScore,
    breakdown: {
      complementarity: Math.round(complementarityScore),
      overlap: Math.round(overlapScore),
      college: collegeScore,
      year: yearScore,
      interests: Math.round(interestsScore),
      experience: experienceScore,
      availability: availabilityScore
    }
  };
};
