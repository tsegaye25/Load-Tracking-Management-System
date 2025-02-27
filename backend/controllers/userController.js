const User = require('../models/userModel');
const Course = require('../models/courseModel'); 
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
      cb(null, true);
  } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('avatar');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Create filename using user ID
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Ensure the upload directory exists
  const uploadDir = path.join(__dirname, '../uploads/profile-images');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Process and save the image
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join(uploadDir, req.file.filename));

  // Update the avatar URL to include the path
  req.file.filename = `/uploads/profile-images/${req.file.filename}`;

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
      return next(new AppError('User not found', 404));
  }

  res.status(200).json({
      status: 'success',
      data: user
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'department', 'school');

  if (req.file) {
    // Get current user to check for existing avatar
    const currentUser = await User.findById(req.user.id);
    if (currentUser.avatar && currentUser.avatar !== '/uploads/profile-images/default-avatar.jpg') {
      // Get the filename from the path
      const oldAvatarPath = path.join(__dirname, '..', currentUser.avatar);
      try {
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      } catch (err) {
        console.log('Error deleting old avatar:', err);
      }
    }
    filteredBody.avatar = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    return next(new AppError('Error updating user profile', 400));
  }

  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
});

exports.updateProfile = catchAsync(async (req, res) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
}

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Delete old avatar if it exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../uploads/profile-images', path.basename(user.avatar));
      try {
          if (fs.existsSync(oldAvatarPath)) {
              fs.unlinkSync(oldAvatarPath);
          }
      } catch (err) {
          console.log('Error deleting old avatar:', err);
      }
  }


  const filteredBody = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    school: req.body.school,
    department: req.body.department,
    position: req.body.position
  };

  // Add avatar to update only if a new file is uploaded
if (req.file) {
  filteredBody.avatar = req.file.filename;
}

    // Update user with new avatar filename
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,filteredBody,
      { 
          new: true,
          runValidators: true
      }
  );
  
  if (!updatedUser) {
    return next(new AppError('Error updating avatar', 400));
  }

  res.status(200).json({
    status: 'success',
    data: updatedUser
});
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find()
    .populate({
      path: 'courses',
      select: 'title code totalHours school department instructor',
      populate: {
        path: 'instructor',
        select: 'name'
      }
    });

  // For each instructor, also get courses where they are assigned as instructor
  const usersWithAllCourses = await Promise.all(users.map(async user => {
    if (user.role === 'instructor') {
      const assignedCourses = await Course.find({ instructor: user._id })
        .select('title code totalHours school department');
      
      // Convert to plain object to modify
      const userObj = user.toObject();
      
      // Ensure no duplicate courses
      const courseIds = new Set(userObj.courses.map(c => c._id.toString()));
      const additionalCourses = assignedCourses.filter(c => !courseIds.has(c._id.toString()));
      
      userObj.courses = [...userObj.courses, ...additionalCourses];
      return userObj;
    }
    return user;
  }));

  res.status(200).json({
    status: 'success',
    data: {
      users: usersWithAllCourses
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id)
    .populate({
      path: 'courses',
      select: 'title code totalHours school department instructor',
      populate: {
        path: 'instructor',
        select: 'name'
      }
    });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (user.role === 'instructor') {
    const assignedCourses = await Course.find({ instructor: user._id })
      .select('title code totalHours school department');
    
    // Convert to plain object to modify
    const userObj = user.toObject();
    
    // Ensure no duplicate courses
    const courseIds = new Set(userObj.courses.map(c => c._id.toString()));
    const additionalCourses = assignedCourses.filter(c => !courseIds.has(c._id.toString()));
    
    userObj.courses = [...userObj.courses, ...additionalCourses];
    user = userObj;
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'role',
    'school',
    'department',
    'phone',
    'active'
  );

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getInstructors = catchAsync(async (req, res, next) => {
  // Get the department head's department
  const departmentHead = await User.findById(req.user.id);
  if (!departmentHead || !departmentHead.department) {
    return next(new AppError('Department head information not found', 404));
  }

  // Find all instructors in the same department
  const instructors = await User.find({
    role: 'instructor',
    department: departmentHead.department,
    school: departmentHead.school // Also match the school
  }).select('name email department school');

  if (!instructors || instructors.length === 0) {
    return next(new AppError(`No instructors available in ${departmentHead.department} department of ${departmentHead.school}`, 404));
  }

  // Get the workload for each instructor
  const instructorsWithWorkload = await Promise.all(
    instructors.map(async (instructor) => {
      const assignedCourses = await Course.find({
        instructor: instructor._id,
        status: { $in: ['approved', 'pending'] } // Consider both approved and pending courses
      });

      const totalHours = assignedCourses.reduce((sum, course) => sum + (course.totalHours || 0), 0);

      return {
        _id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        department: instructor.department,
        school: instructor.school,
        currentWorkload: totalHours,
        assignedCourses: assignedCourses.length
      };
    })
  );

  res.status(200).json({
    status: 'success',
    results: instructorsWithWorkload.length,
    data: {
      instructors: instructorsWithWorkload
    }
  });
});

exports.getInstructorsByDepartment = catchAsync(async (req, res, next) => {
  const { department } = req.params;

  const instructors = await User.find({
    role: 'instructor',
    department: department,
    active: true
  }).select('name email department school');

  res.status(200).json({
    status: 'success',
    results: instructors.length,
    data: {
      instructors
    }
  });
});

exports.getDepartmentHeadsByDepartment = catchAsync(async (req, res, next) => {
  const { department } = req.params;

  const departmentHeads = await User.find({
    role: 'department-head',
    department: department,
    active: true
  }).select('name email department school');

  res.status(200).json({
    status: 'success',
    results: departmentHeads.length,
    data: {
      departmentHeads
    }
  });
});

exports.getDepartmentHeads = catchAsync(async (req, res, next) => {
  // Get the instructor's department and school
  const instructor = await User.findById(req.user.id);
  if (!instructor || !instructor.department) {
    return next(new AppError('Instructor information not found', 404));
  }

  // Find all department heads in the same department and school
  const departmentHeads = await User.find({
    role: 'department-head',
    department: instructor.department,
    school: instructor.school
  }).select('name email department school');

  if (!departmentHeads || departmentHeads.length === 0) {
    return next(new AppError(`No department head found for ${instructor.department} department in ${instructor.school}`, 404));
  }

  res.status(200).json({
    status: 'success',
    results: departmentHeads.length,
    data: {
      departmentHeads
    }
  });
});

exports.getInstructors = catchAsync(async (req, res) => {
  const instructors = await User.find({ 
    role: 'instructor',
    department: req.user.department 
  }).select('name email department school');

  res.status(200).json({
    status: 'success',
    data: {
      instructors
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
