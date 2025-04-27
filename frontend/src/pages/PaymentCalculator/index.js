import React, { useState, useEffect, useCallback } from 'react';
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
  InputAdornment,
  Avatar,
  CircularProgress
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
  Check as CheckIcon,
  Business as DepartmentIcon,
  AccountBalance as SchoolBuildingIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  WorkOutline as LoadIcon,
  FilterListOff as FilterListOffIcon,
  PictureAsPdf as PdfIcon,
  Description as ReportIcon,
  Print as PrintIcon
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [instructors, setInstructors] = useState([]); // Each instructor will have: totalLoad, calculatedAmount, paymentAmount, lastSavedAt
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
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
      const response = await axios.get(`/api/v1/finance/instructors/${instructorId}/payments`, {
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
        const response = await axios.get('/api/v1/courses/approved-instructors', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        // Transform the data to include payment fields
        const instructorsWithPayment = await Promise.all(
          response.data.data.map(async (instructor) => {
            const payment = await fetchExistingPayments(instructor._id);
            return {
              ...instructor,
              school: instructor.school || 'N/A',
              department: instructor.department || 'N/A',
              paymentAmount: payment ? payment.totalPayment : 0,
              calculatedAmount: payment ? payment.totalPayment : 0
            };
          })
        );
        
        setInstructors(instructorsWithPayment);
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

  // Calculate payment for an instructor
  const handleCalculate = (instructor) => {
    if (!ratePerLoad) {
      enqueueSnackbar('Please enter a rate per load', { variant: 'warning' });
      return;
    }

    try {
      const calculatedAmount = Math.round((instructor.totalLoad * parseFloat(ratePerLoad)) * 100) / 100;
      
      setInstructors(prev => prev.map(inst => {
        if (instructor._id === inst._id) {
          return {
            ...inst,
            calculatedAmount,
            paymentAmount: 0 // Reset payment amount since it needs to be saved
          };
        }
        return inst;
      }));

      enqueueSnackbar(`Calculated payment for ${instructor.name}: ${calculatedAmount} ETB`, { 
        variant: 'info',
        autoHideDuration: 3000
      });
    } catch (err) {
      console.error('Error calculating payment:', err);
      enqueueSnackbar('Failed to calculate payment', { variant: 'error' });
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

    const totalPayments = instructors.map(instructor => ({
      ...instructor,
      calculatedAmount: calculatePayment(instructor.totalLoad, rate)
    }));

    setInstructors(totalPayments);
    setIsRateSaved(true);
    setIsEditingRate(false);
    enqueueSnackbar('Payment calculations updated successfully', { variant: 'success' });
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
  
  // Handle report generation for an instructor
  const handleGenerateReport = useCallback((instructor) => {
    setSelectedInstructor(instructor);
    setReportDialogOpen(true);
  }, []);
  
  // Generate and download the report
  const generateReport = useCallback(async () => {
    if (!selectedInstructor) return;
    
    try {
      setReportGenerating(true);
      
      // Simulate fetching additional data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format date for the report
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const academicYear = `${today.getFullYear()}-${today.getFullYear() + 1}`;
      const semester = today.getMonth() < 6 ? 'Spring' : 'Fall';
      const documentId = `FIN-${today.getFullYear()}-${String(selectedInstructor._id).substring(0, 6)}`;
      
      // Calculate payment details with fallbacks for null values
      const basePayment = selectedInstructor.calculatedAmount || 0;
      const taxAmount = (basePayment * 0.15).toFixed(2);
      const pensionAmount = (basePayment * 0.07).toFixed(2);
      const netPayment = (basePayment * 0.78).toFixed(2);
      
      // Get course data from the instructor's courses
      let coursesData = [];
      
      if (selectedInstructor.courses && selectedInstructor.courses.length > 0) {
        coursesData = selectedInstructor.courses;
      } else if (selectedInstructor.courseDetails && selectedInstructor.courseDetails.length > 0) {
        // Try to get course details from courseDetails property if available
        coursesData = selectedInstructor.courseDetails;
      } else {
        // Fallback to mock data if no courses are available
        coursesData = [
          { code: 'CS101', title: 'Introduction to Programming', creditHours: 3, lectureHours: 3, labHours: 2, tutorialHours: 1, hours: 6 },
          { code: 'CS201', title: 'Data Structures', creditHours: 4, lectureHours: 3, labHours: 2, tutorialHours: 1, hours: 6 },
          { code: 'CS301', title: 'Algorithms', creditHours: 3, lectureHours: 3, labHours: 0, tutorialHours: 1, hours: 4 }
        ];
      }
      
      // Create HTML content for the report
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Report - ${selectedInstructor.name}</title>
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
              border-bottom: 2px solid #003366;
              padding-bottom: 20px;
            }
            .university-name {
              color: #003366;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .report-title {
              font-size: 18px;
              margin: 10px 0;
            }
            .report-meta {
              color: #666;
              font-size: 12px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              color: #003366;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              font-size: 16px;
              font-weight: bold;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-top: 10px;
            }
            .info-item {
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th {
              background-color: #003366;
              color: white;
              text-align: left;
              padding: 8px;
            }
            td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .payment-status {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 4px;
              font-weight: bold;
              margin-top: 10px;
            }
            .status-approved {
              background-color: #e6f7e6;
              color: #008000;
              border: 1px solid #008000;
            }
            .status-pending {
              background-color: #fff4e5;
              color: #ff8c00;
              border: 1px solid #ff8c00;
            }
            .signatures {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 50px;
              margin-top: 40px;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 40px;
              padding-top: 5px;
              text-align: center;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
              font-size: 11px;
              color: #666;
              text-align: center;
            }
            .document-id {
              font-family: monospace;
              margin-top: 5px;
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
              background-color: #003366;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              margin-bottom: 20px;
              font-weight: bold;
            }
            .print-button:hover {
              background-color: #002244;
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print();">Print Report</button>
          
          <div class="header">
            <p class="university-name">DIRE DAWA UNIVERSITY</p>
            <p class="report-title">OFFICIAL INSTRUCTOR PAYMENT REPORT</p>
            <p class="report-meta">Generated on: ${formattedDate} | Reference: ${documentId}</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">INSTRUCTOR INFORMATION</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name:</span> ${selectedInstructor.name}
              </div>
              <div class="info-item">
                <span class="info-label">ID:</span> ${selectedInstructor._id}
              </div>
              <div class="info-item">
                <span class="info-label">Department:</span> ${selectedInstructor.department || selectedInstructor.departmentName || 'N/A'}
              </div>
              <div class="info-item">
                <span class="info-label">School:</span> ${selectedInstructor.school || selectedInstructor.schoolName || 'N/A'}
              </div>
              <div class="info-item">
                <span class="info-label">Academic Year:</span> ${academicYear}
              </div>
              <div class="info-item">
                <span class="info-label">Semester:</span> ${semester}
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">PAYMENT DETAILS</h2>
            <table>
              <tr>
                <th>Description</th>
                <th>Value</th>
              </tr>
              <tr>
                <td>Total Teaching Load</td>
                <td>${selectedInstructor.totalLoad || 0} hours</td>
              </tr>
              <tr>
                <td>Rate per Load</td>
                <td>${ratePerLoad} ETB</td>
              </tr>
              <tr>
                <td>Base Payment</td>
                <td>${basePayment} ETB</td>
              </tr>
              <tr>
                <td>Tax (15%)</td>
                <td>${taxAmount} ETB</td>
              </tr>
              <tr>
                <td>Pension (7%)</td>
                <td>${pensionAmount} ETB</td>
              </tr>
              <tr>
                <td><strong>Net Payment</strong></td>
                <td><strong>${netPayment} ETB</strong></td>
              </tr>
            </table>
            
            <div class="payment-status ${(selectedInstructor.paymentAmount > 0 || selectedInstructor.calculatedAmount > 0) ? 'status-approved' : 'status-pending'}">
              Payment Status: ${(selectedInstructor.paymentAmount > 0 || selectedInstructor.calculatedAmount > 0) ? 'APPROVED' : 'PENDING'}
            </div>
            
            ${selectedInstructor.lastSavedAt ? `<p style="color: #666; font-size: 12px;">Last Updated: ${new Date(selectedInstructor.lastSavedAt).toLocaleString()}</p>` : ''}
          </div>
          
          <div class="section">
            <h2 class="section-title">COURSE BREAKDOWN</h2>
            <table>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Credit Hours</th>
                <th>Lecture Hours</th>
                <th>Lab Hours</th>
                <th>Tutorial Hours</th>
                <th>Total Hours</th>
              </tr>
              ${coursesData.map(course => `
                <tr>
                  <td>${course.code || course.courseCode || 'N/A'}</td>
                  <td>${course.title || course.courseName || course.courseTitle || 'N/A'}</td>
                  <td>${course.creditHours || course.credits || '0'}</td>
                  <td>${course.lectureHours || course.lecture || '0'}</td>
                  <td>${course.labHours || course.lab || '0'}</td>
                  <td>${course.tutorialHours || course.tutorial || '0'}</td>
                  <td>${course.hours || course.totalHours || course.teachingLoad || '0'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div class="signatures">
            <div>
              <div class="signature-line">Finance Officer</div>
            </div>
            <div>
              <div class="signature-line">Department Head</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an official payment document generated by the Load Tracking Management System.</p>
            <p>Payment is subject to verification of teaching load and approval by department and finance officials.</p>
            <p class="document-id">Document ID: ${selectedInstructor._id}-${today.getTime().toString().substring(0, 6)}</p>
          </div>
        </body>
        </html>
      `;
      
      // Open the report in a new window
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(reportHtml);
      reportWindow.document.close();
      
      // In a real implementation, you would also save this report to the database
      // and update the instructor's record to show that a report was generated
      
      // Simulate API call to record report generation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      enqueueSnackbar(`Payment report for ${selectedInstructor.name} generated successfully`, { variant: 'success' });
      setReportDialogOpen(false);
      setSelectedInstructor(null);
    } catch (error) {
      console.error('Error generating report:', error);
      enqueueSnackbar('Failed to generate payment report', { variant: 'error' });
    } finally {
      setReportGenerating(false);
    }
  }, [selectedInstructor, ratePerLoad, enqueueSnackbar]);

  // Open confirmation for single save
  const handleSaveClick = (instructor) => {
    setSingleSaveConfirm({ open: true, instructor, termsAccepted: false });
  };

  // Close single save confirmation
  const handleCloseSingleSave = () => {
    setSingleSaveConfirm({ open: false, instructor: null, termsAccepted: false });
  };

  // Save payment for a single instructor
  const handleSavePayment = async (instructor) => {
    if (!singleSaveConfirm.termsAccepted) {
      enqueueSnackbar('Please confirm the payment details', { variant: 'warning' });
      return;
    }
    handleCloseSingleSave();
    try {
      const token = localStorage.getItem('token');
      const totalPayment = Math.round((instructor.totalLoad * parseFloat(ratePerLoad)) * 100) / 100;
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
      
      // If payment exists and amount is the same, no need to save
      if (existingPayment && Math.abs(existingPayment.totalPayment - totalPayment) < 0.01) {
        setInstructors(prevInstructors =>
          prevInstructors.map(inst =>
            inst._id === instructor._id
              ? {
                  ...inst,
                  paymentAmount: totalPayment,
                  calculatedAmount: totalPayment,
                  lastSavedAt: existingPayment.updatedAt
                }
              : inst
          )
        );
        enqueueSnackbar(`Payment already exists for ${instructor.name}`, { variant: 'info' });
        return;
      }

      // Save new payment or update if amount changed
      const response = await axios.post(
        `/api/v1/finance/instructors/${instructor._id}/payments`,
        {
          totalLoad: instructor.totalLoad,
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
                lastSavedAt: savedPayment.updatedAt || new Date().toISOString(),
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
                      {(!instructor.paymentAmount || instructor.calculatedAmount !== instructor.paymentAmount) ? (
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
                              onClick={() => handleGenerateReport(instructor)}
                              color="secondary"
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                }
                              }}
                            >
                              <ReportIcon fontSize="small" />
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
          />
        )}
      </Paper>
      
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
      
      {/* Single Save Confirmation Dialog */}
      <Dialog
        open={singleSaveConfirm.open}
        onClose={handleCloseSingleSave}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Payment Save
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to save payment calculation for {singleSaveConfirm.instructor?.name}.
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                checked={singleSaveConfirm.termsAccepted}
                onChange={(e) => setSingleSaveConfirm(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                color="primary"
              />
            }
            label="I confirm that this payment calculation is correct"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSingleSave} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => handleSavePayment(singleSaveConfirm.instructor)}
            color="success"
            variant="contained"
            disabled={!singleSaveConfirm.termsAccepted}
          >
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Generation Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => !reportGenerating && setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 5
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReportIcon color="secondary" />
            <Typography variant="h6" component="span">
              Generate Payment Report
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedInstructor && (
            <>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                You are about to generate a payment report for:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  borderColor: 'divider'
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{selectedInstructor.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedInstructor.department} • {selectedInstructor.school}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Divider />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Total Teaching Load
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {selectedInstructor.totalLoad} hours
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Payment Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="500" color="secondary.main">
                        {selectedInstructor.calculatedAmount} ETB
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                This report will include detailed payment information, course breakdown, and official payment documentation.
                The PDF document will include:
              </Typography>
              
              <Box sx={{ pl: 2, mb: 2 }}>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      University letterhead and official formatting
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Complete instructor information and academic details
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Detailed payment calculation including tax and pension deductions
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Comprehensive course breakdown with credit and contact hours
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Signature fields for finance officer and department head
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Unique document ID and verification information
                    </Typography>
                  </li>
                </ul>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                The generated PDF is an official financial document. Please verify all information before sharing.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setReportDialogOpen(false)} 
            color="inherit"
            disabled={reportGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={generateReport}
            variant="contained"
            color="secondary"
            disabled={reportGenerating}
            startIcon={reportGenerating ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
          >
            {reportGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentCalculator;
