const User = require('../models/User');
const PharmacistProfile = require('../models/PharmacistProfile');
const Pharmacy = require('../models/Pharmacy');

// ==============================
// @desc    Submit Pharmacist Onboarding Form
// @route   POST /api/pharmacist/onboarding
// @access  Private
// ==============================
exports.submitOnboarding = async (req, res) => {
  try {
    const {
      personal,
      professional,
      workplace,
      documents,
      declaration
    } = req.body;

    // ✅ Validate declarations
    if (
      !declaration?.isDeclarationTrue ||
      !declaration?.agreedToTerms
    ) {
      return res.status(400).json({
        message: 'You must agree to all declarations and terms.'
      });
    }

    // ✅ Find or create PharmacistProfile
    let profile = await PharmacistProfile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new PharmacistProfile({ userId: req.user.id });
    }

    // ✅ Update profile fields
    profile.personal = personal;
    profile.professional = professional;
    profile.workplace = workplace;
    profile.documents = documents;
    profile.declaration = declaration;

    // ✅ Status & timestamp
    profile.status = 'pending';
    profile.submittedAt = Date.now();

    await profile.save();

    // ✅ Update User (mark onboarding complete)
    await User.findByIdAndUpdate(req.user.id, {
      onboardingCompleted: true,
    });

    // ✅ Sync public Pharmacy listing (optional but useful)
    if (workplace?.pharmacyName && workplace?.licenseNumber) {
      const pharmacyData = {
        name: workplace.pharmacyName,
        address: workplace.fullAddress,
        licenseNumber: workplace.licenseNumber,
        contactNumber: workplace.contactNumber,
        userId: req.user.id,
      };

      await Pharmacy.findOneAndUpdate(
        { userId: req.user.id },
        pharmacyData,
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      message: 'Pharmacist onboarding submitted successfully. Awaiting admin approval.',
      profile
    });

  } catch (err) {
    console.error('Pharmacist Onboarding Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
