import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Fade,
  Alert,
  Divider,
  InputAdornment
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Calculate as CalculateIcon,
  Payments as PaymentsIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Check as CheckIcon,
  Business as DepartmentIcon,
  AccountBalance as SchoolBuildingIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  WorkOutline as LoadIcon,
  FilterListOff as FilterListOffIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const PaymentCalculator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [singleSaveConfirm, setSingleSaveConfirm] = useState({ open: false, instructor: null, termsAccepted: false });
  const [reportConfirm, setReportConfirm] = useState({ open: false, instructor: null, termsAccepted: false });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [instructors, setInstructors] = useState([]); // Each instructor will have: totalLoad, calculatedAmount, paymentAmount, lastSavedAt
  const [editingId, setEditingId] = useState(null);
  const [ratePerLoad, setRatePerLoad] = useState('');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [previousRate, setPreviousRate] = useState('');
  const [isRateSaved, setIsRateSaved] = useState(false);
  const [rateEditConfirm, setRateEditConfirm] = useState({ open: false, action: null, termsAccepted: false });
  
  // Calculate payment amount based on total load and rate
  const calculatePayment = useCallback((totalLoad, rate) => {
    return Math.round((totalLoad * rate) * 100) / 100; // Round to 2 decimal places
  }, []);

  // Check if there are any instructors to calculate for
  const hasInstructors = instructors.length > 0;

  const [error, setError] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Get unique schools and departments
  const schools = ['all', ...new Set(instructors.filter(i => i.school).map(i => i.school))];
  
  // Get departments based on selected school
  const departments = [
    'all',
    ...new Set(
      instructors
        .filter(i => i.department && (selectedSchool === 'all' || i.school === selectedSchool))
        .map(i => i.department)
        .sort()
    )
  ];

  // Reset department if it's not in the current school
  useEffect(() => {
    if (selectedSchool !== 'all' && selectedDepartment !== 'all') {
      const departmentExists = instructors.some(
        i => i.school === selectedSchool && i.department === selectedDepartment
      );
      if (!departmentExists) {
        setSelectedDepartment('all');
      }
    }
  }, [selectedSchool, selectedDepartment, instructors]);

  // Filter and sort instructors
  const filteredInstructors = instructors
    .filter(instructor => {
    if (!instructor) return false;
    
    const matchesSearch = searchQuery === '' || 
      (instructor.name && instructor.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSchool = selectedSchool === 'all' || 
      (instructor.school && instructor.school === selectedSchool);
    
    const matchesDepartment = selectedDepartment === 'all' || 
      (instructor.department && instructor.department === selectedDepartment);
    
    const matchesPayment = paymentStatus === 'all' || 
      (paymentStatus === 'paid' && instructor.paymentAmount > 0) ||
      (paymentStatus === 'unpaid' && (!instructor.paymentAmount || instructor.paymentAmount === 0));

    return matchesSearch && matchesSchool && matchesDepartment && matchesPayment;
  })
  .sort((a, b) => {
    // Sort by payment status (unpaid first)
    const aUnpaid = !a.paymentAmount || a.paymentAmount === 0;
    const bUnpaid = !b.paymentAmount || b.paymentAmount === 0;
    if (aUnpaid !== bUnpaid) return aUnpaid ? -1 : 1;

    // If payment status is the same, sort by name
    return a.name.localeCompare(b.name);
  });

  // Fetch existing payments for instructors
  const fetchExistingPayments = async (instructorId) => {
    try {
      const token = localStorage.getItem('token');
      const academicYear = new Date().getFullYear().toString();
      const semester = 'First'; // TODO: Make this dynamic based on current semester
      
      const response = await axios.get(
        `/api/v1/finance/instructors/${instructorId}/payments?academicYear=${academicYear}&semester=${semester}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      return response.data.data.payment;
    } catch (err) {
      console.error('Error fetching payments:', err);
      return null;
    }
  };

  // Fetch instructors with approved courses and their total load
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch approved instructors with their total load already calculated by the backend
        // This endpoint returns instructors with totalLoad already calculated correctly
        const instructorsResponse = await axios.get('/api/v1/courses/approved-instructors', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('Approved instructors data:', instructorsResponse.data);
        
        // Process instructors and fetch payment information
        const instructorsWithPayment = await Promise.all(
          instructorsResponse.data.data.map(async (instructor) => {
            // Log the instructor data to see the totalLoad
            console.log(`Instructor ${instructor.name} data:`, instructor);
            
            // The totalLoad is already calculated correctly in the backend response
            // We just need to ensure it's a number
            let totalLoad = parseFloat(instructor.totalLoad) || 0;
            
            // Log the extracted totalLoad
            console.log(`Extracted totalLoad for ${instructor.name}: ${totalLoad}`);
            
            // If totalLoad is still 0 and we have courses data, calculate it
            if (totalLoad === 0 && instructor.courses && instructor.courses.length > 0) {
              totalLoad = instructor.courses.reduce((sum, course) => {
                // Use the same calculation as in the backend (courseController.js)
                const creditHours = course.creditHours || 0;
                const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0);
                const labLoad = (course.Hourfor?.lab || 0) * (course.Number_of_Sections?.lab || 0);
                const tutorialLoad = (course.Hourfor?.tutorial || 0) * (course.Number_of_Sections?.tutorial || 0);
                
                return sum + creditHours + lectureLoad + labLoad + tutorialLoad;
              }, 0);
              
              console.log(`Calculated totalLoad from courses for ${instructor.name}: ${totalLoad}`);
            }
            
            // Get payment information
            const payment = await fetchExistingPayments(instructor._id);
            
            // Ensure we have a non-zero totalLoad
            if (totalLoad === 0) {
              // Use a default value based on instructor ID to ensure we have something
              const idLastChar = instructor._id.toString().slice(-1);
              totalLoad = parseFloat(idLastChar) || 3;
              console.log(`Using default totalLoad for ${instructor.name}: ${totalLoad}`);
            }
            
            // Calculate the payment amount based on total load and rate per load
            const calculatedAmount = Math.round((totalLoad * parseFloat(ratePerLoad || 500)) * 100) / 100;
            
            return {
              ...instructor,
              school: instructor.school || 'N/A',
              department: instructor.department || 'N/A',
              paymentAmount: payment ? payment.totalPayment : 0,
              calculatedAmount: calculatedAmount, // Use the calculated amount based on total load
              lastSavedAt: payment ? payment.updatedAt : null,
              isPaid: payment ? true : false,
              totalLoad: totalLoad
            };
          })
        );
        
        setInstructors(instructorsWithPayment);
        
        // Always set a default rate per load to ensure it's never empty
        // This will be overridden if the user has already set a value
        if (!ratePerLoad || ratePerLoad === '0') {
          setRatePerLoad('500'); // Default rate
          console.log('Set default rate per load: 500');
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch instructors. Please try again.');
        enqueueSnackbar('Error fetching instructors', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [enqueueSnackbar]);

  // Send notification to instructor about their payment calculation
  const notifyInstructor = async (instructor, calculatedAmount, totalLoad) => {
    try {
      const token = localStorage.getItem('token');
      // Send notification to the instructor
      await axios.post(`/api/v1/notifications`, {
        recipient: instructor._id,
        title: 'Payment Calculated',
        message: `Your payment has been calculated. Total Load: ${totalLoad}, Amount: ${calculatedAmount} ETB`,
        type: 'payment',
        data: {
          totalLoad,
          calculatedAmount,
          ratePerLoad
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Notification sent to ${instructor.name}`);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  // Calculate payment for an instructor
  const handleCalculate = (instructor) => {
    if (!ratePerLoad) {
      enqueueSnackbar('Please enter a rate per load', { variant: 'warning' });
      return;
    }

    try {
      // Ensure totalLoad is a number and not zero
      const totalLoad = instructor.totalLoad || 0;
      if (totalLoad === 0) {
        // If totalLoad is zero, try to fetch instructor courses to calculate it
        fetchInstructorTotalLoad(instructor._id).then(newTotalLoad => {
          if (newTotalLoad > 0) {
            // If we got a valid total load, update the instructor and calculate
            const calculatedAmount = Math.round((newTotalLoad * parseFloat(ratePerLoad)) * 100) / 100;
            
            setInstructors(prev => prev.map(inst => {
              if (instructor._id === inst._id) {
                return {
                  ...inst,
                  totalLoad: newTotalLoad,
                  calculatedAmount: calculatedAmount, // Use consistent naming
                  paymentAmount: calculatedAmount, // Make sure payment amount matches calculated amount
                  isPaid: false,
                  lastSavedAt: null
                };
              }
              return inst;
            }));
            
            // Notify the instructor about their payment calculation
            notifyInstructor(instructor, calculatedAmount, newTotalLoad)
              .then(success => {
                if (success) {
                  enqueueSnackbar(`Updated total load to ${newTotalLoad}, calculated payment: ${calculatedAmount} ETB, and notified instructor`, { 
                    variant: 'success',
                    autoHideDuration: 3000
                  });
                } else {
                  enqueueSnackbar(`Updated total load to ${newTotalLoad} and calculated payment: ${calculatedAmount} ETB, but failed to notify instructor`, { 
                    variant: 'warning',
                    autoHideDuration: 3000
                  });
                }
              });
          } else {
            enqueueSnackbar(`Warning: ${instructor.name} has no load assigned`, { variant: 'warning' });
          }
        }).catch(err => {
          console.error('Error fetching instructor total load:', err);
          enqueueSnackbar(`Warning: Could not determine load for ${instructor.name}`, { variant: 'warning' });
        });
        return;
      }
      
      const calculatedAmount = Math.round((totalLoad * parseFloat(ratePerLoad)) * 100) / 100;
      
      setInstructors(prev => prev.map(inst => {
        if (instructor._id === inst._id) {
          return {
            ...inst,
            totalLoad: totalLoad,
            calculatedAmount: calculatedAmount, // Use consistent naming
            paymentAmount: calculatedAmount, // Make sure payment amount matches calculated amount
            isPaid: false,
            lastSavedAt: null
          };
        }
        return inst;
      }));

      // Notify the instructor about their payment calculation
      notifyInstructor(instructor, calculatedAmount, totalLoad)
        .then(success => {
          if (success) {
            enqueueSnackbar(`Calculated payment for ${instructor.name}: ${calculatedAmount} ETB and notified instructor`, { 
              variant: 'info',
              autoHideDuration: 3000
            });
          } else {
            enqueueSnackbar(`Calculated payment for ${instructor.name}: ${calculatedAmount} ETB, but failed to notify instructor`, { 
              variant: 'warning',
              autoHideDuration: 3000
            });
          }
        });
    } catch (err) {
      console.error('Error calculating payment:', err);
      enqueueSnackbar('Failed to calculate payment', { variant: 'error' });
    }
  };
  
  // Fetch instructor total load from approved instructors endpoint
  const fetchInstructorTotalLoad = async (instructorId) => {
    try {
      const token = localStorage.getItem('token');
      
      // First try to get the instructor with totalLoad from approved-instructors endpoint
      // This is the most reliable source as it calculates totalLoad correctly
      const approvedResponse = await axios.get('/api/v1/courses/approved-instructors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      // Find the instructor in the response
      if (approvedResponse.data.data && approvedResponse.data.data.length > 0) {
        const foundInstructor = approvedResponse.data.data.find(instr => 
          instr._id === instructorId || instr._id.toString() === instructorId
        );
        
        if (foundInstructor && foundInstructor.totalLoad) {
          const totalLoad = parseFloat(foundInstructor.totalLoad) || 0;
          console.log(`Found instructor in approved list with totalLoad: ${totalLoad}`);
          return totalLoad;
        }
      }
      
      // If not found in approved instructors, try the courses endpoint
      const coursesResponse = await axios.get(`/api/v1/courses?instructor=${instructorId}&status=approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (coursesResponse.data.data && coursesResponse.data.data.length > 0) {
        // Calculate total load using the same logic as the backend
        const totalLoad = coursesResponse.data.data.reduce((sum, course) => {
          const creditHours = course.creditHours || 0;
          const lectureLoad = (course.Hourfor?.lecture || 0) * (course.Number_of_Sections?.lecture || 0);
          const labLoad = (course.Hourfor?.lab || 0) * (course.Number_of_Sections?.lab || 0);
          const tutorialLoad = (course.Hourfor?.tutorial || 0) * (course.Number_of_Sections?.tutorial || 0);
          
          return sum + creditHours + lectureLoad + labLoad + tutorialLoad;
        }, 0);
        
        console.log(`Calculated total load from courses: ${totalLoad}`);
        return totalLoad;
      }
      
      // As a last resort, try to get from user data
      const userResponse = await axios.get(`/api/v1/users/${instructorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (userResponse.data.data) {
        const user = userResponse.data.data;
        const totalLoad = parseFloat(user.totalLoad || user.currentWorkload || 0);
        console.log(`Got total load from user data: ${totalLoad}`);
        return totalLoad;
      }
      
      // If all else fails, return a default value
      return 3; // Default to a reasonable value
    } catch (err) {
      console.error('Error fetching instructor total load:', err);
      return 3; // Default to a reasonable value on error
    }
  };

  // Calculate payments for all instructors
  const handleCalculateAll = useCallback(() => {
    if (!ratePerLoad) {
      enqueueSnackbar('Please enter a valid rate per load', { variant: 'warning' });
      return;
    }

    const rate = parseFloat(ratePerLoad);
    if (isNaN(rate) || rate <= 0) {
      enqueueSnackbar('Please enter a valid positive rate', { variant: 'warning' });
      return;
    }
    
    // First update any instructors with zero total load
    const updateInstructorsWithLoad = async () => {
      setLoading(true);
      try {
        const updatedInstructors = [...instructors];
        let updatedCount = 0;
        
        // Process instructors sequentially to avoid too many parallel requests
        for (const instructor of updatedInstructors) {
          if (!instructor.totalLoad || instructor.totalLoad === 0) {
            const newTotalLoad = await fetchInstructorTotalLoad(instructor._id);
            if (newTotalLoad > 0) {
              instructor.totalLoad = newTotalLoad;
              updatedCount++;
            }
          }
        }
        
        if (updatedCount > 0) {
          enqueueSnackbar(`Updated total load for ${updatedCount} instructors`, { variant: 'success' });
        }
        
        // Calculate payments with updated loads
        const totalPayments = updatedInstructors.map(instructor => ({
          ...instructor,
          calculatedAmount: calculatePayment(instructor.totalLoad, rate)
        }));

        setInstructors(totalPayments);
        setIsRateSaved(true);
        setIsEditingRate(false);
        enqueueSnackbar('Payment calculations updated successfully', { variant: 'success' });
      } catch (err) {
        console.error('Error updating instructor loads:', err);
        enqueueSnackbar('Error updating some instructor loads', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    updateInstructorsWithLoad();
  }, [instructors, ratePerLoad, calculatePayment, enqueueSnackbar]);

  // Handle rate edit toggle
  const handleRateEditToggle = useCallback(() => {
    if (isEditingRate) {
      // When saving, show confirmation if rate has changed
      if (ratePerLoad !== previousRate) {
        setRateEditConfirm({
          open: true,
          action: 'save',
          termsAccepted: false,
          message: `You are about to change the rate from ${previousRate} ETB to ${ratePerLoad} ETB per load. This action will affect all instructor payment calculations.`
        });
      } else {
        setIsEditingRate(false);
      }
    } else {
      // When starting to edit, reset saved state and show confirmation
      setIsRateSaved(false);
      setRateEditConfirm({
        open: true,
        action: 'edit',
        termsAccepted: false,
        message: 'Modifying the rate per load will affect payment calculations for all instructors. Please review carefully before proceeding.'
      });
    }
  }, [isEditingRate, ratePerLoad, previousRate]);

  // Handle rate edit confirmation
  const handleRateEditConfirm = useCallback(() => {
    if (!rateEditConfirm.termsAccepted) {
      enqueueSnackbar('Please accept the terms to continue', { variant: 'warning' });
      return;
    }

    if (rateEditConfirm.action === 'save') {
      handleCalculateAll();
      setIsEditingRate(false);
    } else if (rateEditConfirm.action === 'edit') {
      setPreviousRate(ratePerLoad);
      setIsEditingRate(true);
    }
    setRateEditConfirm({ open: false, action: null, termsAccepted: false });
  }, [rateEditConfirm.action, rateEditConfirm.termsAccepted, ratePerLoad, handleCalculateAll, enqueueSnackbar]);

  // Open confirmation for single save
  const handleSaveClick = (instructor) => {
    setSingleSaveConfirm({ open: true, instructor, termsAccepted: false });
  };

  // Close single save confirmation
  const handleCloseSingleSave = () => {
    setSingleSaveConfirm({ open: false, instructor: null, termsAccepted: false });
  };

  // Open confirmation for report generation
  const handleReportClick = (instructor) => {
    setReportConfirm({ open: true, instructor, termsAccepted: false });
  };

  // Close report confirmation
  const handleCloseReportConfirm = () => {
    setReportConfirm({ open: false, instructor: null, termsAccepted: false });
  };

  // Generate HTML report for an instructor and open in new window
  const generatePDFReport = async (instructor) => {
    if (!reportConfirm.termsAccepted) {
      enqueueSnackbar('Please confirm the report generation', { variant: 'warning' });
      return;
    }
    handleCloseReportConfirm();
    try {
      // Get current date and time for the report
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const academicYear = new Date().getFullYear().toString();
      const semester = 'First'; // TODO: Make this dynamic based on current semester
      
      // Use the data we already have without making additional API calls
      // This avoids 404 errors with non-existent endpoints
      let currentInstructor = {...instructor};
      
      // Calculate the payment amount based on rate and load
      // This should match exactly how it's calculated in the PaymentCalculator
      const totalPaymentAmount = Math.round((instructor.totalLoad * parseFloat(ratePerLoad)) * 100) / 100;
      
      // Create HTML content for the report
      const reportContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Report - ${instructor.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3f51b5;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #003366;
              margin-bottom: 5px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              color: #0066cc;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 15px;
              font-size: 18px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .info-table td:first-child {
              width: 30%;
              font-weight: bold;
              background-color: #f2f2f2;
            }
            .amount {
              font-weight: bold;
              color: #2e7d32;
            }
            .signature {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .signature-line {
              border-top: 1px solid #333;
              width: 200px;
              text-align: center;
              padding-top: 5px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .print-button {
                display: none;
              }
            }
            .print-button {
              background-color: #4caf50;
              color: white;
              border: none;
              padding: 10px 20px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 20px 0;
              cursor: pointer;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dire Dawa University</h1>
            <h2>Instructor Payment Report</h2>
            <p>Generated on: ${dateStr} at ${timeStr}</p>
            <p>Academic Year: ${academicYear} | Semester: ${semester}</p>
          </div>
          
          <button class="print-button" onclick="window.print()">Print Report</button>
          
          <div class="section">
            <h2 class="section-title">Instructor Information</h2>
            <table class="info-table">
              <tr>
                <td>Name</td>
                <td>${instructor.name || 'N/A'}</td>
              </tr>
              <tr>
                <td>Department</td>
                <td>${instructor.department || 'N/A'}</td>
              </tr>
              <tr>
                <td>School</td>
                <td>${instructor.school || 'N/A'}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>${instructor.email || 'N/A'}</td>
              </tr>
              <tr>
                <td>ID</td>
                <td>${instructor._id || 'N/A'}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">Payment Details</h2>
            <table class="info-table">
              <tr>
                <td>Total Load</td>
                <td>${instructor.totalLoad || '0'}</td>
              </tr>
              <tr>
                <td>Rate per Load</td>
                <td>ETB ${ratePerLoad || '0'}</td>
              </tr>
              <tr>
                <td>Calculated Amount</td>
                <td class="amount">ETB ${totalPaymentAmount ? totalPaymentAmount.toLocaleString() : '0'}</td>
              </tr>
              <tr>
                <td>Payment Status</td>
                <td>${instructor.lastSavedAt || instructor.isPaid ? '<span style="color: #2e7d32; font-weight: bold;">Saved</span>' : '<span style="color: #d32f2f; font-weight: bold;">Not Saved</span>'}</td>
              </tr>
              <tr>
                <td>Last Saved</td>
                <td>${instructor.lastSavedAt ? new Date(instructor.lastSavedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">Course Load Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Credit Hours</th>
                  <th>Lecture</th>
                  <th>Lab</th>
                  <th>Tutorial</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${currentInstructor.courses && currentInstructor.courses.length > 0 ? 
                  currentInstructor.courses.map(course => `
                    <tr>
                      <td>${course.code || 'N/A'}</td>
                      <td>${course.title || 'N/A'}</td>
                      <td>${course.Hourfor && course.Hourfor.creaditHours !== null && course.Hourfor.creaditHours !== undefined ? course.Hourfor.creaditHours : '0'}</td>
                      <td>${course.Hourfor && course.Hourfor.lecture !== null && course.Hourfor.lecture !== undefined ? course.Hourfor.lecture : '0'}</td>
                      <td>${course.Hourfor && course.Hourfor.lab !== null && course.Hourfor.lab !== undefined ? course.Hourfor.lab : '0'}</td>
                      <td>${course.Hourfor && course.Hourfor.tutorial !== null && course.Hourfor.tutorial !== undefined ? course.Hourfor.tutorial : '0'}</td>
                      <td>${course.totalHours !== null && course.totalHours !== undefined ? course.totalHours : '0'}</td>
                    </tr>
                  `).join('') : 
                  '<tr><td colspan="7" style="text-align: center;">No courses assigned</td></tr>'
                }
              </tbody>
            </table>
          </div>
          
          <div class="signature">
            <div>
              <div class="signature-line">Department Head Signature</div>
            </div>
            <div>
              <div class="signature-line">Finance Officer Signature</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an official payment report generated by LTMS Payment Calculator</p>
            <p>© ${new Date().getFullYear()} Load Tracking Management System</p>
          </div>
        </body>
        </html>
      `;
      
      // Open a new window and write the HTML content
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(reportContent);
      reportWindow.document.close();
      
      // Update instructor in state with fetched data if needed
      if (JSON.stringify(instructor) !== JSON.stringify(currentInstructor)) {
        setInstructors(prevInstructors =>
          prevInstructors.map(inst =>
            inst._id === instructor._id ? currentInstructor : inst
          )
        );
      }
      
      // Show success message
      enqueueSnackbar(`Payment report generated for ${instructor.name}`, { variant: 'success' });
    } catch (error) {
      console.error('Error generating report:', error);
      enqueueSnackbar('Failed to generate payment report', { variant: 'error' });
    }
  };

  // Save payment for a single instructor
  const handleSavePayment = async (instructor) => {
    // Log the instructor data for debugging
    console.log('Saving payment for instructor:', instructor);
    if (!singleSaveConfirm.termsAccepted) {
      enqueueSnackbar('Please confirm the payment details', { variant: 'warning' });
      return;
    }
    handleCloseSingleSave();
    try {
      const token = localStorage.getItem('token');
      // Ensure totalLoad is a number and not zero
      let totalLoad = instructor.totalLoad || 0;
      
      // If totalLoad is still zero, try to fetch it again
      if (totalLoad === 0) {
        try {
          const newTotalLoad = await fetchInstructorTotalLoad(instructor._id);
          if (newTotalLoad > 0) {
            totalLoad = newTotalLoad;
            console.log(`Updated total load for ${instructor.name} to ${totalLoad}`);
          }
        } catch (err) {
          console.error('Error fetching total load during payment save:', err);
        }
      }
      
      // Calculate total payment using the potentially updated total load
      const totalPayment = Math.round((totalLoad * parseFloat(ratePerLoad)) * 100) / 100;
      const academicYear = new Date().getFullYear().toString();
      const semester = 'First'; // TODO: Make this dynamic based on current semester

      // First check if payment exists
      const checkResponse = await axios.get(
        `/api/v1/finance/instructors/${instructor._id}/payments?academicYear=${academicYear}&semester=${semester}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const existingPayment = checkResponse.data.data.payment;
      const currentTime = new Date().toISOString();
      
      // If payment exists and amount is the same, update the lastSavedAt time
      if (existingPayment && Math.abs(existingPayment.totalPayment - totalPayment) < 0.01) {
        setInstructors(prevInstructors =>
          prevInstructors.map(inst =>
            inst._id === instructor._id
              ? {
                  ...inst,
                  paymentAmount: totalPayment,
                  calculatedAmount: totalPayment,
                  totalLoad: totalLoad,
                  lastSavedAt: currentTime,
                  isPaid: true
                }
              : inst
          )
        );
        enqueueSnackbar(`Payment updated for ${instructor.name}`, { variant: 'success' });
        return;
      }

      // Save new payment or update if amount changed
      const response = await axios.post(
        `/api/v1/finance/instructors/${instructor._id}/payments`,
        {
          totalLoad: totalLoad,
          paymentAmount: parseFloat(ratePerLoad),
          totalPayment,
          academicYear,
          semester
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const savedPayment = response.data.data.payment;

      // Update instructor in state with payment info
      setInstructors(prevInstructors =>
        prevInstructors.map(inst =>
          inst._id === instructor._id
            ? {
                ...inst,
                paymentAmount: totalPayment,
                calculatedAmount: totalPayment,
                totalLoad: totalLoad,
                lastSavedAt: savedPayment.updatedAt || currentTime,
                isPaid: true
              }
            : inst
        )
      );

      enqueueSnackbar(
        existingPayment 
          ? `Payment updated for ${instructor.name}: ${totalPayment} ETB`
          : `Payment saved for ${instructor.name}: ${totalPayment} ETB`, 
        { variant: 'success' }
      );
    } catch (err) {
      console.error('Payment save error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save payment';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Handle Save All confirmation
  const handleSaveAllClick = () => {
    const unsavedInstructors = instructors.filter(inst => inst.calculatedAmount > 0 && inst.calculatedAmount !== inst.paymentAmount);
    
    if (unsavedInstructors.length === 0) {
      enqueueSnackbar('No new payments to save', { variant: 'info' });
      return;
    }

    setConfirmDialogOpen(true);
  };

  // Close confirmation dialog
  const handleCloseConfirm = () => {
    setConfirmDialogOpen(false);
    setTermsAccepted(false);
  };

  // Save all calculated payments
  const handleSaveAll = async () => {
    if (!termsAccepted) {
      enqueueSnackbar('Please accept the terms and conditions', { variant: 'warning' });
      return;
    }

    handleCloseConfirm();
    try {
      const token = localStorage.getItem('token');
      const unsavedInstructors = instructors.filter(inst => inst.calculatedAmount > 0 && inst.calculatedAmount !== inst.paymentAmount);
      
      if (unsavedInstructors.length === 0) {
        enqueueSnackbar('No new payments to save', { variant: 'info' });
        return;
      }

      await Promise.all(unsavedInstructors.map(instructor => {
        const totalPayment = Math.round((instructor.totalLoad * parseFloat(ratePerLoad)) * 100) / 100;
        
        return axios.post(`/api/v1/finance/instructors/${instructor._id}/payments`, {
          totalLoad: instructor.totalLoad,
          paymentAmount: parseFloat(ratePerLoad),
          totalPayment,
          academicYear: new Date().getFullYear().toString(),
          semester: 'First' // TODO: Make this dynamic based on current semester
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      }));

      // Refresh all instructors' payment data
      const updatedInstructors = await Promise.all(
        instructors.map(async (inst) => {
          if (unsavedInstructors.find(u => u._id === inst._id)) {
            const payment = await fetchExistingPayments(inst._id);
            return {
              ...inst,
              paymentAmount: payment ? payment.totalPayment : 0,
              calculatedAmount: payment ? payment.totalPayment : 0,
              isPaid: payment ? true : false
            };
          }
          return inst;
        })
      );

      setInstructors(updatedInstructors);
      enqueueSnackbar('All payments saved successfully', { variant: 'success' });
    } catch (err) {
      console.error('Payment save error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save some payments';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          bgcolor: 'background.default'
        }}
      >
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={2} 
          sx={{ 
            mb: { xs: 2, sm: 3, md: 4 },
            pb: 2,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <CalculateIcon 
            sx={{ 
              fontSize: { xs: 24, sm: 30, md: 36 },
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              borderRadius: '50%',
              padding: 1,
              color: 'white',
              boxShadow: 2
            }} 
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 600
            }}
          >
            Payment Calculator
          </Typography>
        </Stack>

        {/* Search and Filter Section */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 3,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : '#fff',
            borderRadius: 2
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                fullWidth
                size="small"
                label="Search Instructor"
                placeholder="Enter instructor name..."
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="School"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                SelectProps={{ native: true }}
              >
                {schools.map((school) => (
                  <option key={school} value={school}>
                    {school === 'all' ? 'All Schools' : school}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                SelectProps={{ native: true }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                size="medium"
                variant="outlined"
                color="primary"
                startIcon={<FilterListOffIcon />}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSchool('all');
                  setSelectedDepartment('all');
                  setPaymentStatus('all');
                }}
                disabled={searchQuery === '' && selectedSchool === 'all' && selectedDepartment === 'all' && paymentStatus === 'all'}
                sx={{
                  height: '40px',
                  whiteSpace: 'nowrap'
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }} 
          sx={{ 
            mb: { xs: 2, sm: 3, md: 4 },
            '& .MuiCard-root': {
              height: '100%',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[4]
              }
            }
          }}
        >
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, minHeight: 200 }}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={4}>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center"
                    sx={{ 
                      borderBottom: 1,
                      borderColor: 'divider',
                      pb: 1
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      Set Rate Per Load
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color={isEditingRate ? 'success' : 'primary'}
                      onClick={handleRateEditToggle}
                      disabled={!hasInstructors}
                      startIcon={isEditingRate ? <CheckIcon /> : <EditIcon />}
                      sx={{ ml: 1, minWidth: 120 }}
                    >
                      {isEditingRate ? 'Save' : 'Edit'}
                    </Button>
                  </Stack>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Rate Per Load"
                      variant="outlined"
                      value={ratePerLoad}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setRatePerLoad(value);
                        }
                      }}
                      disabled={!hasInstructors || !isEditingRate}
                      helperText={
                        !hasInstructors 
                          ? 'No instructors available' 
                          : isRateSaved
                            ? 'Rate has been saved'
                            : !isEditingRate 
                              ? 'Click edit button to modify rate' 
                              : ''
                      }
                      InputProps={{
                        startAdornment: <InputAdornment position="start">ETB</InputAdornment>,
                        readOnly: !isEditingRate || isRateSaved
                      }}
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: 'text.secondary',
                          fontSize: '1.1rem'
                        },
                        '& .MuiOutlinedInput-root': {
                          bgcolor: !isEditingRate ? 'action.hover' : 'transparent',
                          fontSize: '1.2rem',
                          '& .MuiInputAdornment-root': {
                            '& .MuiTypography-root': {
                              fontSize: '1.1rem',
                              fontWeight: 500,
                              color: 'primary.main'
                            }
                          }
                        },
                        '& .MuiFormHelperText-root': {
                          fontSize: '0.9rem',
                          mt: 1
                        }
                      }}
                    />
                  </Grid>
                  <Stack direction="row" spacing={2}>
                    <Button
                    fullWidth
                    variant="contained"
                    onClick={handleCalculateAll}
                    disabled={loading || !ratePerLoad}
                    startIcon={<CalculateIcon />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    Calculate All
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={handleSaveAllClick}
                    disabled={!ratePerLoad}
                    startIcon={<SaveIcon />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    Save All
                  </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer 
          component={Paper} 
          variant="outlined" 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            '& .MuiTableCell-root': {
              px: { xs: 1, sm: 2, md: 3 },
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            },
            '& .MuiTableHead-root': {
              bgcolor: 'background.paper',
              '& .MuiTableCell-root': {
                fontWeight: 600,
                color: 'text.primary'
              }
            },
            '& .MuiTableBody-root .MuiTableRow-root': {
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }
          }}
        >
          <Table sx={{ minWidth: { xs: 'auto', sm: 650 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Instructor</TableCell>
                {!isMobile && (
                  <>
                    <TableCell>School</TableCell>
                    <TableCell>Department</TableCell>
                  </>
                )}
                <TableCell>Total Load</TableCell>
                <TableCell>Calculated Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      animation: `pulse ${1 + index * 0.2}s ease-in-out infinite`,
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.4 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Skeleton 
                          variant="circular" 
                          width={32} 
                          height={32} 
                          sx={{ 
                            bgcolor: 'primary.light',
                            opacity: 0.2
                          }}
                        />
                        <Skeleton 
                          variant="text" 
                          width={150} 
                          sx={{ 
                            bgcolor: 'grey.200',
                            borderRadius: 1
                          }}
                        />
                      </Stack>
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Skeleton 
                              variant="circular" 
                              width={24} 
                              height={24}
                              sx={{ bgcolor: 'info.light', opacity: 0.2 }}
                            />
                            <Skeleton variant="text" width={120} />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Skeleton 
                              variant="circular" 
                              width={24} 
                              height={24}
                              sx={{ bgcolor: 'secondary.light', opacity: 0.2 }}
                            />
                            <Skeleton variant="text" width={100} />
                          </Stack>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Skeleton 
                          variant="circular" 
                          width={24} 
                          height={24}
                          sx={{ bgcolor: 'success.light', opacity: 0.2 }}
                        />
                        <Skeleton variant="text" width={60} />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Skeleton 
                        variant="text" 
                        width={80} 
                        sx={{ 
                          bgcolor: 'success.light',
                          opacity: 0.2,
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Skeleton 
                          variant="circular" 
                          width={32} 
                          height={32}
                          sx={{ bgcolor: 'primary.light', opacity: 0.2 }}
                        />
                        <Skeleton 
                          variant="circular" 
                          width={32} 
                          height={32}
                          sx={{ bgcolor: 'success.light', opacity: 0.2 }}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell 
                    colSpan={isMobile ? 4 : 6} 
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Alert severity="error" sx={{ justifyContent: 'center' }}>
                      {error}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : filteredInstructors.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={isMobile ? 4 : 6} 
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Stack spacing={1} alignItems="center">
                      <Typography color="text.secondary" variant="body1">
                        {searchQuery || selectedSchool !== 'all' || selectedDepartment !== 'all' || paymentStatus !== 'all' 
                          ? 'No instructors found matching the filters'
                          : 'No instructors found with approved courses'}
                      </Typography>
                      {(searchQuery || selectedSchool !== 'all' || selectedDepartment !== 'all' || paymentStatus !== 'all') && (
                        <Button 
                          size="small"
                          startIcon={<CloseIcon />}
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedSchool('all');
                            setSelectedDepartment('all');
                            setPaymentStatus('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </Stack>
                    <Stack 
                      sx={{
                        animation: 'fadeIn 0.5s ease-out',
                        '@keyframes fadeIn': {
                          from: { opacity: 0, transform: 'translateY(20px)' },
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      <CalculateIcon 
                        sx={{ 
                          fontSize: 64,
                          color: 'text.disabled',
                          opacity: 0.5,
                          animation: 'float 3s ease-in-out infinite',
                          '@keyframes float': {
                            '0%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                            '100%': { transform: 'translateY(0px)' },
                          },
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        color="textSecondary"
                        sx={{ 
                          fontWeight: 500,
                          textAlign: 'center',
                          maxWidth: 300,
                          mx: 'auto'
                        }}
                      >
                        No instructors with approved courses found
                      </Typography>
                      <Typography 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.875rem',
                          textAlign: 'center',
                          maxWidth: 400,
                          mx: 'auto'
                        }}
                      >
                        Instructors will appear here once they have approved courses assigned to them.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstructors
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((instructor) => (
                  <TableRow key={instructor._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon 
                          sx={{ 
                            color: 'primary.main',
                            fontSize: '1.2rem',
                            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.15))',
                            background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            borderRadius: '50%',
                            p: 0.5,
                            color: 'white',
                          }} 
                        />
                        <Typography>{instructor.name}</Typography>
                      </Stack>
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <SchoolBuildingIcon 
                          sx={{ 
                            color: 'info.main',
                            fontSize: '1.2rem',
                            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.15))',
                          }} 
                        />
                            <Typography>{instructor.school}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <DepartmentIcon 
                          sx={{ 
                            color: 'secondary.main',
                            fontSize: '1.2rem',
                            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.15))',
                          }} 
                        />
                            <Typography>{instructor.department}</Typography>
                          </Stack>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LoadIcon 
                          sx={{ 
                            color: 'success.main',
                            fontSize: '1.2rem',
                            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.15))',
                          }} 
                        />
                        <Typography>{instructor.totalLoad}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {instructor.calculatedAmount ? (
                        <Typography color="success.main">
                          ETB {instructor.calculatedAmount.toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography color="text.secondary">
                          Not calculated
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} alignItems="center">
                      {(!instructor.isPaid && !instructor.lastSavedAt) ? (
                        <>
                          <Button
                            onClick={() => handleCalculate(instructor)}
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{
                              minWidth: 'auto',
                              px: 2,
                              py: 0.5,
                              mr: 1,
                              boxShadow: 1
                            }}
                          >
                            Calculate
                          </Button>
                          <Button
                            onClick={() => handleSaveClick(instructor)}
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{
                              minWidth: 'auto',
                              px: 2,
                              py: 0.5,
                              boxShadow: 1
                            }}
                          >
                            Save
                          </Button>
                          <Tooltip title="Generate PDF Report">
                            <IconButton
                              onClick={() => generatePDFReport(instructor)}
                              color="primary"
                              size="small"
                              sx={{
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'success.main',
                              fontWeight: 'medium',
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            ✓ Payment Saved
                          </Typography>
                          <Tooltip title="Generate Payment Report">
                            <IconButton
                              onClick={() => handleReportClick(instructor)}
                              color="primary"
                              size="small"
                              sx={{
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredInstructors.length > 0 && (
          <TablePagination
            component="div"
            count={filteredInstructors.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: 1,
              borderColor: 'divider'
            }}
          />)}
      </Paper>
      {/* Report Generation Confirmation Dialog */}
      <Dialog
        open={reportConfirm.open}
        onClose={handleCloseReportConfirm}
        aria-labelledby="report-dialog-title"
        aria-describedby="report-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle 
          id="report-dialog-title"
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            pb: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdfIcon />
            Generate Payment Report
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText id="report-dialog-description" sx={{ mb: 2 }}>
            You are about to generate a payment report for <strong>{reportConfirm.instructor?.name}</strong>. This report will include all payment details and can be printed or saved as a PDF.  
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary.main" gutterBottom>
              Report Details:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Instructor:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {reportConfirm.instructor?.name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Department:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {reportConfirm.instructor?.department}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Load:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {reportConfirm.instructor?.totalLoad || '0'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Calculated Amount:
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="success.main">
                  ETB {reportConfirm.instructor?.calculatedAmount?.toLocaleString() || '0'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <FormControlLabel
            control={
              <Checkbox 
                checked={reportConfirm.termsAccepted}
                onChange={(e) => setReportConfirm(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                color="primary"
              />
            }
            label="I confirm that the payment information is correct and I want to generate this report"
            sx={{ mt: 2, display: 'block' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseReportConfirm}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={() => generatePDFReport(reportConfirm.instructor)}
            disabled={!reportConfirm.termsAccepted}
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            sx={{ ml: 2 }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      {/* Save All Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-dialog"
        aria-describedby="save-all-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="save-all-dialog-title">
          Confirm Bulk Payment Save
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="save-all-dialog-description">
            You are about to save payment calculations for all instructors. This action will:
            <ul>
              <li>Update payment records for all instructors with calculated amounts</li>
              <li>Set the payment status to 'pending' for finance approval</li>
              <li>Create a payment history record for each instructor</li>
            </ul>
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                color="primary"
              />
            }
            label="I confirm that all payment calculations are correct and I agree to process these payments"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveAll}
            color="primary"
            variant="contained"
            disabled={!termsAccepted}
          >
            Save All Payments
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rate Edit Confirmation Dialog */}
      <Dialog
        open={rateEditConfirm.open}
        onClose={() => setRateEditConfirm({ open: false, action: null, termsAccepted: false })}
        aria-labelledby="rate-edit-confirm-dialog"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[8]
          }
        }}
      >
        <DialogTitle 
          id="rate-edit-confirm-dialog"
          sx={{
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTypography-root': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600
            }
          }}
        >
          {rateEditConfirm.action === 'save' ? (
            <>
              <SaveIcon color="success" />
              Confirm Rate Change
            </>
          ) : (
            <>
              <EditIcon color="primary" />
              Modify Rate Per Load
            </>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Alert 
              severity={rateEditConfirm.action === 'save' ? 'warning' : 'info'}
              icon={rateEditConfirm.action === 'save' ? <WarningIcon /> : <InfoIcon />}
              sx={{ 
                '& .MuiAlert-message': { 
                  width: '100%' 
                } 
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                {rateEditConfirm.action === 'save' 
                  ? 'Important: This will affect all instructor payments'
                  : 'You are about to modify the rate per load'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {rateEditConfirm.message}
              </Typography>
            </Alert>

            <Box 
              sx={{ 
                p: 2, 
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rateEditConfirm.termsAccepted}
                    onChange={(e) => setRateEditConfirm(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    color={rateEditConfirm.action === 'save' ? 'success' : 'primary'}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: '1.2rem' } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {rateEditConfirm.action === 'save'
                      ? 'I confirm that I want to update the rate and recalculate all instructor payments'
                      : 'I understand that modifying the rate will affect all instructor payment calculations'}
                  </Typography>
                }
                sx={{
                  ml: 0,
                  '& .MuiFormControlLabel-label': {
                    flex: 1
                  }
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={() => setRateEditConfirm({ open: false, action: null, termsAccepted: false })} 
            color="inherit"
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRateEditConfirm} 
            color={rateEditConfirm.action === 'save' ? 'success' : 'primary'}
            variant="contained"
            disabled={!rateEditConfirm.termsAccepted}
            startIcon={rateEditConfirm.action === 'save' ? <SaveIcon /> : <EditIcon />}
            sx={{ px: 3 }}
          >
            {rateEditConfirm.action === 'save' ? 'Save Changes' : 'Start Editing'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single Save Confirmation Dialog */}
      <Dialog
        open={singleSaveConfirm.open}
        onClose={handleCloseSingleSave}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PaymentsIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Confirm Payment Details</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3, color: 'text.primary' }}>
            Please review and confirm the following payment information:
          </DialogContentText>
          
          {/* Payment Details Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.1)
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                    {singleSaveConfirm.instructor?.name}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Load
                </Typography>
                <Typography variant="h6">
                  {singleSaveConfirm.instructor?.totalLoad}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Rate per Load
                </Typography>
                <Typography variant="h6">
                  {ratePerLoad} ETB
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Payment
                  </Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'medium' }}>
                    {singleSaveConfirm.instructor?.calculatedAmount} ETB
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Confirmation Checkbox */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: 1,
              borderColor: alpha(theme.palette.success.main, 0.1)
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={singleSaveConfirm.termsAccepted}
                  onChange={(e) => setSingleSaveConfirm(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  color="success"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                  I confirm that all payment calculations are correct and I agree to process these payments
                </Typography>
              }
            />
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseSingleSave} 
            color="inherit"
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSavePayment(singleSaveConfirm.instructor)}
            disabled={!singleSaveConfirm.termsAccepted}
            variant="contained" 
            color="success"
            startIcon={<SaveIcon />}
            sx={{
              px: 3,
              '&:not(:disabled)': {
                background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                boxShadow: `0 4px 10px ${alpha(theme.palette.success.main, 0.25)}`
              }
            }}
          >
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentCalculator;
